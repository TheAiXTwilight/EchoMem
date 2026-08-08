# Contributing

Because this is a private team repo for a final-year project, "contributors" are the three team members; this guide is the shared workflow.

## Getting Started
1. Clone the private repo
2. Run `bash scripts/setup.sh` (creates venv, installs deps for backend and frontend)
3. Pull models: `bash scripts/pull_models.sh` (Whisper, Moondream, Phi-3.5, Piper voices, wakeword, voiceprint)
4. Create a branch: `git checkout -b feature/<your-feature>`
5. Make changes, write tests, open a PR

## Branch Naming
- `feature/<short-name>` — new features
- `fix/<short-name>` — bug fixes
- `docs/<short-name>` — documentation / paper
- `chore/<short-name>` — tooling, deps, build
- `experiment/<short-name>` — ML experiments / ablation

## Commits
Conventional Commits:
- `feat: add voiceprint enrollment flow`
- `fix: prevent double-capture on window focus`
- `docs: update PRD memory tier section`
- `chore: bump Ollama client version`
- `paper: add quantization ablation table`

## Pull Requests
- PRs target `main`
- Fill in PR template (description, testing steps, checklist)
- At least one other team member must review and approve
- CI (lint + tests) must pass (once CI is enabled)
- Squash merge on approval

## Code Style
- **Python:** Black formatter, Ruff linter, type hints on public functions, Google-style docstrings
- **TypeScript/React:** Prettier, ESLint, strict TypeScript, functional components
- No commented-out dead code on `main`
- No secrets, no user data, no model files committed

## Testing
- Write unit tests for every new backend module in `/tests/`
- Add integration tests for end-to-end flows (capture → storage → answer)
- Run `pytest` before opening a PR

## Issues
- Use GitHub Issues with templates for bugs, features, and research/experiments
- Estimate size (S/M/L) when filing
- Each sprint starts by picking issues off the backlog

## Security
- Do not commit encryption keys, passwords, or real user data
- All real test data from team laptops goes into `data/` which is gitignored
- Do not paste real credentials or private conversations into issues/PR descriptions
- The project is private — do not share repo URL or screenshots externally without team consent
