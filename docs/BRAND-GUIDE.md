# Brand Identity Guide — Lashes & MGlamour

This Brand Guide establishes the official visual rules and styling design tokens for **Lashes & MGlamour**. These styles are derived from the official source of truth in the `/designs` assets folder.

---

## 👑 The Official Logo Rules

There is exactly one official logo for the brand. It is located at `designs/logo/` and must never be altered, modified, or re-colored.

### Visual Rules
- **Lashes**: Always rendered in Gold (`#D4AF37` / Luxe Metallic Gold).
- **MGlamour**: Always rendered in Deep Black (`#0C0C0C` / Velvet Black).
- **Iconography elements**: Featuring a golden crown and a black eyelash.
- **Constraints**:
  - Do not add circular backgrounds.
  - Do not apply drop-shadows or outlines other than those defined in the asset files.
  - Do not distort or warp the logo dimensions.

---

## 🎨 Color Palette (Design Tokens)

The colors communicate luxury, high-end care, and absolute beauty in a warm light-themed profile.

| Token | CSS Variable | Hex Code | Visual Application |
| :--- | :--- | :--- | :--- |
| **Beauty Pink** | `--color-brand-pink` | `#D12E66` | Primary action buttons, active links, header strip. |
| **Pink Hover** | `--color-brand-pink-hover`| `#E13D7A` | Accent interactive hover status. |
| **Soft Warm Rose** | `--color-brand-light-pink`| `#FFF5F7` | Section backgrounds, card backgrounds. |
| **Luxe Gold** | `--color-brand-gold` | `#C5A880` | Accent borders, dotted menu leads, benefit icons. |
| **Deep Charcoal** | `--color-brand-charcoal` | `#111111` | Primary text and heading color. |
| **Velvet Dark** | `--color-brand-dark` | `#0E0D0B` | Footer background. |

---

## ✒️ Typography

We use elegant, high-contrast fonts matching luxury salon aesthetics.

- **Primary Heading Font**: *Playfair Display* (Serif). Used for main headers, section titles, and service names. Expresses elegance and sophistication.
- **Body & Action Font**: *Montserrat* (Sans-serif). Used for readability in lists, paragraphs, menus, and button labels.
- **Accent Script Font**: *Alex Brush* (Cursive). Used for decorative subtitle highlights (e.g. "Natural Glamour").
- **Scale Rules**:
  - `h1`: `Playfair Display`, Bold, `3.25rem` (Mobile: `2.25rem`), letter-spacing: `0.02em`.
  - `h2`: `Playfair Display`, Semi-Bold, `2.25rem` (Mobile: `1.75rem`), letter-spacing: `0.01em`.
  - `h3`: `Playfair Display`, Regular, `1.5rem`, letter-spacing: `0.01em`.
  - `body`: `Montserrat`, Light/Regular, `1rem` (Line-height: `1.6`).


---

## 🧱 Component Styles

### 1. Buttons (`BookingButton`, `FloatingBookButton`)
- **Primary Action (Call to Action)**:
  - Background: Beauty Pink (`--color-brand-pink`).
  - Text: White, Bold, uppercase.
  - Radius: Minimal (`4px` / subtle roundness).
  - Hover: Background color transitions to Pink Hover (`--color-brand-pink-hover`) with a shadow drop.
- **Secondary/Outline Action**:
  - Background: Transparent.
  - Border: `1px solid --color-brand-gold`.
  - Text: Luxe Gold (`--color-brand-gold`).
  - Hover: Background fills with Luxe Gold, text changes to White.

### 2. Service & Price Cards
- Background: Pure White (`#FFFFFF`) with a thin border (`1px solid --color-brand-border`).
- Interactive hovers: Soft lift (`transform: translateY(-4px)`) combined with a pink border hover glow adjustment.

---

## 📐 Spacing & Layout

We use standard layout spacing rules to maintain visual breathing room:
- **Section Spacing**: `padding: 6rem 0` on desktop, `4rem 0` on mobile viewports.
- **Grid Gap**: `gap: 2rem` for layout columns, `gap: 1rem` for card content lists.

---

## 🎬 Animations & Transitions

Keep all motions subtle and micro-targeted to convey premium quality.
- **Transitions**: Every interactive state changes using `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.
- **Card Hover**: Soft lift (`transform: translateY(-4px)`) combined with a faint border highlight.
- **Page Load Transits**: Fade-ins powered by Framer Motion or Astro native View Transitions.
