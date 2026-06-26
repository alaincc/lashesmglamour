# TODO List — Lashes & MGlamour Platform

This TODO list acts as a living document to track execution, task ownership, and completion of all requirements outlined in the Master Prompt.

---

## 🗂️ Task Categorization

### 1. ⚙️ Backend (FastAPI + Square Connector)
- [x] Initialize Python project (Python 3.12, Poetry/pip, dev dependencies).
- [x] Configure database layer with **SQLAlchemy 2** and **PostgreSQL** schema models.
- [x] Set up database migration tracking with **Alembic**.
- [x] Configure **Redis** connection for API caching (TTL 300 seconds).
- [x] Set up environment variables validation with **Pydantic v2**.
- [x] Implement Square SDK client (using `httpx Async`).
- [x] Create synchronization service (runs every 15 minutes to fetch Services, Categories, Prices, Availability, Staff, Promo, Images).
- [x] Implement FastAPI endpoints:
  - [x] `GET /services` & `GET /services/{id}`
  - [x] `GET /categories`
  - [x] `GET /staff`
  - [x] `GET /promotions`
  - [x] `GET /availability`
  - [x] `GET /business-hours`
  - [x] `POST /booking`, `PUT /booking`, `DELETE /booking` (Square Engine link).
- [x] Set up webhook listener endpoint to capture Square events:
  - [x] `booking.created`
  - [x] `booking.updated`
  - [x] `booking.canceled`
  - [x] `catalog.updated`
  - [x] `customer.updated`
- [x] Implement Security:
  - [x] Rate limits on public routes.
  - [x] JWT authentication for the administration portal.
  - [x] CORS & Helmet headers configurations.

### 2. 🎨 Visual Identity & Assets (Designs Analysis)
- [x] Analyze `/designs` directory structure and check logo/colors consistency.
- [x] Implement design tokens in `src/styles/tokens.ts` (matching visual guidelines).
- [x] Configure Tailwind CSS settings matching the design system.

### 3. 🌐 Frontend (Astro 7 + Tailwind)
- [x] Initialize Astro 7 project with TypeScript (Strict mode).
- [x] Configure **Astro Content Collections** for Blog.
- [x] Set up **shadcn/ui** and **Framer Motion** for animations.
- [x] Implement global page layouts with SEO best practices.
- [x] Build key components:
  - [x] `BrandHero` (incorporating logo and hero layouts)
  - [x] `BookingButton` / `FloatingBookButton`
  - [x] `ServiceGrid` & `ServiceCard`
  - [x] `PriceCard`
  - [x] `Gallery` / `BeforeAfter` (showcases)
  - [x] `FAQ` (collapsible structure)
  - [x] `InstagramFeed` (Astro Island using TanStack Query)
  - [x] `ReviewCard` / `Google Reviews`
  - [x] `Footer` & `Header`
- [x] Create routing and pages:
  - [x] Home, About, Services (Lashes, Brows, Skin Care, Waxing), Gallery, Reviews, Blog, FAQ, Contact, Book Now.
- [x] Implement interactive dynamic Astro Islands:
  - [x] Booking Calendar wizard (using React Hook Form + TanStack Query + Zod).
  - [x] Floating Call & Book Buttons.
  - [x] Interactive portfolio showcases.
- [x] Build Admin Panel dashboard:
  - [x] Sync control panel, logging status view, API status, blog manager, testimonals manager.

### 4. 📈 SEO, CRO & Analytics
- [x] Configure meta tag headers, Twitter Cards, OpenGraph tags.
- [x] Implement structured data schema scripts (LocalBusiness, FAQ, Breadcrumb, JSON-LD).
- [x] Generate dynamic `sitemap.xml` and `robots.txt` configuration.
- [x] Integrate analytics tags: Google Analytics 4, Meta Pixel, Google Tag Manager.
- [x] Set up Google Business integration (NAP, Google Maps iframe/API, Reviews).

### 5. 🚢 Infrastructure & DevOps
- [x] Create Dockerfiles for:
  - [x] Frontend (Multi-stage build)
  - [x] Backend (Python runtime optimization)
- [x] Write `docker-compose.yml` defining services (Frontend, Backend, Redis, PostgreSQL, Nginx reverse proxy).
- [x] Set up GitHub Actions CI/CD pipeline (Linting, typechecks, deployment).
- [x] Configure Nginx routes, SSL/HTTPS (Let's Encrypt), Cloudflare proxy rules.
- [x] Set up database backup cronjobs and centralized logs auditing.
