# Team Guidelines

## Members
Three-member team; names and GitHub handles to be filled in during Week 1.

## Work Model — Shared Ownership (No Fixed Roles)
- Every member works on every component of the system over the course of the project
- Use **pair programming / mob programming** for core modules (especially during capture pipeline, encryption, and unlock flow — the hardest parts)
- Rotate who owns what each sprint (2-week sprints) so nobody is siloed into only frontend, only ML, or only docs
- No one "owns" a module to the exclusion of others — everyone can touch any file, every PR needs review from at least one other member

## Weekly Rhythm
- **Monday:** Sprint planning (pick 3-5 tasks for the week, move cards on board)
- **Wednesday:** 30-minute mid-week check-in (blockers, progress)
- **Friday:** 45-minute demo + retro. Every member shows one thing that works (even if ugly). Update notes in the shared doc.
- All meetings have notes pushed to `/docs/meetings/YYYY-MM-DD.md`

## Decision Making
- Small technical decisions: whoever is implementing decides; document in PR description
- Architectural decisions: discussed as a group; final call logged as an ADR in `/docs/adr/`
- Blocking disagreements that persist after one discussion: escalate to project guide after writing down both options

## Definition of Done (DoD)
A feature is "done" when all are true:
1. Merged to `main` via PR with at least one approving review
2. Tests added and passing
3. README/docs updated
4. Works locally on all three laptops (Windows, macOS, Linux where applicable)
5. Demo works without error for the happy path

## Communication
- **GitHub Issues:** source of truth for tasks, bugs, feature requests
- **Chat group** (Discord/WhatsApp): quick questions, daily standups, links
- **Shared Drive:** proposal, lit survey papers, meeting recordings (no code, that lives on GitHub)

## Branching
- `main` — always working, deployable
- Feature branches: `feature/<short-name>`, `fix/<short-name>`, `docs/<short-name>`, `paper/<short-name>`
- PRs are squash-merged
- Force-push to `main` is forbidden

## Commits
Conventional Commits format:
- `feat: add encrypted storage for screenshots`
- `fix: correct Whisper timestamp alignment`
- `docs: update PRD memory tier section`
- `chore: bump Ollama client to 0.3.3`
- `paper: add related work section`

## Privacy of the Repository
This repository is **private**. Do not share screenshots, code, model configs, or proposal drafts publicly during development. Any public release (paper, demo video, open-source) is a team decision made post-submission.
