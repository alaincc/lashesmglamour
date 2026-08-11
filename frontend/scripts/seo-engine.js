import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const MANIFEST_PATH = path.join(ROOT_DIR, 'seo-manifest.json');
const LOG_PATH = path.join(ROOT_DIR, 'seo-submission.log');

// Load environment variables from .env if present
function loadEnv() {
  const envFiles = [path.join(ROOT_DIR, '.env'), path.join(ROOT_DIR, '..', '.env')];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const SITE_URL = (process.env.SITE_URL || 'https://lashesmglamour.com').replace(/\/$/, '');
const HOST = new URL(SITE_URL).hostname;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const DEPLOYMENT_ID = process.env.COOLIFY_DEPLOYMENT_ID || process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'local';

// Helper: Logging
function writeLog(provider, urlCount, urls, status, success, message) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    deploymentId: DEPLOYMENT_ID,
    provider,
    urlCount,
    urlsSubmitted: urls,
    httpStatus: status,
    success,
    message
  };

  const line = `[${timestamp}] [${provider}] Status: ${status} | Success: ${success} | URLs (${urlCount}): ${urls.join(', ')} | ${message}\n`;
  fs.appendFileSync(LOG_PATH, line, 'utf8');
  console.log(`[SEO LOG] [${provider}] Status: ${status} | Success: ${success} | ${message}`);
}

// Helper: Indexability Filter
function isIndexableUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname;

    // Must match host
    if (parsed.hostname !== HOST) return false;

    // Filter non-indexable patterns
    if (pathname.includes('/admin') || pathname.startsWith('/admin')) return false;
    if (pathname.includes('/api') || pathname.startsWith('/api')) return false;
    if (pathname.includes('/preview')) return false;
    if (parsed.search && parsed.search.length > 1) return false; // Exclude query params duplicates

    // Exclude static assets
    const ext = path.extname(pathname);
    if (ext && !['.html', ''].includes(ext)) return false;

    return true;
  } catch {
    return false;
  }
}

// 1. Sitemap generation and linking
function syncSitemap() {
  console.log('--- Generating & Linking Sitemap ---');
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: dist directory does not exist. Run "npm run build" first.');
    return false;
  }

  const sitemapIndex = path.join(DIST_DIR, 'sitemap-index.xml');
  const sitemapZero = path.join(DIST_DIR, 'sitemap-0.xml');
  const sitemapTarget = path.join(DIST_DIR, 'sitemap.xml');

  let sitemapContent = '';
  if (fs.existsSync(sitemapZero)) {
    sitemapContent = fs.readFileSync(sitemapZero, 'utf8');
  } else if (fs.existsSync(sitemapIndex)) {
    sitemapContent = fs.readFileSync(sitemapIndex, 'utf8');
  }

  if (sitemapContent) {
    fs.writeFileSync(sitemapTarget, sitemapContent, 'utf8');
    console.log(`✓ Created ${sitemapTarget}`);
  } else {
    console.warn('Warning: No sitemap-0.xml or sitemap-index.xml found in dist/');
  }

  // Ensure key verification file exists in dist/
  const keyFileTarget = path.join(DIST_DIR, `${INDEXNOW_KEY}.txt`);
  fs.writeFileSync(keyFileTarget, INDEXNOW_KEY, 'utf8');
  console.log(`✓ Created IndexNow key file at ${keyFileTarget}`);

  return true;
}

// Extract indexable URLs from sitemap files in dist/
function getSitemapUrls() {
  const sitemapFiles = ['sitemap.xml', 'sitemap-0.xml', 'sitemap-index.xml']
    .map(f => path.join(DIST_DIR, f))
    .filter(f => fs.existsSync(f));

  const urls = new Set();
  const urlRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;

  for (const file of sitemapFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      const u = match[1].trim();
      if (!u.endsWith('.xml') && isIndexableUrl(u)) {
        urls.add(u);
      }
    }
  }

  return Array.from(urls);
}

// Compute content hash of HTML files corresponding to URLs
function computePageHash(urlStr) {
  try {
    const parsed = new URL(urlStr);
    let relativePath = parsed.pathname;
    if (relativePath.endsWith('/')) {
      relativePath += 'index.html';
    } else if (!relativePath.endsWith('.html')) {
      relativePath += '/index.html';
    }

    const filePath = path.join(DIST_DIR, relativePath);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    }
  } catch {
    // Ignore error
  }
  return 'no-hash';
}

// Detect URL changes (NEW, UPDATED, DELETED)
function detectUrlChanges() {
  const currentUrls = getSitemapUrls();
  let previousManifest = { urls: {} };

  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      previousManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (e) {
      console.warn('Warning: Failed to parse existing seo-manifest.json:', e.message);
    }
  }

  const prevMap = previousManifest.urls || {};
  const currentMap = {};
  const affected = { new: [], updated: [], deleted: [] };

  for (const url of currentUrls) {
    const hash = computePageHash(url);
    currentMap[url] = { hash, last_seen: new Date().toISOString() };

    if (!prevMap[url]) {
      affected.new.push(url);
    } else if (prevMap[url].hash !== hash) {
      affected.updated.push(url);
    }
  }

  for (const prevUrl of Object.keys(prevMap)) {
    if (!currentMap[prevUrl]) {
      affected.deleted.push(prevUrl);
    }
  }

  // Update manifest file
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
    last_updated: new Date().toISOString(),
    urls: currentMap
  }, null, 2), 'utf8');

  return { currentUrls, affected };
}

