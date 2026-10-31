# Cloud Photo Gallery — 100% Free Version (Supabase)

No AWS. No credit card. No servers to deploy. Everything runs on Supabase's free tier
(500MB database, 1GB storage, 50k monthly active users — plenty for a course project)
plus the browser itself.

## Architecture

```
React SPA ──> Supabase Auth (sign up / sign in)
         └──> Supabase Storage
                 ├─ "originals"  bucket (private, per-user)
                 └─ "thumbnails" bucket (public, per-user folder)
         └──> Supabase Postgres  ("photos" table, secured by Row-Level Security)

Thumbnail generation happens IN THE BROWSER (Canvas API) before upload —
no Lambda / Cloud Function / server needed.
```

**Why this is genuinely free:**
- Supabase's free project tier needs no card to sign up.
- No compute (Lambda/Functions) is used — the browser resizes the image itself.
- Auth, DB, and Storage are all included in the free tier.

## Part A — Create your Supabase project (5 minutes, no card)

1. Go to https://supabase.com → Sign up → **New project**.
2. Pick a name + password for the DB, choose a region, click **Create**.
3. Once it's ready, go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

## Part B — Set up the database + storage

1. In the Supabase dashboard, open **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/schema.sql` from this project and click **Run**.
   This creates the `photos` table with Row-Level Security so users can only see their own rows.
3. Go to **Storage** → **Create a new bucket**:
   - Name: `originals` → toggle **Private**
   - Name: `thumbnails` → toggle **Public**
4. Go to **Storage → Policies** and confirm the policies from `schema.sql` were applied
   (they're included in the same SQL file — if the storage policy section errors because
   the buckets didn't exist yet, just re-run that section after creating the buckets).

## Part C — Run the frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` and paste in your Project URL and anon key from Part A:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then:
```bash
npm run dev
```
Open the printed local URL (usually http://localhost:5173).

## Part D — Test it

1. Sign up with a real email → Supabase sends a confirmation link (check inbox/spam).
2. Click the link, then come back and sign in.
3. Upload a photo — the thumbnail is generated instantly in your browser and both the
   original and thumbnail are uploaded to Supabase Storage.
4. Refresh — the photo persists (real Postgres row + Storage object).
5. Try the sort dropdown (newest vs. largest) and delete a photo.
6. Open an incognito window, sign up as a second user, and confirm you can't see the
   first user's photos — that's the Row-Level Security policy working.

## Part E — Deploy the frontend (optional, also free)

Push this repo to GitHub, then import it on:
- **Vercel** (https://vercel.com) or **Netlify** (https://netlify.com) — both have generous
  free tiers, no card required for hobby projects. Set the two env vars in their dashboard
  under Project Settings → Environment Variables, same as your local `.env`.

## What changed vs. the AWS version

| | AWS version | Free version |
|---|---|---|
| Auth | Cognito | Supabase Auth |
| Database | DynamoDB | Supabase Postgres |
| File storage | S3 (2 buckets) | Supabase Storage (2 buckets) |
| Thumbnails | Lambda + Sharp (S3 trigger) | Browser Canvas API (no server) |
| CDN | CloudFront | Supabase Storage's built-in CDN |
| API layer | API Gateway + Lambda | None — client SDK talks to Supabase directly, secured by RLS |
| Cost / card required | Free tier, but card required | No card, no cost |

## For your course write-up
This still demonstrates core cloud computing concepts:
- **Managed auth-as-a-service** (Supabase Auth)
- **Managed relational database-as-a-service** with **Row-Level Security** for
  multi-tenant data isolation (an important cloud security pattern)
- **Object storage** with public/private access control
- **Client-side compute offload** vs. server-side compute — a good discussion point:
  when does it make sense to do work in the browser vs. a serverless function?
