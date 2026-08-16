# Logisticiti Intelligence Portal

A daily-updating page of trending freight forwarding / ocean / air cargo news, press releases &amp; advisories, and expert opinion — each item sourced and linked back to the original.

## What's in here
- `index.html` — the portal itself. Open it directly to preview (it ships with today's content baked in as a fallback).
- `data.json` — the current day's content, in a simple structured format. This is what actually drives the page once it's live.
- `generate-content.js` — a script that calls the Claude API (with web search turned on) to research fresh news and rewrite `data.json`.
- `.github/workflows/daily-update.yml` — runs that script automatically, once a day, and commits the new `data.json`.

## 1. Get it live (5 minutes, no server needed)
1. Create a new **public** GitHub repository and push these files into it.
2. In the repo, go to **Settings → Pages**, set source to "Deploy from a branch," branch `main`, folder `/ (root)`.
3. Your portal will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## 2. Turn on the daily auto-update
1. Get an API key from [console.anthropic.com](https://console.anthropic.com) (Anthropic API, separate from your claude.ai login).
2. In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key
3. That's it. The workflow in `.github/workflows/daily-update.yml` runs every day at 09:00 UTC, asks Claude to research the last 24–48 hours of freight/forwarding/air cargo news with web search, and commits a fresh `data.json`. GitHub Pages redeploys automatically.
4. To change the time, edit the `cron` line in that file. To run it right now instead of waiting, go to the **Actions** tab → "Daily freight briefing update" → **Run workflow**.

## 3. The "digest to post" side
The portal is the public-facing page. For your own daily heads-up (so you can review and hand-pick what to actually turn into a LinkedIn post), the cleanest option is **Claude Cowork's Scheduled Tasks** — no code needed:
1. In Claude Cowork, create a scheduled task, daily.
2. Prompt: *"Search for the latest freight forwarding, ocean freight, and air cargo news, press releases, and expert commentary from the last 24 hours. Summarize the top 5–7 items with sources, and draft 2–3 LinkedIn post options in Logisticiti's voice."*
3. Each morning you'll have a draft waiting to review, edit, and post yourself — LinkedIn doesn't allow auto-posting by bots, so this human check is required either way.

## Editing the design or categories
- Categories are `market` (trend/rate/capacity news), `advisory` (press releases, company/carrier news), `opinion` (analysis/expert takes). Add a 4th by extending the `CATEGORY_LABEL` object and filter buttons in `index.html`, and mentioning it in the prompt inside `generate-content.js`.
- Colors, type, and layout live in the `<style>` block at the top of `index.html`.

## Costs
- GitHub Pages + Actions: free for public repos.
- Anthropic API: pay-per-use, billed to your API key. A daily research call like this is typically a small fraction of a dollar per run — check current pricing at [anthropic.com/pricing](https://www.anthropic.com/pricing).
