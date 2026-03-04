# PRD: Lyons Form — AI-Powered Form Builder

## Overview
Lyons Form is a web-based form builder platform similar to Jotform and Zoho Forms. It allows users to create fully customizable online forms via drag-and-drop, style them with modern design options (colors, gradients, typography), and leverage AI to auto-generate form structures from natural language prompts. The MVP focuses on a single-user experience with a clean, minimalist UI, two starter templates, and embeddable/shareable form publishing.

## Goals
- Provide an intuitive drag-and-drop form builder with real-time preview
- Support rich form styling (colors, backgrounds, gradients, typography) at the form level
- Deliver AI-powered form generation from natural language prompts
- Include two starter templates (Contact form, Event registration)
- Allow forms to be shared via public link or embedded via iframe
- Store form submissions in PostgreSQL with a simple table view
- Build on Next.js with a clean, scalable architecture

## Quality Gates

These commands must pass for every user story:
- `npm run typecheck` - Type checking
- `npm run lint` - Linting

## User Stories

### US-001: Project scaffolding and database setup
**Description:** As a developer, I want the Next.js project initialized with all core dependencies and database schema so that development can begin on a solid foundation.

**Acceptance Criteria:**
- [ ] Next.js 14+ app router project created with TypeScript
- [ ] Tailwind CSS + shadcn/ui installed and configured
- [ ] Prisma installed with PostgreSQL provider
- [ ] Database schema created with tables: `User`, `Form`, `FormField`, `FormSubmission`, `SubmissionValue`
- [ ] `User` table has: id, email, passwordHash, name, createdAt, updatedAt
- [ ] `Form` table has: id, userId, title, description, slug (unique), styles (JSON), status (draft/published), isTemplate, createdAt, updatedAt
- [ ] `FormField` table has: id, formId, type, label, placeholder, helpText, required, validationRules (JSON), options (JSON for select/radio/checkbox), order, conditionalLogic (JSON), createdAt
- [ ] `FormSubmission` table has: id, formId, data (JSON), submittedAt
- [ ] Seed script creates the two starter templates
- [ ] `npm run typecheck` and `npm run lint` pass

### US-002: Email/password authentication
**Description:** As a user, I want to register and log in with email and password so that I can manage my forms securely.

**Acceptance Criteria:**
- [ ] Registration page at `/register` with email, password, and name fields
- [ ] Login page at `/login` with email and password fields
- [ ] Passwords hashed with bcrypt before storing
- [ ] NextAuth.js (or Auth.js) configured with credentials provider
- [ ] Session-based auth with protected routes for `/dashboard` and `/builder`
- [ ] Redirect unauthenticated users to `/login`
- [ ] Basic form validation on auth forms (required fields, email format, min password length)

### US-003: Dashboard — form management
**Description:** As a user, I want a dashboard where I can see all my forms, create new ones, and manage existing ones.

**Acceptance Criteria:**
- [ ] Dashboard page at `/dashboard` showing all user forms as cards
- [ ] Each card shows: form title, status (draft/published), submission count, created date
- [ ] "Create New Form" button that opens a modal with options: "Start from scratch" or "Use a template"
- [ ] "Use a template" shows the two starter templates as selectable cards
- [ ] Clicking a form card navigates to the builder at `/builder/[formId]`
- [ ] Delete form action with confirmation dialog
- [ ] Duplicate form action
- [ ] Minimalist, modern UI with soft gradient accents

### US-004: Drag-and-drop form builder — field palette and canvas
**Description:** As a user, I want to drag field types from a sidebar palette onto a canvas to build my form visually.

**Acceptance Criteria:**
- [ ] Builder page at `/builder/[formId]` with three-panel layout: left palette, center canvas, right properties panel
- [ ] Left palette lists available field types: text, email, number, textarea, select/dropdown, checkbox group, radio group, file upload, date picker, phone, URL, rating (stars), divider/heading
- [ ] Fields can be dragged from palette and dropped onto the canvas using `dnd-kit`
- [ ] Fields on canvas can be reordered via drag-and-drop
- [ ] Clicking a field on canvas selects it and opens its properties in the right panel
- [ ] Fields can be deleted from the canvas via a delete button/icon
- [ ] Canvas shows a real-time preview of how the form will look
- [ ] Form title and description are editable inline at the top of the canvas
- [ ] Auto-save form state to database on changes (debounced)

