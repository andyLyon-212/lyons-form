# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Prisma v7 on NixOS**: Requires `nix-shell -p prisma-engines` with env vars `PRISMA_SCHEMA_ENGINE_BINARY`, `PRISMA_QUERY_ENGINE_BINARY`, `PRISMA_FMT_BINARY` for `prisma generate` and `prisma migrate`. The generated client lives at `src/generated/prisma/client` (not index).
- **Prisma v7 driver adapters**: PrismaClient requires an adapter arg: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. Import `PrismaPg` from `@prisma/adapter-pg`.
- **shadcn/ui manual setup**: `npx shadcn` fails on Node.js v25 (NixOS). Components must be installed manually or via `nix-shell` with older Node. The utility `cn()` is at `src/lib/utils.ts`.
- **Quality gates**: `npm run typecheck` (tsc --noEmit) and `npm run lint` (eslint).

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
