---
name: SelfTracker
description: A premium personal tracker for gym-goers — workouts, weight, habits, nutrition, and tasks
colors:
  primary: "#10B981"
  secondary: "#6366F1"
  background: "#F9FAFB"
  surface: "#FFFFFF"
  surface-elevated: "#FFFFFF"
  card: "#FFFFFF"
  text: "#111827"
  text-secondary: "#4B5563"
  text-muted: "#9CA3AF"
  border: "#E5E7EB"
  error: "#EF4444"
  warning: "#F59E0B"
  success: "#10B981"
  info: "#3B82F6"
  stat-primary: "#10B981"
  stat-secondary: "#0EA5E9"
  stat-tertiary: "#F59E0B"
  stat-quaternary: "#6366F1"
  input-background: "#FFFFFF"
  input-text: "#111827"
typography:
  display:
    fontFamily: "System"
    fontSize: "clamp(1.75rem, 5vw, 2rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "System"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "System"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "System"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "System"
    fontSize: "0.625rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "0.12em"
    textTransform: "uppercase"
rounded:
  full: "9999px"
  xl: "12px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  card-default:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  card-premium:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  input-default:
    backgroundColor: "{colors.input-background}"
    textColor: "{colors.input-text}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
---
# Design System: SelfTracker

## 1. Overview

**Creative North Star: "The Energetic Logbook"**

A premium fitness companion that feels alive without being loud. Think WHOOP meets Notion — data-rich, confident, and vibrant. Dark charcoal foundations with layered emerald and indigo accents, purposeful shadows that make interactive elements pop, and typography that headlines data rather than decorating empty space.

This is a personal tracker for people who take their training seriously. Every screen loads fast, every tap responds with a spring. The interface has personality — color is used deliberately across charts, stats, and accent elements — but nothing is gratuitous. The keyboard never obscures what you're typing.

**Key Characteristics:**
- Dark-first with layered charcoal surfaces, light mode as a crisp alternative
- Dual accent palette: emerald (primary actions, success) + indigo (charts, secondary elements)
- Purposeful shadows for depth and interaction feedback
- System fonts for performance, weight contrast for hierarchy
- Spring micro-interactions on press
- Gradient-backed PremiumCard for hero metrics and featured content

## 2. Colors

A curated palette that balances restraint with energy. Emerald leads, indigo supports, and warm accents add dimension to data.

