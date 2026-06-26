# Lashes & MGlamour Platform 🌟

> Enterprise-grade, high-performance web platform for **Lashes & MGlamour** — featuring a modern frontend built with **Astro 7** and a powerful background microservice connector built with **FastAPI** synchronizing automatically with the **Square API**.

---

## 📖 Table of Contents
- [Objective](#-objective)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Documentation Base](#-project-documentation-base)
- [Getting Started](#-getting-started)
- [Design Identity and Rules](#-design-identity-and-rules)
- [Development and Coding Guidelines](#-development-and-coding-guidelines)
- [Git branching Workflow](#-git-branching-workflow)

---

## 🎯 Objective
To construct a premium, production-ready, highly scalable, and extremely fast platform for **Lashes & MGlamour**. The platform is optimized for local SEO, and engineered to drive customer conversions, enabling clients to secure booking appointments in under three clicks.

---

## ✨ Key Features
- **Square API Automated Sync**: Background synchronizer checks catalog, staff, pricing, and availability loops every 15 minutes.
- **FastAPI Core Middleware**: Custom FastAPI microservice handling booking operations, webhooks receiver, security, and cache management.
- **Astro 7 Speed**: Astro static layouts for maximal local SEO speed (100/100 Lighthouse target score) combined with React Islands for booking wizards and dynamic feeds.
- **Brand Guide Guardrails**: Styling generated dynamically from the visual assets located in `/designs` folder.
- **Admin Dashboard**: Control panel for logs auditing, manual catalog synchronizations, testimonials, and blog posts management.

---

## 🏗️ System Architecture

```text
Astro (Frontend Client)
   │
   ▼
FastAPI (Backend Gateway & Business Logic)
   │
   ├─► Redis (Caching Layer - TTL 300s)
   ├─► PostgreSQL (Storage DB & Migration State)
   │
   ├─► Square API (Booking, Staff, Catalog, Catalog items, & Clients)
   ├─► Google APIs (Maps API & Google Business Reviews)
   └─► Instagram Graph API (Dynamic media feed)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Astro 7, Astro Content Collections, Astro Islands
- **Logic / Dynamic**: TypeScript, React (strictly within dynamic islands), TanStack Query, React Hook Form, Zod
- **Styles**: Tailwind CSS, shadcn/ui, Framer Motion

### Backend
- **Core API Engine**: Python 3.12, FastAPI, Pydantic v2
- **ORM / Migrations**: SQLAlchemy 2, Alembic
- **Database / Cache**: PostgreSQL, Redis
- **HTTP / Auth**: httpx Async, JWT, OAuth2

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Proxy / CDN**: Nginx (Reverse Proxy & SSL), Cloudflare
- **Hosting**: Vercel (Frontend), VPS Ubuntu (Backend)

---

## 📁 Project Documentation Base

The project maintains comprehensive, real-time documentation of all decisions and features:

### Root Level Trackers
- [README.md](file:///Users/alaincc/lashesmglamour/README.md) - Project overview and quick start (this file).
- [TODO.md](file:///Users/alaincc/lashesmglamour/TODO.md) - Active task management matrix.
- [PROJECT_STATUS.md](file:///Users/alaincc/lashesmglamour/PROJECT_STATUS.md) - Implementation checklists and recent achievements.
- [ROADMAP.md](file:///Users/alaincc/lashesmglamour/ROADMAP.md) - Milestones and development phases.
- [ARCHITECTURE.md](file:///Users/alaincc/lashesmglamour/ARCHITECTURE.md) - Core system design and directory structure.
- [CHANGELOG.md](file:///Users/alaincc/lashesmglamour/CHANGELOG.md) - Version history tracker.

### Specialized Documentation (`docs/`)
- [PROMPT_MAESTRO.md](file:///Users/alaincc/lashesmglamour/docs/PROMPT_MAESTRO.md) - The master prompt rule definition.
- [BRAND-GUIDE.md](file:///Users/alaincc/lashesmglamour/docs/BRAND-GUIDE.md) - Color typography, spacings, and asset instructions.
- [API.md](file:///Users/alaincc/lashesmglamour/docs/API.md) - Endpoint schemes and request/response specifications.
- [DATABASE.md](file:///Users/alaincc/lashesmglamour/docs/DATABASE.md) - Relational diagrams, indexing rules, and caching layouts.
- [DEPLOYMENT.md](file:///Users/alaincc/lashesmglamour/docs/DEPLOYMENT.md) - Nginx configuration, Dockerfiles, and CI/CD pipelines.
- [SQUARE.md](file:///Users/alaincc/lashesmglamour/docs/SQUARE.md) - API integrations, payload mapping, and event webhooks details.
- [SEO.md](file:///Users/alaincc/lashesmglamour/docs/SEO.md) - Structured LocalBusiness schemas, metadata configurations, and keywords strategy.

---

## 🚀 Getting Started

### Local Setup (Development)

Please refer to [docs/DEPLOYMENT.md](file:///Users/alaincc/lashesmglamour/docs/DEPLOYMENT.md) for full docker setup guidelines, database settings, and service triggers.

1. **Verify Environment Configuration**:
   Ensure you configure the `.env` settings matching:
   ```text
   SQUARE_ACCESS_TOKEN=your_token
   SQUARE_APPLICATION_ID=your_app_id
   SQUARE_LOCATION_ID=your_location_id
   SQUARE_ENVIRONMENT=sandbox_or_production
   SQUARE_WEBHOOK_SIGNATURE=your_webhook_signature
   DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/lashes_db
   REDIS_URL=redis://localhost:6379/0
   ```

2. **Docker Quickstart**:
   ```bash
   docker-compose up --build
   ```

---

## 🎨 Design Identity and Rules

- **Source of Truth**: The `/designs` directory is the sole visual standard.
- **Logo Rule**: The logo file located in `designs/logo/` must never be modified. Rules:
  - *Lashes* = Gold
  - *MGlamour* = Black
  - Crown: Gold; Lash: Black. No modifications are permitted.
- **Design Tokens**: Defined strictly at `src/styles/tokens.ts` (Tailwind styles).

---

## 🤝 Development and Coding Guidelines

We enforce enterprise-level coding practices:
- **SOLID** & **Clean Architecture** patterns.
- **Repository Pattern** and **Service Pattern** on the FastAPI backend layer.
- **Astro Islands** used strictly for dynamic modules. No page-wide React rendering.
- Complete documentation update with every code iteration.
- Strict Type checking (TypeScript and fully-typed Python).
- Refer to [CONTRIBUTING.md](file:///Users/alaincc/lashesmglamour/CONTRIBUTING.md) for full branch structures and git rules.
