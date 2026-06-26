# Roadmap — Lashes & MGlamour Platform

This roadmap defines the milestone target goals, sequencing, and timeline for the end-to-end development of the **Lashes & MGlamour Platform**.

---

## 🗺️ Phases Overview

```mermaid
graph TD
    P1[Phase 1: Setup & Docs] --> P2[Phase 2: Backend & Sync API]
    P2 --> P3[Phase 3: Frontend & Design Tokens]
    P3 --> P4[Phase 4: Integrations & SEO]
    P4 --> P5[Phase 5: Deploy & Production Audit]
```

---

## 📍 Milestones

### Phase 1: Setup, Repository & Documentation Setup (Current)
- [x] Repository initialization with standard Git strategy branching (`main`, `develop`).
- [x] Configure standard files: `.gitignore`, `CONTRIBUTING.md`.
- [x] Save Master Prompt guidelines into `docs/PROMPT_MAESTRO.md`.
- [x] Create project tracking files: `TODO.md`, `PROJECT_STATUS.md`, `ROADMAP.md`.
- [x] Design technical specifications under `docs/` (`BRAND-GUIDE.md`, `API.md`, `DATABASE.md`, `DEPLOYMENT.md`, `SQUARE.md`, `SEO.md`).

### Phase 2: Backend API Engine & Square Connector
- [ ] Initialize Python environment (3.12) with FastAPI.
- [ ] Configure database connectors (PostgreSQL) and database tracking with Alembic migrations.
- [ ] Implement Square SDK integrations for services download and mapping.
- [ ] Set up background synchronizer loops running every 15 minutes (using Redis caching TTL 300s).
- [ ] Implement booking creation, updates, cancellation, and staff availability APIs.
- [ ] Code webhook receivers for Square status events.

### Phase 3: Frontend Development & Design System
- [ ] Analyze the `/designs` assets folder to retrieve typography, colors, and the official logo.
- [ ] Define styling tokens at `src/styles/tokens.ts` (Tailwind configuration).
- [ ] Build key layout sections (`BrandHero`, `PriceCard`, `FAQ`, headers, footers).
- [ ] Configure Astro Content Collections for the blog.
- [ ] Assemble interactive Islands (Booking Calendar Wizard using React Hook Form + TanStack Query).
- [ ] Set up the administration portal to track logs, synchronize catalog manual triggers, and update blogs.

### Phase 4: Integrations, SEO Local & CRO Optimizations
- [ ] Integrate local search schemas (NAP, LocalBusiness JSON-LD, Breadcrumbs).
- [ ] Set up analytics metrics (GA4, GTM, Meta Pixel, WhatsApp floats).
- [ ] Embed Google Maps APIs and Google Reviews slider.
- [ ] Configure automated SEO headers (Title, description, canonicals) dynamically per page.

### Phase 5: Containerization, Deployment & Auditing
- [ ] Configure multi-stage Dockerfiles for Astro and FastAPI.
- [ ] Compose `docker-compose.yml` for database, cache, proxy (Nginx), and microservices.
- [ ] Write GitHub Actions for automated linting, checking, building, and deployments.
- [ ] Run security audits (CORS, Rate limits, JWT validations) and performance tests (Core Web Vitals 100/100).
