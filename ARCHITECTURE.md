# Architecture & Technical Design

This document details the architectural decisions, design system, coding patterns, and layout guidelines for the **Lashes M Glamour** web application.

---

## 🏗️ Folder Architecture

To keep the application highly organized, modular, and easy to maintain, the workspace follows a clean client-side layout:

```text
lashesmglamour/
├── css/
│   ├── variables.css      # Design tokens (colors, typography, spacing)
│   ├── base.css           # Global resets and core HTML styles
│   ├── layout.css         # Page wrappers, headers, footers, grid layouts
│   ├── components/        # Component-specific styles (buttons, cards, modals)
│   └── main.css           # Bundled stylesheet importing the above files
├── js/
│   ├── config.js          # App configurations, constants
│   ├── components/        # Isolated JavaScript component logic (modal, bookings)
│   ├── utils/             # Helper libraries (validation, date styling)
│   └── main.js            # Core page bootstrap file
├── assets/
│   ├── images/            # Optimized images, icons, portfolio showcases
│   └── fonts/             # Local webfont resources (if not loaded via CDN)
├── index.html             # Main entrance layout
└── ... (base configuration files)
```

---

## 🎨 Design System & CSS Architecture

Our CSS architecture is designed to support **Rich Aesthetics** and **Premium Designs** without using massive utility frameworks.

### 1. Variables & Tokens (`css/variables.css`)
We define all design tokens using CSS Custom Properties. This allows fast theme alterations, dynamic styling, and consistent layouts.
- **Primary Color Palette**: Curated rich dark background tones matched with delicate luxurious secondary/accent colors:
  - `--bg-primary`: Deep off-black / warm charcoal
  - `--bg-secondary`: Soft dark grey / warm clay
  - `--accent-gold`: Rich champagne gold
  - `--accent-rose`: Soft rose gold
  - `--text-main`: Warm white / ivory
  - `--text-muted`: Muted soft gold/grey
- **Typography Hierarchy**: Setting font family weights, letter-spacings, and line-heights.
- **Transitions**: Global standard values for hover transitions (`--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`).

### 2. Layout & Responsive Design
- We use **CSS Grid** for main structural grids (e.g., portfolio layouts, pricing tables) and **Flexbox** for alignment/direction controls.
- **Mobile First Approach**: Media queries are constructed starting from mobile screen sizes up to ultra-wide displays:
  - Mobile: `< 768px`
  - Tablet: `>= 768px`
  - Desktop: `>= 1024px`
  - Large Desktop: `>= 1440px`

### 3. Glassmorphism & Micro-animations
- High-end UI panels use glassmorphic backdrops:
  ```css
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  ```
- Hover effects include smooth translations, soft shadow glows, and border-color transitions to provide subtle, tactile confirmation of interactivity.

---

## 🧠 Javascript Architecture

We use modern **ES6 Modules** (`type="module"`) to organize scripts and maintain clean scope.
- **Component Isolation**: Each interactive piece (e.g., booking form validator, image carousel, testimonial slider) resides in its own class or module under `js/components/`.
- **Event Delegation**: To handle dynamic interaction efficiently, events are delegated to root nodes wherever possible.
- **DOM Queries Cache**: Components must cache their queried DOM elements to optimize performance and prevent repeated tree searches.

---

## 📈 SEO & Performance Best Practices

### SEO Optimization
- A strict heading structure is maintained. A page must have one and only one `<h1>`.
- Semantic HTML tags are mandatory for key sections (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
- Images must include descriptive `alt` tags.

### Performance
- **Image Optimization**: All images must be optimized (WebP format where possible) and include width/height attributes to prevent layout shifts.
- **Resource Loading**: Font styles and key css are loaded immediately; heavy visual logic is deferred until page interaction or DOM completion.
