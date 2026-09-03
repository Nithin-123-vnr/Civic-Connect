---
name: CivicConnect
colors:
  surface: '#faf9fd'
  surface-dim: '#dad9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#1960a3'
  on-secondary: '#ffffff'
  secondary-container: '#7db6ff'
  on-secondary-container: '#00477f'
  tertiary: '#321b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f2e00'
  on-tertiary-container: '#c6955e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004881'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#f2bc82'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#633f0f'
  background: '#faf9fd'
  on-background: '#1a1c1e'
  surface-variant: '#e3e2e6'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  touch-target-min: 44px
---

## Brand & Style
The design system is engineered for public trust, institutional stability, and radical accessibility. It employs a **Corporate / Modern** aesthetic that prioritizes clarity over decoration, ensuring that citizens of all technical abilities can navigate essential services without friction.

The style is characterized by high-contrast interfaces, generous white space, and a systematic approach to information density. By leaning into a structured, grid-based layout with sharp functional clarity, the UI evokes a sense of reliability and official authority. Every design decision is filtered through the lens of WCAG 2.1 AA compliance, ensuring the brand is inclusive by default.

## Colors
The palette is rooted in a "Trust Hierarchy." The primary **Deep Navy** is reserved for global navigation, headers, and primary actions to establish authority. The **Royal Blue** serves as the interaction color for links and secondary buttons.

Semantic colors are calibrated for high legibility:
- **Success (Emerald):** Indicates resolution and positive completion.
- **Warning (Amber):** Signals "In Progress" or "Pending" states with high visibility.
- **Danger (Crimson):** Reserved for escalations, rejections, or critical errors.
- **Neutral (Slate):** A range of cool grays used for structural borders, background offsets, and de-emphasized metadata.

Backgrounds should remain predominantly white (#FFFFFF) to ensure maximum contrast for text-heavy administrative content.

## Typography
This design system utilizes **Inter** for its exceptional legibility at small sizes and its neutral, systematic character. 

The type hierarchy is strictly enforced to guide users through complex forms and dashboards. Headlines use a bold weight to anchor sections, while body text maintains a comfortable 1.5x line height for extended reading. Labels and data points in dashboards utilize a slightly increased letter spacing and semi-bold weight to differentiate "Data" from "Description."

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop dashboards to ensure data columns remain predictable, switching to a **Fluid Grid** for mobile citizen-facing views.

- **Desktop:** 12-column grid with 24px gutters.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px margins.

A strict 8px spatial rhythm is used for all internal component padding. Special attention is given to **Touch Targets**: all interactive elements (buttons, checkboxes, list items) must maintain a minimum height of 44px to accommodate mobile-first accessibility and diverse motor abilities.

## Elevation & Depth
To maintain a professional and "flat" institutional feel, this design system avoids heavy shadows. Instead, it uses **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Surface):** The main background (#FFFFFF).
- **Level 1 (Card):** Defined by a 1px solid border (#E2E8F0). No shadow.
- **Level 2 (Overlay/Modal):** A soft, highly diffused 10% opacity Navy shadow to indicate temporary focus.

Depth is primarily communicated through background color shifts (e.g., a Light Slate #F8FAFC background for the main content area to make white cards "pop").

## Shapes
The design system uses a **Soft (0.25rem)** roundedness profile. This slight rounding takes the edge off the "strict" government aesthetic to appear more modern and approachable without losing the sense of structured authority associated with sharper corners.

- **Buttons/Inputs:** 4px (0.25rem) radius.
- **Cards/Dashboards:** 8px (0.5rem) radius.
- **Status Badges:** Full-pill radius for distinct visual grouping.

## Components
### Status Badges & Priority Indicators
Badges must pair a background tint with a high-contrast icon and bold text. 
- *Critical Priority:* Crimson background (10% opacity) with solid Crimson text and a "Warning Triangle" icon.
- *Low Priority:* Slate background with "Circle" icon.

### Cards & Timelines
Complaint summaries are housed in cards with a dedicated header area for the Reference ID. Tracking timelines use a solid vertical 2px line in Royal Blue, with "Active" nodes marked by a filled circle and "Pending" nodes marked by an outlined circle.

### Data Tables & KPIs
Admin dashboards use condensed data tables with sticky headers. KPI cards should feature a large `headline-lg` value and a smaller `label-md` description.

### Input Fields
Inputs must have a visible 1px border at all times. On focus, the border thickness increases to 2px using the Primary Royal Blue color. All inputs must include persistent helper text or clear error state messaging.

### Buttons
Primary buttons are solid Deep Navy with white text. Secondary buttons are outlined Royal Blue. Every button has a minimum height of 48px on mobile to ensure ease of use.