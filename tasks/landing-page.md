# Landing Page - Marvel Rivals Style

## Objective
Replace the current home page (`src/app/page.tsx`) with a dark-themed, visually impactful landing page inspired by Marvel Rivals' aesthetic. The page explains what Lyons Form does and includes Login/Register CTAs.

## Design Style
- **Dark theme**: Deep blacks/dark grays background
- **Vibrant accent gradients**: Electric blue, purple, magenta highlights
- **Bold typography**: Large hero headlines, clean sans-serif
- **Card-based sections**: Glassmorphism cards with subtle borders
- **Smooth animations**: Fade-in on scroll, hover effects, floating elements
- **Full-width hero section** with a strong CTA

## Sections

### 1. Navigation Bar (sticky)
- Logo: "LYONS FORM" bold text
- Nav links: Features, How It Works, Templates
- CTA buttons: Login (outlined), Register (filled gradient)

### 2. Hero Section
- Large headline: "Build Powerful Forms in Minutes"
- Subtitle explaining the app
- Two CTA buttons: "Get Started Free" → /register, "Sign In" → /login
- Animated gradient background or particle effect (CSS-only)

### 3. Features Grid (3 columns)
- **Drag & Drop Builder**: Build forms visually with drag-and-drop
- **AI Generation**: Describe your form and let AI create it
- **Smart Logic**: Conditional fields that show/hide based on answers
- **Templates**: Start with pre-built templates
- **Custom Styling**: Full control over colors, fonts, backgrounds
- **Instant Publishing**: One-click publish and share via link

### 4. How It Works (3 steps)
1. Create — Start from scratch, use a template, or generate with AI
2. Customize — Add fields, set validation, style your form
3. Share — Publish and share your form link with anyone

### 5. CTA Section
- "Ready to Build?" with Register button

### 6. Footer
- Simple footer with copyright

## Tech
- Pure Tailwind CSS, no extra dependencies
- CSS animations for gradients and fade-ins
- Responsive (mobile-first)
- All in `src/app/page.tsx` (single file, no extra components needed)
