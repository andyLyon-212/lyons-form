# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Prisma v7 on NixOS**: Requires `nix-shell -p prisma-engines` with env vars `PRISMA_SCHEMA_ENGINE_BINARY`, `PRISMA_QUERY_ENGINE_BINARY`, `PRISMA_FMT_BINARY` for `prisma generate` and `prisma migrate`. The generated client lives at `src/generated/prisma/client` (not index).
- **Prisma v7 driver adapters**: PrismaClient requires an adapter arg: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. Import `PrismaPg` from `@prisma/adapter-pg`.
- **shadcn/ui manual setup**: `npx shadcn` fails on Node.js v25 (NixOS). Components must be installed manually or via `nix-shell` with older Node. The utility `cn()` is at `src/lib/utils.ts`.
- **Quality gates**: `npm run typecheck` (tsc --noEmit) and `npm run lint` (eslint).
- **NextAuth v5 (beta)**: Auth config at `src/lib/auth.ts` exports `{ handlers, signIn, signOut, auth }`. Route handler at `src/app/api/auth/[...nextauth]/route.ts`. Middleware uses `export { auth as middleware }` pattern. Use `bcryptjs` (pure JS, no native deps) for password hashing. JWT/session callbacks needed to propagate `user.id`.
- **React 19 lint strictness**: Cannot update refs during render (`react-hooks/refs`). Cannot call setState inside useEffect (`react-hooks/set-state-in-effect`). For debounced auto-save: trigger from event handlers, pass new values explicitly to avoid stale closures.

---

## 2026-03-04 - lyons-form-ie9.1
- What was implemented:
  - Next.js 16 project with TypeScript, App Router, src directory
  - Tailwind CSS v4 + shadcn/ui (manual setup with CSS variables, cn utility, lucide-react, cva, clsx, tailwind-merge)
  - Prisma v7 with PostgreSQL provider and driver adapter pattern
  - Database schema: User, Form (with FormStatus enum), FormField, FormSubmission models
  - Prisma client singleton at `src/lib/prisma.ts`
  - Seed script (`prisma/seed.ts`) with Contact Form and Event Registration templates
  - postinstall script runs `prisma generate`
- Files changed:
  - package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs
  - src/app/globals.css, src/app/layout.tsx, src/app/page.tsx
  - src/lib/utils.ts, src/lib/prisma.ts
  - prisma/schema.prisma, prisma/seed.ts, prisma.config.ts
  - .env, .gitignore
