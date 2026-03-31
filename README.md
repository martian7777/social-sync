# SocialSync

A modern application enabling users to compose and publish content to X (Twitter), Facebook, Instagram, TikTok, and Reddit from a single, unified interface.

## Quick Start

### 1. Configure the Environment

Rename or copy your `.env.local` snippet to the root. You must populate the `DATABASE_URL` and `DIRECT_URL` with your Supabase Postgres credentials.

**Supabase Setup:**
1. Create a new Supabase project.
2. Go to Project Settings -> Database.
3. Find your Connection String (Transaction mode typically uses `6543` and points to the pooler). This is your `DATABASE_URL` (make sure it has `?pgbouncer=true`).
4. Find your Direct Connection string (Session mode, port `5432`). This is your `DIRECT_URL`.

```bash
# .env.local
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]..."
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 2. Initialize Database Schema

Once your environment variables are set, run the following to push the schema to Supabase:

```bash
npx prisma db push
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentication & OAuth Connections

This project uses **Clerk** to handle user authentication and social connections.

1. **Sign In**: Configurable in your Clerk Dashboard. Provide the respective `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env.local`.
2. **Connect Platforms**: Head over to the **Connections** page and use your Clerk User Profile to authorize the app to post on your behalf by connecting external OAuth accounts (e.g. Twitter, Facebook, TikTok).

> Note: To test posting simultaneously, you must acquire the real Client IDs and Secrets from each platform's developer portal and configure them as **Social Connections** within your Clerk Dashboard.
