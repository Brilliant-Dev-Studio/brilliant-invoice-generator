# GitHub profile achievements (Trophy badges)

GitHub awards small badges on your **profile** when you do certain things on GitHub. They cannot be bought or toggled in repo settings — only earned through real activity. This guide lists what you can still earn today and how this repository fits in.

**Check your progress (any username):** [gh-achievements.vercel.app/check](https://gh-achievements.vercel.app/check/)

---

## Earnable now (8 badges)

| Badge | What GitHub counts | Practical path with this repo |
| --- | --- | --- |
| **Pull Shark** | Merged pull requests (2 → 16 → 128 → 1024) | Use branches + PRs instead of pushing straight to `main`. Merge the community-health PR we prepared, then keep using PRs for features. |
| **YOLO** | Merge a PR **without** a review | Open a small PR from your fork/branch and merge it yourself with no approving review (works if branch protection does not require reviewers). |
| **Quickdraw** | Close an issue or PR within **5 minutes** of opening | One-time: open a trivial docs typo issue, fix it in a PR, merge and close within 5 minutes (optional; cosmetic only). |
| **Pair Extraordinaire** | Co-authored commits on **merged** PRs | Pair with a real teammate; add `Co-authored-by: Name <email@example.com>` to the commit message. Do not use a second account — that violates GitHub Terms. |
| **Galaxy Brain** | Accepted answers in **Discussions** | Repo → **Settings → General → Discussions → Enable**. Post Q&A; when someone marks your answer accepted, it counts (2+ for first tier). |
| **Starstruck** | A repository **you created** reaches star milestones (16+) | Share the project, improve the README, add GitHub **Topics** (e.g. `nextjs`, `invoicing`, `myanmar`). Stars must come from other people. |
| **Public Sponsor** | Public sponsorship via **GitHub Sponsors** | Sponsor any open-source maintainer (even $1/month) with sponsorship shown on your profile. |
| **Finishing Touch** | Merged PRs that improve **GitHub’s own UI** | Not applicable to this app repo (targets github.com/github design contributions). |

Retired or staff-only badges (Arctic Code Vault, Mars 2020, Proxima, etc.) cannot be earned anymore.

---

## Myanmar summary (အကျဉ်း)

- **Trophy တွေကို repo ထဲ setting တစ်ခုနဲ့ ဖွင့်လို့ မရပါ** — GitHub account နဲ့ လုပ်ဆောင်ချက် (PR merge, Discussion answer, stars, sponsor) ကနေ အလိုအလျောက် ပေးပါတယ်။
- **Pull Shark** — `main` ကို တိုက်ရိုက် push မလုပ်ဘဲ **branch → Pull Request → Merge** လုပ်ပါ။ ၂ ခု merge ရင် badge စเริ်။
- **YOLO** — review မယူပဲ PR တစ်ခု merge လုပ်ပါ (repo rule မပါရင်)။
- **Pair Extraordinaire** — မိတ်ဆွေ/လုပ်ဖော်ကိုင်ဖက်တစ်ယောက်နဲ့ တကယ် co-author လုပ်ပြီး PR merge လုပ်ပါ။ Account ၂ ခု ဖွင့်ပြီး cheat လုပ်ခြင်း **Terms violation** ဖြစ်နိုင်ပါတယ်။
- **Galaxy Brain** — Repository **Discussions** ဖွင့်ပြီး Q&A မှာ accepted answer ရပါ။
- **Starstruck** — သင် create လုပ်ထားတ repo က star **၁၆** ရောက်ရင် (အခြားသူတွေ star ပေးရမည်)။
- **Public Sponsor** — GitHub Sponsors ဖြင့် တစ်ယောက်ယောက်ကို public sponsor လုပ်ပါ။

---

## Repository setup in this project

We added:

- [CONTRIBUTING.md](../CONTRIBUTING.md) — PR workflow
- [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) — PR checklist
- Issue templates under `.github/ISSUE_TEMPLATE/`
- CI workflow `.github/workflows/ci.yml` — runs on pull requests

### Suggested GitHub.com settings (manual)

1. **About** (repo homepage): add description + **Topics**: `nextjs`, `typescript`, `invoice`, `postgresql`, `myanmar`, `pwa`
2. **Settings → General → Features**: enable **Issues**; enable **Discussions** if you want Galaxy Brain
3. **Settings → General → Pull Requests**: allow merge commits or squash (your preference)
4. Optional: **Settings → Branches → Branch protection** on `main` — require PR before merge (good habit; use **YOLO** once without required reviewers if you want that badge)

---

## What we cannot do for you

- Grant badges from the codebase or AI
- Add stars to your repository
- Create a second GitHub account to fake co-authorship
- Restore retired badges (Arctic Code Vault, Mars 2020)

Use legitimate PRs and community participation; merge the prepared branch via the GitHub UI to start **Pull Shark** progress.
