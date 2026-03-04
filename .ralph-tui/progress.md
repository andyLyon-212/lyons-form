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
