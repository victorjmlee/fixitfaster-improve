# Proposal: Fix It Faster — One-Time Team Activity (Q2)

**To:** Managers  
**From:** [Your name / team]  
**Re:** Datadog troubleshooting hands-on competition  
**Target:** Q2 (one-time)

---

## 1. What it is

**Fix It Faster** is a short, hands-on team activity where participants use **Datadog** (APM, Logs, Infrastructure, Metrics/Monitors) to diagnose and fix intentionally broken scenarios. Each person runs the Datadog Agent in their own environment and uses their own Datadog console while following shared scenarios. A simple internal app provides the challenge list and a shared leaderboard for submissions.

- **Format:** Hands-on, scenario-based troubleshooting  
- **Duration:** One-time event (e.g. 1–2 hours in a single session, or async over a few days)  
- **Target quarter:** Q2

---

## 2. Why we’re doing it

- **Practical skills:** Teams get real practice with Datadog troubleshooting instead of theory-only training.  
- **Documentation habits:** Scenarios are tied to official Datadog docs and (optionally) internal wiki, reinforcing where to look when issues happen.  
- **Product coverage:** Scenarios span APM, Logs, Infrastructure, and Metrics/Monitors so people see how the products work together.  
- **Low overhead:** No external vendor or paid platform; we use our own Datadog accounts and a small internal app (challenge list + leaderboard).

---

## 3. How it works (high level)

1. **Setup (per participant):** Each person runs the Datadog Agent (Docker) and a small “trace + log demo” on their machine so they have a working baseline (traces and logs flowing into their Datadog).  
2. **Scenarios:** We provide a few scenarios (e.g. “APM traces stopped,” “logs not appearing,” “host missing from Infrastructure”). For each scenario, we document how we intentionally break that one thing (e.g. turn off APM, disable log collection).  
3. **Hands-on:** Participants fix the issue using Datadog docs and their console, then submit a short answer (root cause, steps, links to docs) and time taken.  
4. **Leaderboard:** A shared internal page shows submissions and times so we can recognize quick, accurate fixes and discuss approaches afterward.

Challenge content and the leaderboard are served from a small internal app; participants access it via a single URL (e.g. host’s IP when running `npm run dev:lan` for the session).

---

## 4. Scope and target

- **Type:** One-time team activity (not a recurring program).  
- **Target timing:** Q2.  
- **Participation:** Voluntary; we can cap or expand based on interest and capacity.  
- **Deliverables:** A short runbook for “how we broke it / how to fix it” per scenario (for future reference and onboarding).

---

## 5. Asks

- **Approval** to run this as a one-time, Q2 team activity.  
- **Visibility:** Optional short mention in team/org channels so people know it’s available.  
- **Time:** Participants block ~1–2 hours (or equivalent async) for the activity; no formal “training day” required if we run it async.

---

## 6. Next steps (if approved)

- Finalize 3–4 scenarios (APM, Logs, Infra, Metrics/Monitors).  
- Pick a Q2 date or window and share the link + instructions.  
- Run the activity and collect lightweight feedback.  
- Publish a brief summary and the scenario runbooks for future use.

---

*We’re happy to adjust scope, timing, or format based on your input.*