### US-005: Field properties and validation configuration
**Description:** As a user, I want to configure each field's properties (label, placeholder, required, validation) so that my form collects the right data.

**Acceptance Criteria:**
- [ ] Right panel shows properties when a field is selected
- [ ] Common properties for all fields: label, placeholder text, help text, required toggle
- [ ] Select/radio/checkbox fields: add/remove/reorder options
- [ ] Number field: min/max value
- [ ] Text/textarea: min/max length, custom regex pattern with error message
- [ ] Email field: built-in email format validation
- [ ] Phone field: built-in phone format validation
- [ ] URL field: built-in URL format validation
- [ ] File upload: accepted file types, max file size
- [ ] Date picker: min/max date
- [ ] Rating: max stars (3-10)
- [ ] Changes to properties reflect immediately on canvas preview

### US-006: Simple conditional show/hide logic
**Description:** As a user, I want to show or hide fields based on another field's value so that my forms are dynamic and relevant.

**Acceptance Criteria:**
- [ ] Each field's properties panel has a "Conditional Logic" section
- [ ] User can set: "Show this field when [field X] [equals/not equals/contains] [value]"
- [ ] Field X dropdown lists all other fields in the form
- [ ] Conditional logic is stored in the field's `conditionalLogic` JSON column
- [ ] Canvas preview reflects conditional logic (shows indicator icon on conditional fields)
- [ ] Published form evaluates conditions in real-time as respondent fills the form

### US-007: Form styling customization
**Description:** As a user, I want to customize the visual style of my form (colors, backgrounds, gradients, typography) so that it matches my brand.

**Acceptance Criteria:**
- [ ] Style panel accessible via a "Style" tab in the builder
- [ ] Background options: solid color picker, gradient builder (two colors + direction), image URL
- [ ] Primary color picker (used for buttons, focus states, accents)
- [ ] Font family selector (at least 5 Google Fonts options)
- [ ] Font size options: small, medium, large
- [ ] Button style: color, border radius, text
- [ ] Form container: border radius, shadow, padding, max-width
- [ ] Live preview updates as styles are changed
- [ ] Styles stored as JSON in the `Form.styles` column
- [ ] Default style is minimalist with soft gradient background

### US-008: Form publishing and sharing
**Description:** As a user, I want to publish my form and share it via a link or embed it on my website.

**Acceptance Criteria:**
- [ ] "Publish" button in builder toggles form status to published
- [ ] Published form accessible at `/f/[slug]` (public, no auth required)
- [ ] Share modal shows: direct link, copy-to-clipboard button
- [ ] Share modal shows: iframe embed code with customizable width/height
- [ ] Unpublished/draft forms show a "Form not available" page at their public URL
- [ ] Published form renders with all custom styles applied
- [ ] Published form is responsive (works on mobile, tablet, desktop)

### US-009: Form submission and response handling
**Description:** As a user, I want respondents to submit forms and I want to view submissions in a simple table.

**Acceptance Criteria:**
- [ ] Published form has a submit button that posts data to an API route
- [ ] Server-side validation runs all field validation rules before saving
- [ ] Submission stored in `FormSubmission` table with all field data as JSON
- [ ] File uploads stored (local filesystem or cloud — use local for MVP)
- [ ] Success message shown to respondent after submission
- [ ] Form owner can view submissions at `/dashboard/forms/[formId]/submissions`
- [ ] Submissions displayed in a sortable table with columns matching form fields
- [ ] Individual submission detail view showing all responses

### US-010: AI-powered form generation
**Description:** As a user, I want to describe a form in natural language and have AI generate a complete form structure so that I can create forms faster.

**Acceptance Criteria:**
- [ ] "Generate with AI" button available on the dashboard "Create New Form" flow
- [ ] Text input/textarea for user prompt (e.g., "Create a customer feedback form for a restaurant")
- [ ] Backend API route sends prompt to an LLM (provider-agnostic abstraction layer)
- [ ] LLM abstraction supports swapping providers via environment variable (e.g., `LLM_PROVIDER=openai` or `LLM_PROVIDER=anthropic`)
- [ ] AI returns structured JSON with: form title, description, fields (type, label, placeholder, validation, options), logical section groupings via divider/heading fields
- [ ] Generated form is loaded into the builder for user to review and edit
- [ ] Loading state shown during AI generation
- [ ] Error handling with user-friendly message if generation fails
- [ ] At least 3 example prompt suggestions shown to inspire users

