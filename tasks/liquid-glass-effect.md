# Liquid Glass Effect (iOS/macOS Style)

## Objective
Add a "Liquid Glass" toggle in the Style Panel that applies Apple's Liquid Glass effect (from iOS 26 / macOS Tahoe) to form fields, the form container, and the submit button in published forms.

## What is Liquid Glass?
Apple's Liquid Glass is a translucent, frosted-glass design language using:
- Semi-transparent backgrounds (`rgba(255,255,255,0.15)`)
- `backdrop-filter: blur() saturate()`
- Inner glow via `inset box-shadow`
- Subtle border with `rgba(255,255,255,0.3)`
- Specular highlight shimmer via `::after` pseudo-element

## Implementation

### 1. Add `liquidGlass` boolean to `FormStyles`
- File: `src/lib/builder-types.ts`
- Add `liquidGlass: boolean` to `FormStyles` interface
- Default: `false`

### 2. Add toggle in Style Panel
- File: `src/components/builder/style-panel.tsx`
- Add a toggle switch under a new "Effects" section
- Label: "Liquid Glass"
- Description: "Apply frosted glass effect to all fields"

### 3. Apply effect in Published Form
- File: `src/components/forms/published-form.tsx`
- When `liquidGlass` is true:
  - Form container: translucent bg, backdrop-filter blur, inner glow shadow, subtle white border
  - Each field card: same glass treatment
  - Input fields: transparent background with subtle border
  - Submit button: glass treatment with primary color tint

### 4. CSS styles applied when liquidGlass is enabled
```css
/* Container & field cards */
background: rgba(255, 255, 255, 0.12);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.25);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);

/* Input fields */
background: rgba(255, 255, 255, 0.08);
border: 1px solid rgba(255, 255, 255, 0.15);
backdrop-filter: blur(8px);

/* Submit button */
background: rgba(primaryColor, 0.7);
backdrop-filter: blur(12px) saturate(150%);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
```

### Notes
- Works best with gradient or image backgrounds
- Pure CSS, no extra dependencies
- The effect is only visual — no behavior changes
