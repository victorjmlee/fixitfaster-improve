# Fix It Faster – Leaderboard

Challenge list, submissions, and leaderboard. Deploy to **Vercel** (recommended) or Elastic Beanstalk.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy with Vercel (recommended)

1. **Sign in** at [vercel.com](https://vercel.com) with GitHub.
2. **Import project** → select this repo.
3. **Root Directory**: leave blank (repo root is the app).
4. **Framework**: Next.js. Build: `npm run build`, Install: `npm install`.
5. **Deploy**. Future pushes to `main` trigger automatic redeploys.

**CLI one-off deploy:**

```bash
npx vercel
```

## Deploy with Elastic Beanstalk

1. From repo root: `eb use <environment-name>` (once).
2. Deploy:
   ```bash
   npm run deploy
   ```
   For a specific region (e.g. ap-northeast-2):
   ```bash
   AWS_REGION=ap-northeast-2 npm run deploy
   ```
   Or: `./scripts/deploy-eb.sh <environment-name> [region]`

Requires `.elasticbeanstalk/config.yml` in the repo root (run `eb init` if needed).

## Directory structure

```
app/           # Next.js pages and API
lib/           # Challenge parsing, submission store
challenges/    # Scenario .md files
data/          # submissions.json (created at runtime)
scripts/       # start-server.js, deploy-eb.sh
```

Agent and demos for the hands-on live in a separate repo: [CrystalBellSound/fixitfaster-agent](https://github.com/CrystalBellSound/fixitfaster-agent).
