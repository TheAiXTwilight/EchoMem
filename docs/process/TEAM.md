# Team Process (v1, 6-week crunch)

We are 3 students. No one owns a module. Everyone touches everything. This is
non-negotiable for both learning outcomes and for surviving if one person is
sick during exam/viva season.

## Working agreement

- **Pair or mob programming only** for new code. Solo code is allowed only for
  bug fixes < 30 min or for paper writing.
- **Rotating driver every 2 days** of the sprint plan in `ROADMAP.md` — the
  "Driver" column is who's on keyboard; the other two are navigator/reviewer.
- **Trunk-based**: work on short-lived branches named `w1-screen-capture`,
  `w2-captions`, etc. PR into `main`. At least one other member approves before
  merge. No long-running feature branches.
- **Commit format**: `<area>: <short imperative sentence>` — e.g.
  `capture: add pHash dedup with threshold 4`, `ui: add citation chips`.
- **Friday demos, every week, 5 PM, to the guide.** Bring a working localhost
  build, not slides. If a feature is half-done, demo the half that works.
- **Dogfood from Week 4 onward.** Run EchoMem during your own work sessions and
  log what breaks.

## Cadence

- **Daily standup**: 10 minutes on our WhatsApp/Discord group. 3 questions each:
  1. What did I finish yesterday?
  2. What will I do today?
  3. What's blocking me?
- **Sprint start (Monday)**: open the ROADMAP for the week, assign drivers, pull
  latest `main`, create the week's GitHub issues.
- **Sprint end (Friday)**: demo → retro (what went well / what sucked / one
  process change for next week) → push notes to `docs/meetings/YYYY-MM-DD.md`.

## Rules for the 6-week crunch

1. **Scope creep = failure.** If it's not in `SCOPE_V1.md`, it goes in
   `FUTURE_WORK.md` after submission. No exceptions, no "just this one little
   thing".
2. **Working ugly > broken beautiful.** Ship end-to-end first; polish in Week 4.
3. **Paper is code-equally-important.** From Week 2, someone is always writing
   or editing the paper on rotation.
4. **Ask for help early**, not the night before. If you've been stuck > 2 hours,
   post in the group.
5. **Sleep.** A tired team writes broken code and misses demos.
6. **Back up.** Push to GitHub every day. Keep the zipped code in your Google
   Drive as a secondary backup every Friday after demo.

## Roles (rotating weekly, not permanent)

Each week one person is **Integration Lead** (merges PRs, runs the demo Friday,
owns the build), one is **Paper Lead** (drives that week's paper section), one
is **QA Lead** (breaks the build, files bugs, keeps the benchmark script
honest). Rotate every Monday so everyone does each job twice.

## Definition of Done (per ticket)

- Code runs on the driver's machine
- Code runs on at least one other member's machine
- Any new endpoint/UI path is reachable from the frontend or a curl example
- Quick note added to that day's meeting doc about what changed
