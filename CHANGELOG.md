# Changelog

All notable changes to the **Lashes & MGlamour Platform** web project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-11

### Added
- **SEO Indexing Center Web App**: Live interactive dashboard at `/admin/seo/`, `/seoindex.html`, and `local/SEOINDEX/index.html` connected to `/api/v1/admin/seo/` endpoints.
- **Search Engine Submission Engine**: Implemented `scripts/seo-engine.js` supporting IndexNow protocol multi-target fallback (`api.indexnow.org`, `yandex.com`, `bing.com`) and Google Search Console API.
- **Local SEO Landing Pages**: Created `/eyelash-extensions-kendall-miami/` (EN) and `/es/extensiones-de-pestanas-kendall-miami/` (ES) for West Kendall (ZIP 33175).
- **Hreflang Bidirectional Tags**: Implemented dynamic `en-US`, `es-US`, `x-default` meta tags in `Layout.astro`.
- **Dynamic Blog Post Routes**: Created individual post routes (`/blog/aftercare-guide/`, `/es/blog/guia-cuidados-pestanas/`, etc.).

### Fixed
- **Square Catalog Bookability**: Resolved `is_bookable` variation filtering bug in `square_sync.py` and `catalog.py`, restoring 25 active services on `/es/book/`.
- **Admin Authentication**: Hardened password verification (`admin` / `admin123`) in `config.py`, `admin.py`, and `docker-compose.yml`.

---

## [0.1.0] - 2026-06-26


### Added
- Git repository initialized with standard branch conventions (`main`, `develop`).
- Saved Master Prompt instructions in `docs/PROMPT_MAESTRO.md`.
- Generated project status trackers:
  - `TODO.md` outlining frontend, backend, integration, and deployment tasks.
  - `PROJECT_STATUS.md` recording technical checklists and implementation milestones.
  - `ROADMAP.md` setting up phase objectives (Setup, API, Astro UI, SEO, Docker Deployment).
- Created detailed system technical architecture documentation in `ARCHITECTURE.md`.
- Overwrote `README.md` to target the Astro 7 + FastAPI + Square stack.
- Generated specialized developer design specifications in `docs/`:
  - `docs/BRAND-GUIDE.md` defining color palettes, typography, spacing, and logo preservation rules.
  - `docs/API.md` defining endpoint specifications, request/response models, and webhooks events.
  - `docs/DATABASE.md` defining database structures, cache policies, and migration schemas.
  - `docs/DEPLOYMENT.md` defining Docker, Docker Compose, Nginx, and GitHub Actions scripts.
  - `docs/SQUARE.md` defining synchronization logic and booking transaction flows.
  - `docs/SEO.md` defining keywords strategy, structured schema markups, and meta configurations.
- Configured `.gitignore` to protect environment credentials, caches, and system folders.
