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
AUTH_SECRET="your_secret_here" # generate via npx auth secret
AUTH_URL="http://localhost:3000"
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

This project uses **Auth.js** (NextAuth v5 beta) to allow users to sign in. Users can then independently connect their social accounts (X, Reddit, etc.) to the application.

1. **Sign In**: Currently configured for `Google`, `Email (Magic Link)`, and `Twitter` for the primary sign in. You must configure their relative `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `EMAIL_SERVER` in `.env.local`.
2. **Connect**: Head over to the **Connections** page to authorize the app to post on your behalf to the various platforms.

> Note: To fully test posting simultaneously, you must acquire the real Client IDs and Secrets from each platform's developer portal and place them in `.env.local` as `AUTH_TWITTER_ID`, `AUTH_FACEBOOK_ID`, etc.
