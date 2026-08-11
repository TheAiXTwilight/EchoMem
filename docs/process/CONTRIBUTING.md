# Contributing (internal, private repo)

Since this is a 3-person FYP repo, "contributing" means *us*. This document
exists so we have one shared way of working. There are no external
contributors until after October submission (if we MIT-license it then).

## Branching

- `main` is always deployable / demoable.
- Work on short branches named `w<N>-<short-description>`, e.g. `w1-screen-capture`.
- Rebase on `main` before opening a PR; no long-lived branches.
- After merge, delete the branch.

## Pull requests

- PRs are small (≤ 400 lines of code if possible). Big changes split into stacks.
- Title: `<area>: <imperative summary>`.
- Description: what changed, how to test, screenshots for UI changes.
- At least one other team member must approve before merge.
- CI is not set up in v1 (post-v1 nice-to-have); run the smoke tests in
  `tests/test_smoke.py` locally before requesting review.

## Commits

- Use imperative present tense: "add pHash dedup", not "added" or "adds".
- First line ≤ 72 chars. Optional body after blank line.
- One logical change per commit. No mega-commits.

## Code style

- Python: Black formatted, Ruff-clean. Line length 100. Types on public functions.
- TypeScript: strict mode on; Prettier/ESLint defaults from Vite template.
- No commented-out code on `main`. Delete it; git remembers.
- No secrets, API keys, personal data, or screenshot files committed. The
  `.gitignore` already excludes `data/`, `models/`, `.venv/`, `node_modules/`.

## Issue etiquette

- Every bug / feature gets a GitHub issue.
- Label: `P0` (blocks demo), `P1` (breaks main flow), `P2` (polish), `P3` (later),
  plus `week-1…week-6`.
- Assign yourself when you start. Unassign if you get stuck > 2 hours.
- Close issues with a linked PR ("Closes #12").

## Friday demos

End of every week, before the guide meeting:
1. All open PRs merged or reverted
2. `main` runs on all three laptops
3. Demo script (see `TESTING.md` §2) runs end-to-end on the demo laptop
4. Meeting notes pushed to `docs/meetings/YYYY-MM-DD.md` with: what shipped,
   what broke, what's next week.