- **Learnings:**
  - Node.js v25.7.0 on NixOS breaks `npx shadcn` (zod v3 export issue)
  - `create-next-app` won't run in a non-empty dir; scaffold in /tmp and copy files
  - Prisma v7 uses `prisma-client` generator (not `prisma-client-js`), no index.ts in generated output
  - PRD says SubmissionValue table but schema uses JSON `data` column on FormSubmission instead (simpler, matches PRD's JSON approach)
---

## 2026-03-04 - lyons-form-ie9.2
- What was implemented:
  - NextAuth v5 (beta.30) with credentials provider for email/password auth
  - Registration API route at `/api/register` with bcrypt password hashing (cost 12)
  - Registration page at `/register` with name, email, password fields and client-side validation
  - Login page at `/login` with email/password fields, success message after registration
  - Middleware protecting `/dashboard` and `/builder` routes (redirects to `/login`)
  - Placeholder dashboard and builder pages showing authenticated user info
  - AUTH_SECRET added to `.env`
- Files changed:
  - src/lib/auth.ts (NextAuth config)
  - src/app/api/auth/[...nextauth]/route.ts (route handler)
  - src/app/api/register/route.ts (registration API)
  - src/app/(auth)/register/page.tsx, src/app/(auth)/login/page.tsx
  - src/app/(protected)/dashboard/page.tsx, src/app/(protected)/builder/page.tsx
  - middleware.ts
  - .env (AUTH_SECRET)
  - package.json (new deps: next-auth, bcryptjs, @types/bcryptjs)
- **Learnings:**
  - NextAuth v5 beta works with Next.js 16 without issues
  - `bcryptjs` (pure JS) avoids native compilation issues on NixOS vs `bcrypt` (native)
  - NextAuth v5 `authorized` callback in config handles route protection; middleware just re-exports `auth`
  - Route groups `(auth)` and `(protected)` keep auth pages separate from protected pages without affecting URLs
---

## 2026-03-04 - lyons-form-ie9.4
- What was implemented:
  - Builder page at `/builder/[formId]` with three-panel layout (palette, canvas, properties)
  - Field palette with 14 field types in 4 categories: basic (text, email, number, textarea, phone, url, date), choice (dropdown, checkboxes, radio), advanced (file upload, rating), layout (divider, heading)
  - dnd-kit drag-and-drop: fields draggable from palette to canvas, sortable on canvas
  - Canvas with real-time field preview for all field types
  - Inline editable form title and description
  - Properties panel for editing field label, placeholder, help text, required toggle, and options (for choice fields)
  - Delete button on canvas fields
  - Debounced auto-save (1s) to database via PATCH API
  - API routes: GET/PATCH `/api/forms/[formId]`, POST `/api/forms`
  - Added JWT/session callbacks to NextAuth config to include `user.id` in session
- Files changed:
  - src/lib/builder-types.ts (field type definitions and form builder state types)
  - src/lib/auth.ts (added jwt/session callbacks for user.id)
  - src/app/api/forms/route.ts (POST to create new form)
  - src/app/api/forms/[formId]/route.ts (GET/PATCH for form CRUD)
  - src/app/(protected)/builder/[formId]/page.tsx (server component, loads form)
  - src/components/builder/form-builder.tsx (main client component, DndContext, auto-save)
  - src/components/builder/field-palette.tsx (draggable field type palette)
  - src/components/builder/form-canvas.tsx (droppable/sortable canvas)
  - src/components/builder/canvas-field.tsx (individual field with preview + sortable)
  - src/components/builder/properties-panel.tsx (field property editor)
  - package.json (added @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)
- **Learnings:**
  - React 19 + Next.js 16 ESLint rules are very strict: `react-hooks/refs` forbids updating refs during render (the classic `ref.current = value` pattern in function body). Must update refs in event handlers or effects only.
  - `react-hooks/set-state-in-effect` forbids calling setState inside useEffect body (even transitively via a function called from the effect). Debounced auto-save must be triggered from event handlers, not effects watching state changes.
  - dnd-kit v6 core + v10 sortable work well with React 19; standard API unchanged.
  - For auto-save without effects: pass new values explicitly to the save function from event handlers (avoids stale closures), and use setTimeout inside save function to debounce.
  - NextAuth v5 credentials provider doesn't include `user.id` in the session by default; need explicit `jwt` and `session` callbacks to propagate it.
---

## 2026-03-04 - lyons-form-ie9.3
- What was implemented:
  - Dashboard page at `/dashboard` showing all user forms as cards in a responsive grid
  - Each card shows: form title, status badge (draft/published), submission count, created date
  - Three-dot menu on each card with Duplicate and Delete actions
  - Delete form with confirmation dialog warning about submission loss
  - Duplicate form creates a copy with "(Copy)" suffix, all fields duplicated
  - "Create New Form" button opens modal with two options: Start from scratch / Use a template
  - Template selection view shows seeded templates (Contact Form, Event Registration) as selectable cards with field counts
  - Creating from template copies all fields, styles, and metadata
  - Sign out button in header
  - Minimalist modern UI with soft gradient background (slate → blue), backdrop blur header, hover animations
  - Server component fetches initial data; client component handles all interactions
- Files changed:
  - src/app/(protected)/dashboard/page.tsx (server component, fetches forms + templates)
  - src/components/dashboard/dashboard-content.tsx (client component, full dashboard UI)
  - src/app/api/forms/route.ts (added GET handler for listing user forms with submission counts)
  - src/app/api/forms/[formId]/route.ts (added DELETE handler)
  - src/app/api/forms/[formId]/duplicate/route.ts (POST, duplicates form with all fields)
  - src/app/api/forms/from-template/route.ts (POST, creates form from template)
  - src/app/api/templates/route.ts (GET, lists available templates)
- **Learnings:**
  - Prisma `_count` relation works well for submission/field counts without loading full relations
  - `signOut` from `next-auth/react` (client import) vs `signOut` from `@/lib/auth` (server import) — use the client version in client components
  - Server component can fetch initial data and pass to client component to avoid loading states on first render
---

## 2026-03-04 - lyons-form-ie9.5
- What was implemented:
  - Type-specific validation sections in the properties panel for all field types
  - Text/textarea: min/max length, custom regex pattern with error message
  - Number: min/max value
  - Email: built-in email format validation toggle (on by default)
  - Phone: built-in phone format validation toggle (on by default)
  - URL: built-in URL format validation toggle (on by default)
  - File upload: accepted file types (comma-separated extensions), max file size in MB
  - Date picker: min/max date with native date inputs
  - Rating: configurable max stars (3-10, default 5)
  - Option reordering for select/checkbox/radio via drag handles
  - Canvas preview updates immediately: rating shows correct star count, number/date show range hints, file shows accepted types/size, text/textarea show character limits
  - All validation stored in existing `validationRules` field on FormFieldData
- Files changed:
  - src/components/builder/properties-panel.tsx (added ValidationSection component, option reorder handles)
  - src/components/builder/canvas-field.tsx (updated FieldPreview for number, date, file, rating, text, textarea to show validation hints)
- **Learnings:**
  - The `validationRules: Record<string, unknown>` pattern on FormFieldData is flexible enough to store all per-field-type validation without schema changes
  - Built-in format validations (email, phone, url) use "on by default" toggle pattern — checking `!== false` rather than `=== true` means they're enabled without any stored rule
  - Simple mouse-event-based drag reordering works for small lists (options) without needing a full drag library
---

## 2026-03-04 - lyons-form-ie9.6
- What was implemented:
  - Conditional Logic section in the properties panel with toggle, field selector, operator (equals/not equals/contains), and value input
  - `ConditionalLogic` type added to `FormFieldData` with `fieldId`, `operator`, `value`
  - Eye icon indicator on canvas fields that have conditional logic configured
  - `conditionalLogic` persisted through save/load via API route and form builder
  - Published form page at `/forms/[slug]` with real-time conditional field visibility evaluation
  - Form submission API at `/api/forms/[formId]/submit` (only accepts published forms)
  - Published form only submits visible field values (hidden conditional fields excluded)
- Files changed:
  - src/lib/builder-types.ts (added ConditionalLogic type and conditionalLogic to FormFieldData)
  - src/components/builder/properties-panel.tsx (added ConditionalLogicSection component, allFields prop)
  - src/components/builder/canvas-field.tsx (added Eye indicator for conditional fields)
  - src/components/builder/form-builder.tsx (added conditionalLogic to initialForm type and field mapping, passes allFields to PropertiesPanel)
  - src/app/(protected)/builder/[formId]/page.tsx (added conditionalLogic to field mapping)
  - src/app/api/forms/[formId]/route.ts (added conditionalLogic to PATCH field type and createMany data)
  - src/app/forms/[slug]/page.tsx (new: published form server page)
  - src/components/forms/published-form.tsx (new: published form client component with real-time condition evaluation)
  - src/app/api/forms/[formId]/submit/route.ts (new: form submission API)
- **Learnings:**
  - The `conditionalLogic Json?` column was already in the Prisma schema from ie9.1, so no migration was needed
  - For conditional logic evaluation, comparing against string values works well since form field values are all strings (even numbers/dates are stored as string input values)
  - Filtering visible fields before submission ensures hidden conditional fields don't leak data
---

## 2026-03-04 - lyons-form-ie9.7
- What was implemented:
  - Style tab in the builder header with toggle between Fields and Style panels
  - StylePanel component with controls for: background (solid/gradient/image), primary color, font family (7 Google Fonts), font size (small/medium/large), button (color, border radius, text), container (border radius, shadow, padding, max width)
  - Live preview in canvas: background, typography, container styles, and submit button preview all update in real-time
  - FormStyles type and DEFAULT_FORM_STYLES constant in builder-types.ts
  - Style utility functions in style-utils.ts (background, container, font size, Google Fonts URL)
  - Styles persisted as JSON in Form.styles column via PATCH API
  - Published form applies all saved styles with proper merging against defaults
  - Published form uses primary color for radio/checkbox accent, rating stars, and focus states
- Files changed:
  - src/lib/builder-types.ts (added FormStyles, DEFAULT_FORM_STYLES, FONT_OPTIONS, GRADIENT_DIRECTIONS)
  - src/lib/style-utils.ts (new: getBackgroundStyle, getContainerStyle, getFontSizeClass, getGoogleFontsUrl)
  - src/components/builder/style-panel.tsx (new: StylePanel component)
  - src/components/builder/form-builder.tsx (added styles state, tab toggle, StylePanel integration, styles in save)
  - src/components/builder/form-canvas.tsx (added styles prop, live preview with background/font/container styles)
  - src/app/api/forms/[formId]/route.ts (added styles to PATCH handler)
  - src/app/(protected)/builder/[formId]/page.tsx (passes styles to FormBuilder)
  - src/app/forms/[slug]/page.tsx (passes styles to PublishedForm)
  - src/components/forms/published-form.tsx (applies all styles, uses primaryColor for accents)
- **Learnings:**
  - The `styles Json?` column was already in the Prisma schema from ie9.1, no migration needed
  - `mergeStyles()` pattern with spread defaults ensures backwards compatibility when new style properties are added
  - Google Fonts can be loaded via `<link>` in the component body for dynamic font switching (no `@next/next/no-page-custom-font` rule active in this project)
  - Inline `style` props work well for dynamic styling that changes frequently (colors, dimensions) vs Tailwind classes
---

## 2026-03-04 - lyons-form-ie9.8
- What was implemented:
  - Publish/Unpublish toggle button in the builder header
  - Published form accessible at `/f/[slug]` (public, no auth required)
  - Unpublished/draft forms show a "Form Not Available" page at their public URL
  - Share modal with direct link and copy-to-clipboard button
  - Share modal with iframe embed code with customizable width/height
  - Published form renders with all custom styles applied (already from ie9.7)
  - Published form is responsive (already from ie9.6)
  - Moved published form route from `/forms/[slug]` to `/f/[slug]`
  - Added `status` field support to the PATCH API for form status toggling
- Files changed:
  - src/app/f/[slug]/page.tsx (new: public form route with draft handling)
  - src/app/forms/[slug]/page.tsx (removed: old route)
  - src/components/builder/form-builder.tsx (added publish button, share modal, ShareModal component)
  - src/app/api/forms/[formId]/route.ts (added status to PATCH handler)
  - src/app/(protected)/builder/[formId]/page.tsx (passes slug and status to FormBuilder)
- **Learnings:**
  - The PATCH API pattern of spreading optional fields `...(field !== undefined && { field })` makes it easy to add new updatable fields without changing the API structure
  - Share modal using `window.location.origin` for building the full URL works well for generating share links
  - Published form route at `/f/[slug]` is cleaner and shorter than `/forms/[slug]`
---

## 2026-03-04 - lyons-form-ie9.10
- What was implemented:
  - LLM abstraction layer at `src/lib/llm.ts` with provider-agnostic interface (OpenAI/Anthropic)
  - Provider swappable via `LLM_PROVIDER` env var (`openai` default, or `anthropic`)
  - Model configurable via `LLM_MODEL` env var
  - API route at `/api/forms/generate` that sends prompt to LLM and creates form with generated fields
  - "Generate with AI" button added as third option in the dashboard Create New Form modal
  - AI generation view with textarea prompt input, loading spinner, error handling
  - 3 example prompt suggestions to inspire users
  - Generated form is created in DB and user is redirected to builder for review/editing
  - Response validation: parses JSON, filters invalid field types, handles malformed responses
- Files changed:
  - src/lib/llm.ts (new: provider-agnostic LLM abstraction with raw fetch)
  - src/app/api/forms/generate/route.ts (new: AI form generation API)
  - src/components/dashboard/dashboard-content.tsx (added AI generation UI to create modal)
- **Learnings:**
  - Raw fetch to LLM APIs avoids SDK dependencies; OpenAI uses `response_format: { type: "json_object" }` for reliable JSON output, Anthropic relies on system prompt instructions
  - Prisma v7 JSON columns need explicit `as Prisma.InputJsonValue` cast for `Record<string, unknown>` types
  - The create modal's state machine pattern (showTemplates, showAiGenerate booleans) works for simple multi-view modals but would benefit from a discriminated union for more views
---
