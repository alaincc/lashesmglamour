# TODO List — Lashes & MGlamour Platform

This TODO list acts as a living document to track execution, task ownership, and completion of all requirements outlined in the Master Prompt.

---

## 🗂️ Task Categorization

### 1. ⚙️ Backend (FastAPI + Square Conector)
- [ ] Initialize Python project (Python 3.12, Poetry/pip, dev dependencies).
- [ ] Configure database layer with **SQLAlchemy 2** and **PostgreSQL** schema models.
- [ ] Set up database migration tracking with **Alembic**.
- [ ] Configure **Redis** connection for API caching (TTL 300 seconds).
- [ ] Set up environment variables validation with **Pydantic v2**.
- [ ] Implement Square SDK client (using `httpx Async`).
- [ ] Create synchronization service (runs every 15 minutes to fetch Services, Categories, Prices, Availability, Staff, Promo, Images).
- [ ] Implement FastAPI endpoints:
  - [ ] `GET /services` & `GET /services/{id}`
  - [ ] `GET /categories`
  - [ ] `GET /staff`
  - [ ] `GET /promotions`
  - [ ] `GET /availability`
  - [ ] `GET /business-hours`
  - [ ] `POST /booking`, `PUT /booking`, `DELETE /booking` (Square Engine link).
- [ ] Set up webhook listener endpoint to capture Square events:
  - [ ] `booking.created`
  - [ ] `booking.updated`
  - [ ] `booking.canceled`
  - [ ] `catalog.updated`
  - [ ] `customer.updated`
- [ ] Implement Security:
  - [ ] Rate limits on public routes.
  - [ ] JWT authentication for the administration portal.
  - [ ] CORS & Helmet headers configurations.

### 2. 🎨 Visual Identity & Assets (Designs Analyse)
- [ ] Analyze `/designs` directory structure and check logo/colors consistency.
- [ ] Implement design tokens in `src/styles/tokens.ts` (matching visual guidelines).
- [ ] Configure Tailwind CSS settings matching the design system.

### 3. 🌐 Frontend (Astro 7 + Tailwind)
- [ ] Initialize Astro 7 project with TypeScript (Strict mode).
- [ ] Configure **Astro Content Collections** for Blog.
- [ ] Set up **shadcn/ui** and **Framer Motion** for animations.
- [ ] Implement global page layouts with SEO best practices.
- [ ] Build key components:
  - [ ] `BrandHero` (incorporating logo and hero layouts)
  - [ ] `BookingButton` / `FloatingBookButton`
  - [ ] `ServiceGrid` & `ServiceCard`
  - [ ] `PriceCard`
  - [ ] `Gallery` / `BeforeAfter` (showcases)
  - [ ] `FAQ` (collapsible structure)
  - [ ] `InstagramFeed` (Astro Island using TanStack Query)
  - [ ] `ReviewCard` / `Google Reviews`
  - [ ] `Footer` & `Header`
- [ ] Create routing and pages:
  - [ ] Home, About, Services (Lashes, Brows, Skin Care, Waxing), Gallery, Reviews, Blog, FAQ, Contact, Book Now.
- [ ] Implement interactive dynamic Astro Islands:
  - [ ] Booking Calendar wizard (using React Hook Form + TanStack Query + Zod).
  - [ ] Floating Call & Book Buttons.
  - [ ] Interactive portfolio showcases.
- [ ] Build Admin Panel dashboard:
  - [ ] Sync control panel, logging status view, API status, blog manager, testimonals manager.

### 4. 📈 SEO, CRO & Analytics
- [ ] Configure meta tag headers, Twitter Cards, OpenGraph tags.
- [ ] Implement structured data schema scripts (LocalBusiness, FAQ, Breadcrumb, JSON-LD).
- [ ] Generate dynamic `sitemap.xml` and `robots.txt` configuration.
- [ ] Integrate analytics tags: Google Analytics 4, Meta Pixel, Google Tag Manager.
- [ ] Set up Google Business integration (NAP, Google Maps iframe/API, Reviews).

### 5. 🚢 Infrastructure & DevOps
- [ ] Create Dockerfiles for:
  - [ ] Frontend (Multi-stage build)
  - [ ] Backend (Python runtime optimization)
- [ ] Write `docker-compose.yml` defining services (Frontend, Backend, Redis, PostgreSQL, Nginx reverse proxy).
- [ ] Set up GitHub Actions CI/CD pipeline (Linting, typechecks, deployment).
- [ ] Configure Nginx routes, SSL/HTTPS (Let's Encrypt), Cloudflare proxy rules.
- [ ] Set up database backup cronjobs and centralized logs auditing.
