# Lyons Form

A form builder application built with Next.js, Prisma, and PostgreSQL. Create forms from scratch, use templates, or generate them with AI. Publish and share forms via unique links.

## Prerequisites

- Node.js 20+
- PostgreSQL running locally

## Setup

1. **Clone and install dependencies:**

```bash
git clone https://github.com/andyLyon-212/lyons-form.git
cd lyons-form
npm install
```

2. **Configure environment variables:**

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://<your-user>@localhost:5432/lyons_form?schema=public"
AUTH_SECRET="<generate-a-secret>"
```

Generate `AUTH_SECRET` with:

```bash
npx auth secret
# or
openssl rand -base64 32
```

3. **Create the database:**

```bash
createdb lyons_form
```

4. **Push the schema and seed templates:**

```bash
npx prisma db push
npx prisma db seed
```

## Running

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — register a new account to start building forms.

## Features

- Drag-and-drop form builder
- Field types: text, email, phone, number, textarea, select, radio, checkbox
- Conditional logic (show/hide fields based on answers)
- Form styling customization (colors, fonts, backgrounds)
- Publish forms and share via unique link
- View submissions in the dashboard
- Starter templates (Contact Form, Event Registration)
- AI-powered form generation

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5 (Credentials)
- **Styling:** Tailwind CSS v4
- **Drag & Drop:** dnd-kit