### US-011: Starter template — Contact Form
**Description:** As a user, I want a pre-built Contact Form template so that I can quickly create a standard contact form.

**Acceptance Criteria:**
- [ ] Template includes fields: Name (text, required), Email (email, required), Phone (phone, optional), Subject (select with options: General Inquiry, Support, Feedback, Other), Message (textarea, required)
- [ ] Template has a clean default style with soft blue gradient background
- [ ] Template is selectable from the "Create from template" flow
- [ ] Selecting it creates a copy of the template as a new form owned by the user
- [ ] All fields are fully editable after creation

### US-012: Starter template — Event Registration
**Description:** As a user, I want a pre-built Event Registration template so that I can quickly create event signup forms.

**Acceptance Criteria:**
- [ ] Template includes fields: Full Name (text, required), Email (email, required), Phone (phone, optional), Organization (text, optional), Number of Attendees (number, min 1, required), Dietary Requirements (checkbox group: None, Vegetarian, Vegan, Gluten-free, Other), Special Accommodations (textarea, optional), "Do you need parking?" (radio: Yes/No), conditional: "Vehicle plate number" (text, shown when parking = Yes)
- [ ] Template has a clean default style with soft green gradient background
- [ ] Template is selectable from the "Create from template" flow
- [ ] Selecting it creates a copy as a new form owned by the user
- [ ] Conditional logic on parking field works correctly

## Functional Requirements

- FR-1: The system must use Next.js App Router with TypeScript
- FR-2: The system must use PostgreSQL as the database via Prisma ORM
- FR-3: The system must use `dnd-kit` for all drag-and-drop interactions
- FR-4: The system must use Tailwind CSS + shadcn/ui for the UI component layer
- FR-5: The system must hash passwords with bcrypt and manage sessions via NextAuth.js
- FR-6: The system must auto-save form changes in the builder (debounced, ~2s after last change)
- FR-7: The system must generate unique slugs for each form for public URLs
- FR-8: The system must validate all form submissions server-side before storing
- FR-9: The system must provide an LLM abstraction layer that accepts a provider config via environment variable
- FR-10: The system must render published forms with all custom styles without requiring authentication
- FR-11: The system must support iframe embedding with appropriate CORS and X-Frame-Options headers
- FR-12: The system must be responsive across mobile, tablet, and desktop viewports

## Non-Goals (Out of Scope)
- Multi-user teams, organizations, or role-based access
- Multi-step/multi-page forms
- Payment field integration
- Form analytics dashboard or charts
- CSV/Excel export of submissions
- Custom domains or subdomains per user
- Email notifications on form submission
- Webhooks or third-party integrations
- Form versioning or revision history
- Conditional logic beyond simple show/hide
- A/B testing of forms

## Technical Considerations
- **Next.js App Router** with server components for data fetching, client components for interactive builder
- **Prisma** with PostgreSQL — use JSON columns for flexible field configs, styles, and submission data
- **dnd-kit** — use `@dnd-kit/core` and `@dnd-kit/sortable` for the builder canvas
- **shadcn/ui** — leverage existing components (Dialog, Select, Input, Button, Table, Tabs) for consistent UI
- **LLM abstraction** — create a simple adapter interface (`generateForm(prompt: string): FormStructure`) with implementations for OpenAI and Anthropic; select via `LLM_PROVIDER` env var
- **Form rendering** — create a shared `FormRenderer` component used in both builder preview and public form view
- **File uploads** — store to `/public/uploads` for MVP; design the interface for future cloud storage migration
- **Styling engine** — convert the `Form.styles` JSON into CSS custom properties applied to the form container

## Success Metrics
- User can create a form from scratch via drag-and-drop in under 3 minutes
- User can generate a form via AI prompt and have it ready to edit in under 10 seconds
- Published forms render correctly on mobile and desktop
- All 13 field types function correctly with their validation rules
- Both templates are fully functional with conditional logic working
- Iframe embedding works on external websites

## Open Questions
- Should we add rate limiting on form submissions to prevent spam?
- Should published forms include a CAPTCHA or honeypot for bot protection?
- What cloud storage provider should be used for file uploads post-MVP?
- Should we support form duplication across user accounts (sharing templates publicly)?
