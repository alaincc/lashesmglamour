# PROMPT MAESTRO — Lashes & MGlamour Platform (Astro 7 + FastAPI + Square)

## Objetivo

Actúa como un equipo formado por Software Architects, Senior UX/UI Designers, Frontend Developers, Backend Developers, DevOps Engineers, SEO Experts, CRO Specialists, Database Architects y especialistas en Square API.

El objetivo es construir una plataforma profesional para **Lashes & MGlamour**, preparada para producción, altamente escalable, extremadamente rápida, optimizada para SEO local y enfocada en maximizar reservas.

No crear prototipos ni código de ejemplo.

Todo debe ser código de calidad enterprise.

---

# REGLAS GENERALES

Antes de escribir cualquier línea de código:

* Inicializar un repositorio Git.
* Crear commits pequeños y descriptivos.
* Crear documentación desde el primer momento.
* Documentar todas las decisiones técnicas.
* Mantener un historial de cambios.
* Actualizar la documentación con cada nueva funcionalidad.

Crear automáticamente:

```
README.md
CHANGELOG.md
TODO.md
PROJECT_STATUS.md
ROADMAP.md
ARCHITECTURE.md
```

Crear además:

```
docs/

BRAND-GUIDE.md

API.md

DATABASE.md

DEPLOYMENT.md

SQUARE.md

SEO.md
```

Todo el proyecto debe quedar documentado.

---

# TECNOLOGÍAS

## Frontend

* Astro 7
* TypeScript
* Tailwind CSS
* Astro Content Collections
* Astro Islands
* React únicamente dentro de Islands cuando sea necesario
* shadcn/ui
* Framer Motion
* TanStack Query
* Zod
* React Hook Form

## Backend

* Python 3.12
* FastAPI
* SQLAlchemy 2
* Alembic
* PostgreSQL
* Redis
* httpx Async
* Pydantic v2
* JWT
* OAuth2

## Infraestructura

* Docker
* Docker Compose
* GitHub
* GitHub Actions
* Cloudflare
* Nginx
* Vercel (Frontend)
* VPS Ubuntu (Backend)

---

# ARQUITECTURA

```
Astro

↓

FastAPI

↓

Redis

↓

PostgreSQL

↓

Square API

↓

Google APIs

↓

Instagram
```

---

# DISEÑO

Existe una carpeta llamada

```
/designs
```

Esta carpeta contiene:

* Logo oficial
* Flyers
* Facebook Covers
* Instagram Posts
* Business Cards
* Trifold
* Menús
* Material publicitario

El sistema debe analizar automáticamente esta carpeta antes de comenzar el desarrollo.

La carpeta **/designs** es la fuente oficial de la identidad visual.

Nunca crear una identidad nueva.

---

# LOGO

Existe un único logo oficial.

Nunca modificarlo.

Nunca redibujarlo.

Nunca cambiar colores.

Nunca reinterpretarlo.

Siempre utilizar el archivo ubicado en

```
designs/logo/
```

Reglas:

* Lashes = Dorado
* MGlamour = Negro
* Corona dorada
* Pestaña negra
* Sin círculos
* Sin efectos diferentes

---

# BRAND GUIDE

Generar automáticamente

```
docs/BRAND-GUIDE.md
```

Debe documentar:

* Paleta de colores
* Tipografía
* Botones
* Cards
* Espaciados
* Estilo fotográfico
* Iconografía
* Uso del logo
* Responsive
* Animaciones

---

# TOKENS

Crear

```
src/styles/tokens.ts
```

Con

* Colores
* Radius
* Sombras
* Espaciados
* Breakpoints
* Tipografía

---

# ASTRO

Astro será el framework principal.

No usar React para renderizar páginas completas.

React solo puede existir dentro de Astro Islands.

---

# ASTRO ISLANDS

Las Islands se utilizarán únicamente para contenido dinámico.

Ejemplos:

* Booking
* Calendario
* Disponibilidad
* Formularios
* Instagram Feed
* Google Reviews
* Carruseles
* Panel Admin
* Chat
* Botones flotantes

Todo el contenido SEO debe ser HTML generado por Astro.

---

# COMPONENTES

Crear componentes reutilizables

```
BrandHero

BookingButton

ServiceCard

PriceCard

Gallery

InstagramFeed

BeforeAfter

FAQ

FloatingCallButton

FloatingBookButton

ReviewCard

Footer

Header

Navigation

ServiceGrid

PromotionBanner
```

---

# PÁGINAS

Home

About

Services

Lashes

Brows

Skin Care

Waxing

Gallery

Reviews

Blog

FAQ

Contact

Book Now

---

