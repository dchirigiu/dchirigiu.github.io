# Design Analysis: Premium Portfolio Mechanics

**Reference:** https://camillemormal.com/  
**Analysis Date:** 2026-09-27

## Core Principles Extracted

### 1. Preloader Choreography
- **Structure:** Percentage counter (0-100%) with sliding reveal
- **Initial state:** `transform: translate3d(0, 300%, 0)` (below viewport)
- **Reveal:** Slides up to 0% over time
- **Duration:** ~2-3 seconds total
- **Letter-spacing:** `0.05em` (0.8px at 16px base)
- **Font-size:** Responsive using viewport units
  - Desktop (16:9+): `1.6667vh` (font), `2.0833vh` (line-height)
  - Mobile (<16:9): `0.9375vw` (font), `1.1719vw` (line-height)
- **Background:** `#141414` (rgb(20, 20, 20))
- **z-index:** `9996`
- **Exit:** Fade out after load complete

### 2. Easing Curves (Exact Values)
- **Primary ease (scroll reveals, major transitions):** `cubic-bezier(0.19, 1, 0.22, 1)`
  - Creates elegant deceleration at end
- **Secondary ease (hover, micro-interactions):** `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
  - Smoother, more subtle
- **Duration for major transitions:** `1200ms` (1.2s)
- **Duration for micro-interactions:** `300ms` (0.3s)

### 3. Typography Hierarchy
- **Large project titles:** `42.66px` (~2.67rem at 16px base)
  - Letter-spacing: `-0.64px` (tight, -0.015em)
  - Line-height: `58.3px` (~1.37x font size)
  - Font-weight: `400` (regular)
- **Small labels/metadata:** `12.8px` (~0.8rem)
  - Letter-spacing: `0.64px` (wide, +0.05em)
  - Line-height: `16px` (~1.25x font size)
- **Body/UI text:** `16px` (1rem base)
  - Letter-spacing: `normal`
  - Line-height: `20px` (1.25x)

### 4. Color Usage
- **Background:** `#141414` (rgb(20, 20, 20)) - very dark charcoal, NOT pure black
- **Text:** `#FFFFFF` (rgb(255, 255, 255)) - pure white for maximum contrast
- **Philosophy:** Minimal palette, extreme restraint, contrast-driven

### 5. Whitespace & Spacing
- **Main container:** No max-width constraint, full-bleed design
- **Padding:** Minimal on main, spacing through child elements
- **Vertical rhythm:** Generous between sections
- **Project items:** Significant vertical spacing between each

### 6. Scroll-Reveal Behavior
- **Transform-based:** Uses `translate3d()` for GPU acceleration
- **Stagger delay:** Estimated 80-120ms between items
- **Initial state:** Items below viewport or with reduced opacity
- **Reveal:** Transform to `translate3d(0, 0, 0)` + opacity 1
- **Trigger:** IntersectionObserver when ~20% visible

### 7. Hover Micro-Interactions
- **Duration:** `300ms`
- **Easing:** `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- **Common effects:**
  - Subtle scale (1.0 → 1.02)
  - Opacity shifts
  - Underline reveals
- **Hardware acceleration:** `will-change: transform` on interactive elements

### 8. Projects Slider Mechanics
- **Vertical layout** (not horizontal carousel as initially assumed)
- **Snap behavior:** CSS scroll-snap-type
- **Item presentation:** Large titles with small index numbers
- **Navigation:** Numbered pagination indicators (1, 2, 3, 4...)
- **Touch/drag:** Native scroll behavior with momentum

### 9. Performance Optimizations
- **Font loading:** `font-display: swap`
- **Transform acceleration:** `will-change: transform` on animated elements
- **Minimal DOM:** Only 114 elements on homepage
- **Critical CSS:** Inlined preloader styles in `<head>`
- **Lazy execution:** Main JS loaded after DOM ready

### 10. Layout Philosophy
- **No max-width containers:** Full viewport utilization
- **Responsive typography:** vh/vw units with aspect-ratio breakpoints
- **Minimal markup:** Clean semantic structure
- **Z-index management:** Clear layering (preloader at 9996)

---

## Translation to Implementation Values

### CSS Custom Properties
```css
:root {
  /* Easings */
  --ease-primary: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-secondary: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Durations */
  --duration-slow: 1200ms;
  --duration-fast: 300ms;
  
  /* Typography */
  --text-hero: 42.66px;
  --text-meta: 12.8px;
  --text-base: 16px;
  
  --lh-hero: 1.37;
  --lh-meta: 1.25;
  --lh-base: 1.25;
  
  --ls-hero: -0.015em;
  --ls-meta: 0.05em;
  
  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 32px;
  --space-lg: 64px;
  --space-xl: 128px;
}
```

### Preloader Animation Keyframes
```css
@keyframes preloader-slide-up {
  from {
    transform: translate3d(0, 300%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes preloader-fade-out {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
```

### Scroll-Reveal Pattern
```css
.reveal {
  opacity: 0;
  transform: translate3d(0, 60px, 0);
  transition: opacity var(--duration-slow) var(--ease-primary),
              transform var(--duration-slow) var(--ease-primary);
}

.reveal.active {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
```

### Hover Interaction Pattern
```css
.interactive {
  transition: transform var(--duration-fast) var(--ease-secondary);
  will-change: transform;
}

.interactive:hover {
  transform: scale(1.02);
}
```

---

## Key Takeaways for Implementation

1. **NO adjectives:** Every value is numeric and measurable
2. **Transform-based animations:** Better performance than top/left
3. **Minimal color palette:** Focus on typography and spacing
4. **Generous whitespace:** Don't crowd elements
5. **Consistent easing:** Only 2 curves for entire site
6. **GPU acceleration:** `will-change` on animated elements
7. **Responsive via viewport units:** Not just media queries
8. **Clean markup:** Minimal DOM, semantic structure
9. **Progressive enhancement:** Works without JS, better with it
10. **Performance-first:** Inline critical CSS, lazy load rest
