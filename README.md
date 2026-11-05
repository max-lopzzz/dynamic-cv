# Maximiliano’s portfolio

A static Next.js portfolio, ready to deploy on Vercel.

## Live site

[dynamic-cv-inky.vercel.app](https://dynamic-cv-inky.vercel.app/)

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Create a GitHub repository and push this project.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the detected **Next.js** settings and select **Deploy**.

The core portfolio needs no environment variables and is fully static. The
guestbook and Clippy are optional and both use Redis: in Vercel, go to
**Storage → Create Database → Upstash (Redis)** and connect it to the project.
The code reads the connection string from `KV_REDIS_URL`, `REDIS_URL` or
`KV_URL` (first one set wins), so whichever the integration injects works.
Without Redis, the guestbook window shows a "not wired up yet" message
instead of breaking the page.

## Clippy assistant

Clippy is a Windows 98 style chat assistant that answers questions about me.
It streams replies from [Groq](https://console.groq.com) and only needs:

| Variable | Required | Notes |
| --- | --- | --- |
| `GROQ_API_KEY` | yes | Create it in the Groq console. |
| `GROQ_MODEL` | no | Defaults to `openai/gpt-oss-120b`. Groq retires models, so check console.groq.com/docs/models before changing it. |
| `KV_REDIS_URL` / `REDIS_URL` / `KV_URL` | yes | Redis, used for rate limits (see above). |

For local dev, put `GROQ_API_KEY` and the Redis URL in `.env.local`. It is
gitignored; never commit it.

If `GROQ_API_KEY` or Redis is missing, Clippy's chat replies with a friendly
"taking a little nap" message while the rest of the site keeps working.

Set a **spend limit** in the Groq console so a runaway bill is impossible.

Limits (change the constants and redeploy):

- `app/clippy/limits.ts`: `VISITOR_DAILY_LIMIT` (20 messages per visitor per
  day, keyed by hashed IP) and `GLOBAL_DAILY_LIMIT` (500 per day, site-wide).
- `app/clippy/validate.ts`: `MAX_INPUT_CHARS` (500 per message) and
  `MAX_HISTORY` (last 6 messages kept).
- `app/clippy/groq.ts`: `max_tokens` (300 per reply) and `GROQ_TIMEOUT_MS`
  (gives up on Groq after 20s).

What Clippy knows and says:

- `app/clippy/knowledge.ts`: the facts it may use. It is told to answer only
  from these, so keep them accurate.
- `app/clippy/hints.ts`: achievement hints (nudges, never solutions) and the site guide Clippy uses to suggest windows.
- `app/clippy/invitations.ts`: the invitation bubbles that pop up.
- `app/components/clippy/ClippyAgent.tsx`: timings (Clippy appears 0.5s
  after the desktop; first bubble 6s after that, then every 2 minutes while
  the chat has never been opened; each stays 10s; "Just browsing, thanks"
  pushes the next one back 5 minutes). Clicking Clippy opens the bubble any time.

Credits: the agent is rendered with [clippyjs](https://github.com/pi0/clippyjs)
(MIT). Clippy's name and artwork belong to Microsoft; this is a fan/parody
use and is not affiliated with or endorsed by them.
