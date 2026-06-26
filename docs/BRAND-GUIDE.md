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

The colors communicate luxury, high-end care, and absolute beauty.

| Token | CSS Variable | Hex Code | Visual Application |
| :--- | :--- | :--- | :--- |
| **Velvet Black** | `--color-black` | `#0B0B0B` | Deep background, primary text in light components. |
| **Luxe Gold** | `--color-gold` | `#D4AF37` | Headings, active states, premium borders. |
| **Champagne Gold**| `--color-champagne`| `#F0E6D2` | Accent text, hover borders, subtle backgrounds. |
| **Warm Clay** | `--color-grey-dark`| `#1D1D1F` | Section background, card containers. |
| **Soft Muted Grey**| `--color-grey-mute`| `#8E8E93` | Muted descriptions, borders. |
| **Pure Ivory** | `--color-ivory` | `#F9F6F0` | Content text. |

---

## ✒️ Typography

We use elegant, high-contrast fonts matching luxury salon aesthetics.

- **Primary Heading Font**: *Playfair Display* (Serif). Used for main headers, section titles, and service names. Expresses elegance and sophistication.
- **Body & Action Font**: *Montserrat* (Sans-serif). Used for readability in lists, paragraphs, menus, and button labels.
- **Scale Rules**:
  - `h1`: `Playfair Display`, Bold, `3.25rem` (Mobile: `2.25rem`), letter-spacing: `0.02em`.
  - `h2`: `Playfair Display`, Semi-Bold, `2.25rem` (Mobile: `1.75rem`), letter-spacing: `0.01em`.
  - `h3`: `Playfair Display`, Regular, `1.5rem`, letter-spacing: `0.01em`.
  - `body`: `Montserrat`, Light/Regular, `1rem` (Line-height: `1.6`).

---

## 🧱 Component Styles

### 1. Buttons (`BookingButton`, `FloatingBookButton`)
- **Primary Action (Call to Action)**:
  - Background: Luxe Gold (`--color-gold`).
  - Text: Velvet Black (`--color-black`), Bold, uppercase.
  - Radius: Minimal (`4px` / subtle roundness).
  - Hover: Background color transitions to Champagne Gold (`--color-champagne`) with a subtle glow shadow.
- **Secondary Action**:
  - Background: Transparent.
  - Border: `1px solid --color-gold`.
  - Text: Luxe Gold (`--color-gold`).
  - Hover: Background fills with Luxe Gold, text changes to Velvet Black.

### 2. Service & Price Cards
- Background: Warm Clay (`#1D1D1F`) with a thin border (`1px solid rgba(212, 175, 55, 0.08)`).
- **Glassmorphism panels**:
  ```css
  .card-premium {
    background: rgba(29, 29, 31, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(212, 175, 55, 0.15);
  }
  ```

---

## 📐 Spacing & Layout

We use standard layout spacing rules to maintain visual breathing room:
- **Section Spacing**: `padding: 6rem 0` on desktop, `4rem 0` on mobile viewports.
- **Grid Gap**: `gap: 2rem` for layout columns, `gap: 1rem` for card content lists.

---

## 🎬 Animations & Transitions

Keep all motions subtle and micro-targeted to convey premium quality.
- **Transitions**: Every interactive state changes using `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.
- **Card Hover**: Soft lift (`transform: translateY(-4px)`) combined with a faint gold border glow adjustment.
- **Page Load Transits**: Fade-ins powered by Framer Motion or Astro native View Transitions.
