# PHASE 0 — DISCOVERY: Complete Audit & Strategy Report

**Business**: Lashes & MGlamour  
**Location**: 4095 SW 137th Ave, Suite 3, Miami, FL 33175  
**Core Markets**: West Kendall, Kendall, ZIP 33175, SW 137th Ave, Tamiami, Kendale Lakes  
**Date**: August 2026  

---

## 1. Technical SEO Audit

### [P0] Missing Hreflang Tags for Bilingual Pages
- **Issue**: `Layout.astro` lacks `<link rel="alternate" hreflang="en-US" ... />`, `<link rel="alternate" hreflang="es-US" ... />`, and `x-default` tags.
- **Evidence**: `Layout.astro` L34 renders `<link rel="canonical" href={canonical} />` without any hreflang declarations.
- **Impact**: Search engines cannot establish language equivalence between `/` and `/es/` trees, leading to potential duplicate content penalties or serving English pages to Spanish users in Miami.
- **Recommendation**: Add bidirectional hreflang links dynamically mapping English routes to Spanish equivalents.
- **Files Affected**: `frontend/src/layouts/Layout.astro`, `frontend/src/i18n/utils.ts`
- **Implementation Complexity**: Low

### [P0] Broken Blog Article Links
- **Issue**: Blog cards on `/blog` and `/es/blog` use dummy `href="#"` links.
- **Evidence**: `BlogTemplate.astro` L73: `<a href="#" class="...">`.
- **Impact**: Users and search crawlers cannot access individual blog articles, creating dead-end pages and failing indexing.
- **Recommendation**: Build individual blog post routes (`/blog/[slug]` and `/es/blog/[slug]`) backed by markdown/Astro Content Collections.
- **Files Affected**: `frontend/src/components/templates/BlogTemplate.astro`, `frontend/src/pages/blog/[slug].astro`, `frontend/src/pages/es/blog/[slug].astro`
- **Implementation Complexity**: Medium

### [P0] Missing Dedicated Local Landing Pages
- **Issue**: No dedicated local landing pages exist for core keywords like `Eyelash Extensions in Kendall Miami`.
- **Evidence**: Route tree in `frontend/src/pages/` only contains generic `/services`, `/about`, etc.
- **Impact**: Misses primary commercial search volume in West Kendall (ZIP 33175).
- **Recommendation**: Create high-intent local landing pages: `/eyelash-extensions-kendall-miami/` and `/es/extensiones-de-pestanas-kendall-miami/`.
- **Files Affected**: `frontend/src/pages/eyelash-extensions-kendall-miami.astro`, `frontend/src/pages/es/extensiones-de-pestanas-kendall-miami.astro`
- **Implementation Complexity**: Medium

---

## 2. Content Audit (EN & ES)

### [P0] Inconsistent Pricing Between Hero and Catalog
- **Issue**: `BrandHero.astro` displays `$150+` for Volume Lash Full Set, while `ServicesTemplate.astro` displays `$160` (16000 cents), and Square API returns `$160.0`.
- **Evidence**: `BrandHero.astro` L95 (`$150+`) vs `ServicesTemplate.astro` L16 (`price_cents: 16000`).
- **Impact**: Misleading pricing causes client confusion and friction during booking.
- **Recommendation**: Centralize pricing constants from Square backend API into a single source of truth (`src/config/business.ts` / Square API feed).
- **Files Affected**: `frontend/src/components/BrandHero.astro`, `frontend/src/components/templates/ServicesTemplate.astro`, `frontend/src/components/BookingWizard.tsx`
- **Implementation Complexity**: Low

### [P1] Untranslated Spanish Strings ("WhatsApp Us")
- **Issue**: The Spanish version of `BrandHero.astro` displays "WhatsApp Us" in English instead of "Escríbenos por WhatsApp".
- **Evidence**: `BrandHero.astro` L63: `{lang === "es" ? "WhatsApp Us" : "WhatsApp Us"}`.
- **Impact**: Degrades bilingual user experience and signals artificial translation.
- **Recommendation**: Replace with localized string "Escríbenos por WhatsApp".
- **Files Affected**: `frontend/src/components/BrandHero.astro`, `frontend/src/i18n/ui.ts`
- **Implementation Complexity**: Low

