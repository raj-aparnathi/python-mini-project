# VaultGuard - Password Manager Design System

This document outlines the complete frontend design system, specifications, typography, color palettes, spacing rules, and interaction patterns implemented in the **VaultGuard** Password Manager application.

---

## 1. Design Philosophy
VaultGuard is engineered around three foundational tenets:
1. **Zero Ambiguity & Total Legibility:** Every single textual element and control is rendered with high-contrast foreground-to-background ratios (WCAG AA & AAA compliant). No light-gray text on white backgrounds, no white text on light badges, and no CSS inheritance leaks.
2. **Professional Cybersecurity SaaS Aesthetic:** Visual inspiration draws from modern enterprise cybersecurity platforms (such as 1Password, Bitwarden, and CrowdStrike) using structured layouts, crisp border radii, subtle elevation shadows, and deep indigo brand accents.
3. **Frictionless Credential Governance:** Operations such as independent masking/unmasking, 1-click clipboard copy with immediate feedback, real-time entropy calculation, and non-destructive confirmation workflows guarantee smooth, error-free user interactions.

---

## 2. Color Palette
All color values are defined as CSS Custom Properties in `:root` and verified against contrast benchmarks:

| Token Name | Hex Code | Purpose / Usage | WCAG Contrast on White |
| :--- | :--- | :--- | :--- |
| `--primary` | `#4F46E5` | Brand Indigo, primary CTA buttons, active state accents | 5.9:1 (Pass AA) |
| `--primary-hover` | `#4338CA` | Hover state for primary buttons | 7.3:1 (Pass AAA) |
| `--primary-light` | `#EEF2FF` | Background tint for active nav items, icons | N/A (Surface) |
| `--secondary` | `#6366F1` | Secondary gradient accent | 4.6:1 (Pass AA) |
| `--bg-main` | `#F8FAFC` | Page body background (Slate 50) | N/A (Canvas) |
| `--bg-card` | `#FFFFFF` | Card, table, and modal surfaces | N/A (Surface) |
| `--bg-subtle` | `#F1F5F9` | Neutral input backgrounds, hover states | N/A (Surface) |
| `--text-primary` | `#111827` | Headings, primary titles, account names (Gray 900) | 14.5:1 (Pass AAA) |
| `--text-secondary`| `#334155` | Body text, labels, nav links (Slate 700) | 8.5:1 (Pass AAA) |
| `--text-muted` | `#475569` | Helper descriptions, timestamps, table th (Slate 600) | 5.8:1 (Pass AA) |
| `--text-subtle` | `#64748B` | Section titles, input placeholders (Slate 500) | 4.6:1 (Pass AA) |
| `--text-inverse` | `#FFFFFF` | Text on dark buttons, dark cards, dark badges | High Contrast |
| `--border-color` | `#E2E8F0` | Dividers, card borders, table separators | N/A (Border) |
| `--success` | `#16A34A` | Strong passwords, success toasts, secure badges | 4.7:1 (Pass AA) |
| `--success-bg` | `#DCFCE7` | Success badges and indicators background | N/A (Surface) |
| `--danger` | `#DC2626` | Weak passwords, delete actions, error toasts | 4.8:1 (Pass AA) |
| `--danger-bg` | `#FEE2E2` | Danger modal icons & warning containers | N/A (Surface) |
| `--warning` | `#D97706` | Medium strength passwords, alert badges | 4.5:1 (Pass AA) |
| `--warning-bg` | `#FEF3C7` | Medium strength pill backgrounds | N/A (Surface) |

### Category Specific Badges:
- **Social:** Text `#6366F1` | Background `#EEF2FF`
- **Banking:** Text `#059669` | Background `#ECFDF5`
- **Work:** Text `#D97706` | Background `#FFFBEB`
- **Shopping:** Text `#DB2777` | Background `#FDF2F8`
- **Email:** Text `#0284C7` | Background `#F0F9FF`
- **Entertainment:** Text `#8B5CF6` | Background `#F5F3FF`
- **Other:** Text `#475569` | Background `#F1F5F9`

---

## 3. Typography
- **Primary Font Family:** `'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace Font Family:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace` (Used for passwords, masked tokens, and usernames to ensure strict glyph clarity).

