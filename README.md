# PSX knowledge assistant — POC

A retrieval-augmented chatbot that answers questions **only** from documents
uploaded through the admin portal. If a question isn't covered by an
uploaded document, it says so instead of guessing.

**Functional:** document upload (PDF / DOCX / TXT) → parsing → chunking →
embedding → storage, and the chat endpoint that retrieves + generates
grounded, cited answers.

**Illustrative only (static/mock data):** Approval queue, Users & roles,
Analytics pages in the admin portal. The Dashboard's four stat cards are
real; everything below them on that page is a mockup. These are all clearly
labelled "Phase 2 concept" in the UI.

---

## Architecture

```
React (Vercel) ──► FastAPI (Render) ──► OpenAI (chat + embeddings)
                          │
                          └──► Supabase Postgres + pgvector
                               (documents, chunks, interactions)
```

Everything runs on free tiers. No local database required — the admin
portal and chat both talk to the same cloud backend, so anyone with the
deployed URL can demo it without your machine.

---

## 1. Set up Supabase (database)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the contents of
   `backend/schema.sql`, and run it. This enables `pgvector` and creates
   the `documents`, `chunks`, and `interactions` tables.
3. Go to **Project Settings → Database → Connection string → URI**, and
   copy the **Transaction pooler** connection string (port `6543`). This is
   your `DATABASE_URL`.

## 2. Deploy the backend (Render)

1. Push this repo to GitHub.
2. In [Render](https://render.com), **New → Blueprint**, point it at the
   repo — it will detect `backend/render.yaml` automatically. Alternatively,
   create a **Web Service** manually with:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Set these environment variables on the service:
   | Key | Value |
   |---|---|
   | `OPENAI_API_KEY` | your OpenAI key |
   | `DATABASE_URL` | the Supabase pooler URI from step 1 |
   | `ADMIN_PASSWORD` | a password for the admin portal |
   | `CORS_ORIGINS` | your Vercel URL once you have it (step 3) — comma-separated if more than one |
   | `OPENAI_CHAT_MODEL` | `gpt-4o-mini` (default, cheap and fast) |
   | `OPENAI_EMBED_MODEL` | `text-embedding-3-small` (default) |
4. Deploy. Note the service URL, e.g. `https://psx-chatbot-poc-api.onrender.com`.

Free tier note: Render's free web services sleep after inactivity and take
~30–60s to wake on the next request. For a live pitch, open the chat a
minute beforehand to warm it up, or upgrade to the paid tier ($7/mo) if
that's a concern.

## 3. Deploy the frontend (Vercel)

1. In [Vercel](https://vercel.com), **New Project**, import the repo, set:
   - Root directory: `frontend`
   - Framework preset: Vite
2. Add environment variable `VITE_API_URL` = your Render backend URL from
   step 2 (no trailing slash).
3. Deploy. Note the resulting URL, e.g. `https://psx-chatbot-poc.vercel.app`.
4. Go back to Render and set `CORS_ORIGINS` to this Vercel URL, then
   redeploy the backend so it accepts requests from it.

## 4. Try it

- Public chat: your Vercel URL.
- Admin portal: your Vercel URL + `/admin/login`, password = whatever you
  set as `ADMIN_PASSWORD`.
- Upload a PDF/DOCX/TXT in **Documents**, wait for the status to flip to
  **Ready** (a few seconds to ~1 minute depending on length), then ask a
  question about it in the chat.
- Ask something unrelated to the uploaded content — it should decline
  rather than answer from general knowledge. This is the core thing worth
  demonstrating.

---

## Local development (optional)

Backend:
```
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in OPENAI_API_KEY and the Supabase DATABASE_URL
uvicorn app.main:app --reload
```

Frontend:
```
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Both point at the same Supabase database, so local and deployed use are
interchangeable — you don't need a separate local database.

---

## How grounding is enforced

1. **Retrieval** — hybrid: pgvector cosine similarity search, re-scored
   with a keyword-overlap boost (sharpens exact-term matches like clause
   numbers without standing up a separate BM25 service).
2. **Confidence gate** — if the top match scores below
   `CONFIDENCE_THRESHOLD` (default `0.28`), the app returns "not found"
   without calling the LLM at all.
3. **Constrained generation** — the system prompt instructs the model to
   answer only from the retrieved excerpts and to say so explicitly if they
   don't cover the question.
4. **Citation-gated display** — citations shown to the user are the ones
   the model actually referenced by number in its answer, not just the raw
   top-k retrieval results.

This is the POC's core hypothesis under test: that RAG can reliably
distinguish "answerable from the knowledge base" from "not," rather than
filling gaps with the model's general knowledge.

## Known POC limitations (by design, not oversight)

- Single shared admin password, no real user accounts or RBAC enforcement.
- CSV ingestion is out of scope for this pass.
- No document versioning, approval workflow, or audit trail — see the
  Approval queue / Users & roles pages for what that would look like.
- Render's free tier cold-starts; not representative of production latency.