### [P1] Medical & Exaggerated Claims
- **Issue**: Content includes unverified medical claims like "medical-grade adhesives" and "hospital-grade sanitation".
- **Evidence**: `WhyChooseUs.astro` L19, L26.
- **Impact**: Risk of policy violation or legal liability regarding aesthetic services.
- **Recommendation**: Update to verifiable professional terminology: "professional-grade lash products" and "strict professional sanitation protocols".
- **Files Affected**: `frontend/src/components/WhyChooseUs.astro`
- **Implementation Complexity**: Low

---

## 3. Local SEO & Google Maps Audit

### [P0] Unverified Review Claims in UI
- **Issue**: UI displays `"5.0 Rated (120+ Google Reviews)"` without programmatic verification or live Google Places API link.
- **Evidence**: `BrandHero.astro` L76, `GoogleReviews.astro` L6.
- **Impact**: Risk of Google Structured Data guidelines violation if non-verifiable reviews are embedded in JSON-LD.
- **Recommendation**: Flag for client confirmation of exact Google Business Profile review count and rating before rendering static badges.
- **Files Affected**: `frontend/src/components/BrandHero.astro`, `frontend/src/components/GoogleReviews.astro`
- **Implementation Complexity**: Low (Requires Verification)

### [P1] Dual Phone Number Usage
- **Issue**: Site displays two different phone numbers (`+1 786-460-6580` in CTAs, `+1 305-833-0302` in Schema).
- **Evidence**: `Layout.astro` L68: `"telephone": ["+17864606580", "+13058330302"]`.
- **Impact**: Inconsistent NAP (Name, Address, Phone) signals weaken Google Local Pack ranking signals.
- **Recommendation**: Establish `+17864606580` as the Primary NAP Phone and `+13058330302` as Secondary line across Schema, GBP, and website.
- **Files Affected**: `frontend/src/layouts/Layout.astro`, `frontend/src/components/Footer.astro`
- **Implementation Complexity**: Low

---

## 4. Analytics & Conversion Audit

### [P0] Dummy Analytics Tracking IDs
- **Issue**: Analytics scripts in `Layout.astro` use placeholder IDs (`G-XXXXXXXXXX`, `GTM-XXXXXXX`, `XXXXXXXXXXXXXXX`).
- **Evidence**: `Layout.astro` L100, L114, L127.
- **Impact**: Zero actual conversion data or traffic analytics is being captured in GA4/GTM/Meta.
- **Recommendation**: Support environment variables (`PUBLIC_GA_ID`, `PUBLIC_GTM_ID`, `PUBLIC_META_PIXEL_ID`) and conditionally load analytics tags only when valid keys exist.
- **Files Affected**: `frontend/src/layouts/Layout.astro`
- **Implementation Complexity**: Low

---

## 5. Prioritized Implementation Roadmap

| Priority | Task Description | Target Files |
| :--- | :--- | :--- |
| **P0** | Add Bidirectional Hreflang Tags (`en-US`, `es-US`, `x-default`) | `Layout.astro` |
| **P0** | Fix Volume Lash Full Set Price Inconsistency ($160) | `BrandHero.astro`, `ServicesTemplate.astro` |
| **P0** | Fix Untranslated Spanish Strings ("WhatsApp Us") | `BrandHero.astro`, `ui.ts` |
| **P0** | Replace Unverified Medical Claims with Professional Terms | `WhyChooseUs.astro` |
| **P0** | Build Dedicated Local Landings EN & ES | `eyelash-extensions-kendall-miami.astro`, `es/...` |
| **P0** | Fix Blog Article Route Resolution & Dynamic Slug Pages | `blog/[slug].astro`, `BlogTemplate.astro` |
| **P0** | Standardize Primary NAP Phone Number across Schema & Footer | `Layout.astro`, `Footer.astro` |
| **P1** | Add MGlamour Custom Lash Mapping Visual Section | `HomeTemplate.astro`, `ServiceCategoryTemplate.astro` |
| **P1** | Add Dynamic Analytics Environment Variables | `Layout.astro` |
| **P2** | Individual Service Sub-pages (Classic, Hybrid, Volume, Brows, etc.) | `src/pages/services/...` |

---

## 6. Business Data Verification Checklist

- [ ] **Exact Google Review Count & Rating**: Confirm if 120+ reviews / 5.0 rating is current on GBP.
- [ ] **Primary vs Secondary Phone**: Confirm `+1 (786) 460-6580` is primary business line.
- [ ] **Volume Lash Pricing**: Confirm `$160` is the single official price across all booking channels.
- [ ] **Staff / Specialists List**: Confirm staff members beyond Mirta Campus for individual profiles.