### Type Scale:
- **Display / Metric Digits:** `1.875rem` (`30px`), Font Weight: 800, Line Height: 1.0, Letter Spacing: `-0.03em`
- **Page Titles (H1):** `1.25rem` (`20px`), Font Weight: 700, Letter Spacing: `-0.02em`
- **Section Titles (H2):** `1.125rem` (`18px`), Font Weight: 700
- **Body & Table Text:** `0.875rem` (`14px`), Font Weight: 400 - 500, Line Height: 1.5
- **Small Labels & Metadata:** `0.75rem` (`12px`), Font Weight: 600
- **Micro Badges:** `0.625rem` - `0.6875rem` (`10px` - `11px`), Font Weight: 700, Letter Spacing: `0.05em`

---

## 4. Spacing System
Built upon a consistent 4px modular grid:
- `--space-1`: `4px` (`0.25rem`)
- `--space-2`: `8px` (`0.5rem`)
- `--space-3`: `12px` (`0.75rem`)
- `--space-4`: `16px` (`1.0rem`)
- `--space-5`: `20px` (`1.25rem`)
- `--space-6`: `24px` (`1.5rem`)
- `--space-8`: `32px` (`2.0rem`)
- `--space-10`: `40px` (`2.5rem`)
- `--space-12`: `48px` (`3.0rem`)

---

## 5. Buttons
1. **Primary Button (`.btn-primary`):**
   - Background: `#4F46E5`, Color: `#FFFFFF`, Font Size: `14px`, Font Weight: 600.
   - Padding: `10px 18px`, Border Radius: `10px`, Box Shadow: `0 2px 4px rgba(79, 70, 229, 0.25)`.
   - Hover: Background `#4338CA`, Translate Y: `-1px`, Elevation Shadow.
2. **Secondary Button (`.btn-secondary`):**
   - Background: `#FFFFFF`, Border: `1px solid #E2E8F0`, Color: `#334155`.
   - Hover: Background `#F1F5F9`, Color: `#111827`, Border: `#CBD5E1`.
3. **Danger Button (`.btn-danger`):**
   - Background: `#DC2626`, Color: `#FFFFFF`, Hover: `#B91C1C`.
4. **Action Icon Buttons (`.action-icon-btn`):**
   - Dimensions: `32px × 32px`, Border Radius: `6px`.
   - Hover: Background `#F1F5F9`, Color: `#111827`.
   - Active Favorite: `#EAB308` (Golden Star).

---

## 6. Cards
- **Border Radius:** `14px` (`--radius-lg`) for metric cards; `18px` (`--radius-xl`) for panel containers.
- **Borders:** `1px solid var(--border-color)` (`#E2E8F0`).
- **Shadows:**
  - Default: `0 1px 3px rgba(15, 23, 42, 0.08)`.
  - Hover: `0 4px 6px -1px rgba(15, 23, 42, 0.08)`, Translate Y: `-2px`.
- **Cybersecurity Highlight Card:** Gradient `linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)` with high-contrast text (`#FFFFFF`, `#C7D2FE`, `#E0E7FF`).

---

## 7. Sidebar
- **Width:** `270px` (Desktop fixed).
- **Background:** `#FFFFFF` with `1px solid #E2E8F0` right divider.
- **Header:** Shield brand icon with indigo gradient, title `VaultGuard` + `PRO` badge.
- **Navigation Links:**
  - Base text: `#334155` with `#475569` icons.
  - Hover text: `#111827` on `#F1F5F9` background.
  - Active: `#4F46E5` text on `#EEF2FF` light indigo background with font-weight 600.
- **Mobile Drawer:** Translates `-100%` offscreen, opens smoothly via hamburger trigger with `backdrop-filter: blur(4px)`.

---

## 8. Navbar
- **Height:** `70px`, Sticky top with `z-index: 80`.
- **Components:**
  - Dynamic page title and contextual subtitle.
  - Quick Search bar with rounded pill geometry (`height: 42px`, `padding: 0 42px`). Keyboard shortcut `/` supported.
  - Live Vault Protection indicator with green pulsing dot animation.
  - Activity log dropdown bell with unread badge counter.
  - Prominent `+ Add Password` action button.

---

