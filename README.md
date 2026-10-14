# Bruin Lost and Found

Campus lost-and-found demo. Students upload a photo, review an AI description, search in plain language, submit a claim, and staff approve pickup.

Matching follows [Qwen3-VL-Embedding and Qwen3-VL-Reranker: A Unified Framework for State-of-the-Art Multimodal Retrieval and Ranking](https://github.com/QwenLM/Qwen3-VL-Embedding) (January 2026): embed listings and queries with Qwen3-VL-Embedding, then optionally refine with Qwen3-VL-Reranker.

## Quick start (demo mode)

No Supabase or Qwen credentials required.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Sign in as **Demo student** (`bruin@ucla.edu`) or any `@ucla.edu` address.
2. Open **Upload** and click a **live demo kit** photo (or pick the same file from `public/demo/`).
3. Click **Generate description**. For kit photos this fills a labeled mock listing; it is not real Qwen inference. Edit anything you want, then **Publish listing**.
4. On the item page, type your own description (for example `green backpack with a rubber duck`) and search. The item you published should rank first.
6. Open a match and submit a claim with identifying details.
7. Sign out, sign in as **Demo staff** (`staff@ucla.edu`), open **Admin**, and approve pickup.
8. Sign back in as the student to see the in-app alert.

The gold banner states when the database is local demo data and when vision/matching are **mock — not real Qwen inference**. Simulated AI is never labeled as live.

## Scripts

```bash
npm run dev      # local app
npm test         # mock embedding ranking (no paid APIs)
npm run backup   # copy .data/store.json if you have local demo data
npm run build
```

## Environment

See `.env.example`. Secrets stay in `.env.local` (gitignored).

| Variable | Purpose |
| --- | --- |
| `ALLOWED_EMAIL_DOMAINS` | Comma-separated university domains. Default `ucla.edu`. |
| `STAFF_EMAILS` | Emails granted the staff role on sign-in. |
| `SESSION_SECRET` | Signs the demo session cookie. |
| `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` | Postgres, pgvector, Auth, Storage. Empty → labeled demo mode. |
| `QWEN_VISION_URL` + `QWEN_API_KEY` | OpenAI-compatible VLM (`/v1/chat/completions`). |
| `QWEN_EMBEDDING_URL` | vLLM-style `/v1/embeddings` for Qwen3-VL-Embedding. |
| `QWEN_RERANK_URL` | Optional `/v1/rerank` for Qwen3-VL-Reranker. |

Real AI responses are cached in the store (`ai_cache`). Automated tests never call paid endpoints.

## Supabase

1. Create a project and enable the `vector` extension.
2. Run `supabase/migrations/0001_init.sql` and optionally `supabase/seed.sql`.
3. Create a public Storage bucket named `item-photos` if the insert in the migration is skipped.
4. Enable email confirmation in Auth. Restrict sign-up to `ALLOWED_EMAIL_DOMAINS` in the app; staff permissions are enforced in API routes, not only in the UI.
5. Use Supabase PITR / scheduled backups for the database. Local demo data can be copied with `npm run backup`.

Staff APIs call `requireStaff()` on the server.

## AI jobs

Vision, embedding, and rerank calls go through `lib/jobs/queue.ts` with three retries. This process is in-app (good enough for the hackathon). A standalone worker is listed under remaining work.

## Demo-only behavior

- Local JSON store in `.data/` plus sample listings in `lib/demo/seed.ts`.
- Immediate “verified” university email via `/api/auth/demo` instead of a magic link.
- Mock vision returns a clearly labeled placeholder you must edit.
- Mock embeddings are lexical hashed vectors so search still ranks related seed items.
- Reranking is skipped until `QWEN_RERANK_URL` is set (stretch goal).
- In-app alerts only; no email.

## Remaining work

- Wire Supabase magic-link login in the UI (schema and env are ready).
- Dedicated background worker process instead of in-request retries.
- Email notifications when matches appear.
- Multimodal image+text embeddings (text of the reviewed description is used today).
- Stronger claim evidence (ID photo upload) and abuse reporting.
- Production monitoring beyond `.data/error.log` and host logs (Sentry or equivalent).
