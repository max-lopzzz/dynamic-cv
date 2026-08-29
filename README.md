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
guestbook is optional: to turn it on, add a **Redis** store in Vercel
(**Storage → Create Database → Redis**) and connect it to the project —
this auto-injects `KV_REDIS_URL`. Without it, the guestbook window shows a
"not wired up yet" message instead of breaking the page.