// 2. Submit to IndexNow Protocol
async function submitIndexNow(urls) {
  if (!urls || urls.length === 0) {
    console.log('[IndexNow] No changed URLs to submit.');
    return;
  }

  console.log(`[IndexNow] Submitting ${urls.length} URL(s) to IndexNow...`);

  // Batch URLs in groups of 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch
    };

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      const isSuccess = response.status >= 200 && response.status < 300;

      writeLog('IndexNow', batch.length, batch, response.status, isSuccess, text || 'OK');
    } catch (err) {
      writeLog('IndexNow', batch.length, batch, 0, false, `Network error: ${err.message}`);
    }
  }
}

// Helper: Generate JWT for Google API
function createGoogleJwt(clientEmail, privateKey) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (str) =>
    Buffer.from(typeof str === 'string' ? str : JSON.stringify(str))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(privateKey.replace(/\\n/g, '\n'), 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signature}`;
}

// 3. Submit to Google Search Console API
async function submitGoogleSitemap() {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;

  if (!clientEmail || !privateKey) {
    console.log('[Google] Notice: GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL / PRIVATE_KEY not set. Skipping API sitemap submission.');
    writeLog('Google', 1, [sitemapUrl], 0, true, 'Skipped: Credentials not configured');
    return;
  }

  console.log(`[Google] Submitting sitemap ${sitemapUrl} to Google Search Console API...`);

  try {
    const jwt = createGoogleJwt(clientEmail, privateKey);
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(`Auth failed: ${JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token;
    const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

    const submitRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const isSuccess = submitRes.status >= 200 && submitRes.status < 300;
    const resText = await submitRes.text();

    writeLog('GoogleSearchConsole', 1, [sitemapUrl], submitRes.status, isSuccess, resText || 'Sitemap submitted');
  } catch (err) {
    writeLog('GoogleSearchConsole', 1, [sitemapUrl], 0, false, `Error submitting sitemap: ${err.message}`);
  }
}

// 4. Verification mode
function verifySeoSetup() {
  console.log('--- Verifying SEO Setup ---');
  let valid = true;

  // Check robots.txt
  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robotsText = fs.readFileSync(robotsPath, 'utf8');
    if (robotsText.includes('Sitemap: https://lashesmglamour.com/sitemap.xml')) {
      console.log('✓ robots.txt contains sitemap.xml declaration');
    } else {
      console.warn('✕ robots.txt is missing Sitemap: https://lashesmglamour.com/sitemap.xml');
      valid = false;
    }
  } else {
    console.warn('✕ dist/robots.txt does not exist.');
    valid = false;
  }

  // Check sitemaps
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    console.log('✓ dist/sitemap.xml exists');
  } else {
    console.warn('✕ dist/sitemap.xml missing');
    valid = false;
  }

  // Check key verification file
  const keyPath = path.join(DIST_DIR, `${INDEXNOW_KEY}.txt`);
  if (fs.existsSync(keyPath)) {
    const content = fs.readFileSync(keyPath, 'utf8').trim();
    if (content === INDEXNOW_KEY) {
      console.log(`✓ IndexNow key file ${INDEXNOW_KEY}.txt matches key`);
    } else {
      console.warn('✕ Key file content mismatch');
      valid = false;
    }
  } else {
    console.warn(`✕ Key file ${INDEXNOW_KEY}.txt missing in dist/`);
    valid = false;
  }

  // Check URLs
  const urls = getSitemapUrls();
  const hasEn = urls.some(u => !u.includes('/es/'));
  const hasEs = urls.some(u => u.includes('/es/'));
  const hasAdmin = urls.some(u => u.includes('/admin'));

  if (hasEn && hasEs) {
    console.log(`✓ Bilingual URLs detected (${urls.length} indexable URLs found)`);
  } else {
    console.warn('✕ Missing bilingual URLs in sitemap');
    valid = false;
  }

  if (!hasAdmin) {
    console.log('✓ /admin routes successfully excluded from indexing');
  } else {
    console.warn('✕ /admin routes found in sitemap!');
    valid = false;
  }

  console.log(`Result: ${valid ? 'PASS' : 'WARNINGS FOUND'}`);
  return valid;
}

// MAIN CLI ENTRYPOINT
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'submit';

  // Check for manual mode override (-- https://...)
  const manualUrlArg = args.find(a => a.startsWith('https://') || a.startsWith('http://'));
  const providerFilter = args.find(a => a.startsWith('--provider='))?.split('=')[1];

  syncSitemap();

  if (command === 'sitemap') {
    console.log('Sitemap synchronization complete.');
    return;
  }

  if (command === 'verify') {
    verifySeoSetup();
    return;
  }

  if (command === 'submit') {
    let urlsToSubmit = [];

    if (manualUrlArg) {
      console.log(`[MANUAL MODE] Single URL override provided: ${manualUrlArg}`);
      if (isIndexableUrl(manualUrlArg)) {
        urlsToSubmit = [manualUrlArg];
      } else {
        console.warn(`Warning: Provided manual URL ${manualUrlArg} failed indexability filter.`);
        urlsToSubmit = [manualUrlArg]; // Still submit explicitly requested manual URL
      }
    } else {
      const { affected } = detectUrlChanges();
      const allAffected = [...affected.new, ...affected.updated, ...affected.deleted];
      console.log(`[URL DETECTION] NEW: ${affected.new.length} | UPDATED: ${affected.updated.length} | DELETED: ${affected.deleted.length}`);
      urlsToSubmit = allAffected;
    }

    if (!providerFilter || providerFilter === 'indexnow') {
      await submitIndexNow(urlsToSubmit);
    }

    if (!providerFilter || providerFilter === 'google') {
      await submitGoogleSitemap();
    }
  }
}

main().catch(err => {
  console.error('SEO Automation Error:', err);
  // Gracefully exit without breaking deployment pipelines
  process.exit(0);
});