# SERVICIOS

Sin hardcodear.

Todos los servicios provienen de Square.

---

# CONECTOR SQUARE

Crear un microservicio FastAPI.

Nunca conectar Astro directamente con Square.

Astro debe consumir únicamente FastAPI.

---

# VARIABLES

```
SQUARE_ACCESS_TOKEN

SQUARE_APPLICATION_ID

SQUARE_LOCATION_ID

SQUARE_ENVIRONMENT

SQUARE_WEBHOOK_SIGNATURE
```

Nunca exponer tokens.

---

# SINCRONIZACIÓN

Cada 15 minutos.

Descargar automáticamente

Servicios

Categorías

Precios

Duración

Disponibilidad

Empleados

Promociones

Imágenes

---

# ENDPOINTS

GET

```
/services

/services/{id}

/categories

/staff

/promotions

/availability

/business-hours
```

POST

```
/booking
```

PUT

```
/booking
```

DELETE

```
/booking
```

---

# WEBHOOKS

Escuchar

```
booking.created

booking.updated

booking.canceled

catalog.updated

customer.updated
```

Actualizar automáticamente PostgreSQL.

---

# REDIS

TTL

300 segundos

---

# BOOKING

El usuario debe poder

Seleccionar servicio

Seleccionar especialista

Seleccionar fecha

Seleccionar hora

Reservar

Confirmar

Cancelar

Reprogramar

Todo utilizando Square.

---

# ADMINISTRACIÓN

Crear un panel administrativo.

Debe permitir

* Sincronizar Square
* Ver Logs
* Estado API
* Servicios
* Promociones
* Blog
* Galería
* Testimonios
* FAQ
* Horarios
* Equipo
* Redes sociales
* Banners

---

# BLOG

Astro Content Collections.

Categorías

* Lashes
* Brows
* Skin Care
* Beauty Tips
* Promotions

SEO automático.

---

# SEO

Optimizar para

Lashes Miami

Lash Extensions Miami

Lashes Kendall

Classic Lashes

Hybrid Lashes

Volume Lashes

Mega Volume

Brows Miami

Facials Miami

Waxing Miami

Beauty Studio Miami

Beauty Salon Kendall

Crear automáticamente

Meta Title

Meta Description

Open Graph

Twitter Card

Schema.org

FAQ Schema

Local Business Schema

JSON-LD

Canonical

Breadcrumb

Sitemap

Robots

---

# GOOGLE BUSINESS

Integrar

Google Reviews

Google Maps

NAP consistente

Rich Snippets

---

# INTEGRACIONES

Square

Instagram Feed

Google Reviews

Google Maps

WhatsApp

Facebook

TikTok

Meta Pixel

Google Analytics 4

Google Tag Manager

Search Console

---

# PERFORMANCE

Objetivo

100/100 Lighthouse

Core Web Vitals verdes

Lazy Loading

Code Splitting

Image Optimization

Prefetch

Preconnect

Minificación

Compresión

---

# ACCESIBILIDAD

WCAG AA

ARIA

Alt

Keyboard Navigation

---

# SEGURIDAD

JWT

HTTPS

Helmet

Rate Limit

CORS

Secrets

Environment Variables

Auditoría de Logs

---

# DOCKER

Crear

Frontend

Backend

Redis

PostgreSQL

Nginx

Docker Compose

---

# GIT

Estrategia

```
main

develop

feature/*

fix/*

release/*

hotfix/*
```

Commits claros y frecuentes.

---

# DOCUMENTACIÓN AUTOMÁTICA

Cada vez que se implemente una funcionalidad:

* Actualizar README.
* Actualizar CHANGELOG.
* Actualizar PROJECT_STATUS.
* Actualizar TODO.
* Actualizar ARCHITECTURE.
* Actualizar documentación de la API.

No dejar documentación desactualizada.

---

# CÓDIGO

Aplicar:

* SOLID
* Clean Architecture
* Repository Pattern
* Service Pattern
* Dependency Injection
* DRY
* KISS

TypeScript estricto.

Python completamente tipado.

Componentes reutilizables.

Sin duplicación de código.

---

# OBJETIVO FINAL

Construir una plataforma premium para **Lashes & MGlamour** que utilice Astro 7 como frontend de alto rendimiento y FastAPI como backend, sincronizada automáticamente con Square para servicios, precios, disponibilidad y reservas. Toda la identidad visual debe derivarse de la carpeta **/designs**, utilizando siempre el logo oficial sin modificaciones. El sitio debe ser elegante, rápido, escalable, optimizado para SEO local y diseñado para que el usuario pueda reservar una cita en menos de tres clics.