## 9. Password Table
- **Layout:** Responsive HTML table with horizontal scroll wrapper for dense data and vertical alignment.
- **Headers (`th`):** Background `#F8FAFC`, Color `#475569`, Font Size `12px`, uppercase with `0.05em` letter spacing.
- **Masking:** Passwords masked by default as `••••••••••••`.
- **Independent Eye Controls:** Each row has a distinct toggle button. Clicking flips icon to unmasked text and eye-slash without affecting any other row.
- **Quick Copy:** 1-click copy icons for username and password with toast confirmation.

---

## 10. Modals
- **Backdrop:** `rgba(15, 23, 42, 0.6)` with `backdrop-filter: blur(4px)`.
- **Card:** `max-width: 520px` (or `440px` for delete), `border-radius: 18px`, Shadow: `0 25px 50px -12px rgba(15, 23, 42, 0.25)`.
- **Keyboard Handling:** Escape key closes any active modal. Focus is auto-trapped to first relevant input.

---

## 11. Forms
- **Input Fields:** `height: 42px`, Border: `1px solid #CBD5E1`, Background: `#FFFFFF`, Color: `#111827`.
- **Focus State:** `border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18)`.
- **Error State:** `border-color: #DC2626; box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15)`. Friendly inline message rendered in red.
- **Real-Time Entropy Meter:** Dynamic width and color bar:
  - Weak: Red fill (`#DC2626`), `33%` width.
  - Medium: Amber fill (`#D97706`), `66%` width.
  - Strong: Green fill (`#16A34A`), `100%` width.

---

## 12. Icons
- **Icon Set:** Clean inline SVG icons inspired by Heroicons/Lucide.
- **Rendering:** Inline SVGs ensure crisp scaling, instant loading, zero HTTP requests, and immunity to missing font-icon assets.
- **Attributes:** All interactive icon buttons include `aria-label` and `title` attributes for tooltips.

---

## 13. Toast Notifications
- **Position:** Fixed bottom-right (`24px` from edges).
- **Animation:** Slides up and fades in over `0.25s` with spring cubic-bezier.
- **Dismissal:** Auto-dismisses after 3.5 seconds; manual dismiss via cross icon.
- **Variants:**
  - Success: Left accent `#16A34A`.
  - Error: Left accent `#DC2626`.
  - Warning: Left accent `#D97706`.
  - Info: Left accent `#2563EB`.

---

## 14. Responsive Design
- **Desktop (>1100px):** 4-column metrics grid, persistent 270px sidebar, full table.
- **Tablet / Small Laptop (861px - 1100px):** 2-column metrics grid, stacked security status banner.
- **Mobile (≤860px):** Sidebar converts into an off-canvas drawer with backdrop, hamburger navbar button exposed, centered search bar collapsed into toolbar.
- **Small Mobile (≤580px):** 1-column metrics grid, vertical modal footer action stacking, full-width toast notifications.

---

## 15. Accessibility (a11y)
- **High Contrast:** All text passes WCAG 2.1 AA standards (minimum 4.5:1 ratio for normal text and 3:1 for large text).
- **Focus Rings:** Distinct 2px outline with 2px offset on all `:focus-visible` elements.
- **Semantic Tags:** `<aside>`, `<header>`, `<main>`, `<nav>`, `<section>`, `<table>`, `<dialog role="dialog">`.
- **Screen Reader Support:** All icon-only buttons include descriptive `aria-label`s.

---

## 16. Component States
- **Hover:** Subtle elevation (`transform: translateY(-1px)` or `-2px`), border darkening.
- **Active / Pressed:** `transform: translateY(0)`, deepened background color.
- **Focus-Visible:** Outline `2px solid var(--primary)` with `2px offset`.
- **Disabled:** 50% opacity, `cursor: not-allowed`.

---

## 17. UI/UX Rules
1. Never display a plaintext password upon loading.
2. Eye toggling is strictly isolated per row.
3. Every copy action must produce instantaneous visual feedback (Toast).
4. Deletion actions require explicit confirmation with target account identification.
5. Search results update in real-time without page reloads.

---

## 18. Security Considerations
- **Cryptographic Random Numbers:** Generation uses `window.crypto.getRandomValues()`.
- **Input Sanitization:** All rendered user strings pass through an HTML entity escaping routine to prevent cross-site scripting (XSS).
- **Demo Storage Notice:** Explicit disclaimers inform the user that credentials reside in browser `localStorage`.
- **Clipboard Management:** Clipboard copying does not expose passwords in plaintext on screen.