### Primary
- **Growth Green** (#10B981 light / #34D399 dark): Primary actions, active navigation, success states. The hero color — appears on buttons, toggles, active tabs, and key metrics.

### Secondary
- **Indigo** (#6366F1 light / #818CF8 dark): Charts, secondary accents, decorative elements, gradient hero sections. Paired with emerald to create visual variety without chaos.

### Neutral
- **Basalt** (#14161A): Darkest surface — the canvas in dark mode.
- **Dark Slate** (#1C1F26): Cards and elevated surfaces in dark mode.
- **Elevated Slate** (#232733 / #262B38): Modals, dropdowns, the highest surface layer.
- **Alabaster** (#F9FAFB): The canvas in light mode.
- **White** (#FFFFFF): Cards and surfaces in light mode.

### Text
- **Ink** (#111827 light / #F8FAFC dark): Primary body text.
- **Stone** (#4B5563 light / #B6BCC8 dark): Secondary text, descriptions.
- **Gravel** (#9CA3AF light / #6B7280 dark): Placeholder text, muted labels.

### Feedback
- **Ember** (#EF4444 light / #F87171 dark): Errors, destructive actions.
- **Amber** (#F59E0B light / #FBBF24 dark): Warnings, caution states.
- **Ocean** (#3B82F6 light / #60A5FA dark): Informational, links.

### Stat Colors (Charts & Dashboards)
- **Emerald** (#10B981 / #34D399): Primary stat — growth, completion.
- **Sky** (#0EA5E9 / #38BDF8): Secondary stat — activity, frequency.
- **Amber** (#F59E0B / #FBBF24): Tertiary stat — warnings, pending.
- **Indigo** (#6366F1 / #818CF8): Quaternary stat — unique metrics.

### Named Rules
**The Two-Voice Rule.** Emerald owns primary actions and success. Indigo owns charts, decorative surfaces, and secondary accents. Neither dominates — they share the stage. A screen with only one accent feels flat; a screen with both feels intentional.

## 3. Typography

**Display Font:** System (SF Pro on iOS, Roboto on Android)
**Body Font:** System

**Character:** Clean and commanding. All weight, no flourish. Weight contrast (Black 900 for headings, Regular 400 for body) creates hierarchy without custom typefaces.

### Hierarchy
- **Display** (Black 900, clamp 1.75–2rem, -0.03em tracking): Screen titles on root pages. One per view.
- **Headline** (Bold 700, 1.25rem): Section headers and detail screen titles.
- **Title** (Semibold 600, 1rem): Card titles, list item labels, button text.
- **Body** (Regular 400, 1rem): Paragraphs, data values. Line length capped at 65–75ch.
- **Label** (Black 900, 0.625rem, 0.12em tracking, uppercase): Section headers, stat labels, metadata.

## 4. Elevation

A hybrid system: **tonal layering for structure, shadows for emphasis.** Surfaces are distinguished by color at rest; shadows appear to signal interactivity, hierarchy, and premium moments.

- **Canvas** (Basalt / Alabaster): The base layer. No shadow.
- **Surface** (Dark Slate / White): Cards, inputs, drawers. Subtle shadow on interactive variants.
- **Elevated Surface** (Elevated Slate / White): Modals, dropdowns, action sheets. Carries the strongest shadow.
- **Premium Elevation**: Featured cards and hero sections carry a gradient + shadow combo for visual emphasis.

### Shadow Vocabulary
- **Micro** (`shadow-sm`): Cards with press feedback, small interactive elements.
- **Medium** (`shadow-lg`): Modals, dropdowns, menus — floating UI.
- **Hero** (`shadow-2xl`): Featured content, profile hero, alert dialogs — the highest elevation.

### Named Rules
**The Shadow-Equals-Action Rule.** A surface at rest should not need a shadow to feel like a surface — tonal color does that. Shadows appear to say "you can interact with this" or "this is elevated above the flow." If a card isn't interactive and isn't featured, it doesn't need a shadow.

## 5. Components

### Buttons
- **Shape:** Rounded-xl (12px), full-width by default, centered label.
- **Primary** (Growth Green bg, white text): The default CTA. One per view.
- **Secondary** (Indigo bg, white text): Charts, data actions, secondary flows.
- **Outline** (transparent, Growth Green text + border): Lighter alternative to primary.
- **Ghost** (transparent, Growth Green text): Tertiary actions.
- **Danger** (Ember bg, white text): Destructive confirmations.
- **Press:** Spring scale to 0.97. No hover decoration.
- **Disabled:** Opacity 70%.

### Cards
- **Shape:** Rounded-xl (12px), full border (1px solid border color).
- **Default** (`bg-card`): Standard content container. No shadow at rest.
- **Interactive** (`bg-card shadow-sm`): Tappable cards get a subtle shadow.
- **Premium** (PremiumCard component): Gradient-backed with `BlurView` + `LinearGradient` overlay. Used exclusively for hero metrics, featured content, and profile sections. Not the default — a deliberate visual reward.

### PremiumCard
- **Shape:** Rounded-xl (12px), border on all sides.
- **Background:** `BlurView intensity={20}` with `LinearGradient` overlay — creates depth through glass and gradient.
- **Gradient default:** Subtle white overlay (`rgba(255,255,255,0.05)` → `rgba(255,255,255,0.02)`).
- **Custom gradients:** Used for hero content (emerald wellness card, indigo profile hero, per-stat colored cards).
- **Padding:** 16px internal.
- **Press:** Spring scale to 0.98.
- **Rule:** One PremiumCard per view maximum. They lose meaning when everywhere.

### Inputs
- **Shape:** Rounded-xl (12px), 1px solid border.
- **Default:** Input background with border color.
- **Focus:** Border swaps to Growth Green and thickens to 2px.
- **Error:** Border swaps to Ember.
- **Label:** Small (10px) uppercase label above the field, fades on focus.
- **Keyboard:** Always pushes the viewport.

### Navigation
- **Drawer:** Dark Slate background with an indigo gradient overlay at the top. Active items get Growth Green tint. Items are rounded-xl.
- **Tabs:** Bottom tab bar with icons. Active tab uses Growth Green, resting tabs use Gravel.
- **Header:** Large Display title on root screens, smaller Headline on detail screens. Minimal chrome.

### Chips / Quick Actions
- **Shape:** Rounded-xl, compact. Each chip uses its action color at 12% bg + 20% border opacity.
- **Icon container:** 32px rounded-full with the color at 20% opacity.

### Charts & Stats
- **Pie charts:** Indigo (pending) + Emerald (complete) by default. Use the full stat palette for multi-metric charts.
- **Progress bars:** Emerald fill on dark surface track.
- **Stat cards:** Per-stat gradients (indigo, emerald, amber, pink) in PremiumCard wrappers.

## 6. Do's and Don'ts

### Do:
- **Do** use Growth Green for primary actions and success states.
- **Do** use Indigo for charts, decorative surfaces, and secondary accents.
- **Do** use shadows on interactive cards, modals, dropdowns, and featured content.
- **Do** use PremiumCard (gradient + blur) for hero metrics and profile sections — one per view maximum.
- **Do** use tonal layering for structural depth, shadows for interaction feedback.
- **Do** use spring feedback on press (0.97–0.98 scale).
- **Do** use system fonts for performance.
- **Do** keep all inputs visible when the keyboard is open.

### Don't:
- **Don't** use `#000` or `#fff` — tint every neutral toward the brand hue.
- **Don't** use gradient text (`background-clip: text`).
- **Don't** use side-stripe borders (colored left/right borders >1px as decoration).
- **Don't** use neon colors or bodybuilder imagery.
- **Don't** animate layout properties — use transform and opacity only.
- **Don't** use badges, streaks-as-decoration, or gamification UI.
- **Don't** let the keyboard cover inputs on Android.
- **Don't** use identical card grids repeated endlessly — vary card sizes or mix content types.
- **Don't** use PremiumCard everywhere — it's a deliberate accent, not the default wrapper.
- **Don't** use em dashes in copy.
