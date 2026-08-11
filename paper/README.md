# Paper — EchoMem

6–8 page research paper for the October 2026 FYP submission.

## Files
- `main.tex` — skeleton with all sections; fill in `TODO` blocks week-by-week
  per `docs/process/ROADMAP.md`
- `references.bib` — starter bibliography; keep adding as you read papers

## Compiling (LaTeX)
You need a working TeX install (TeX Live / MiKTeX) with the `acmart` class.
If your department mandates IEEEtran or their own class, swap the
`\documentclass` line at the top of `main.tex`.

```bash
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

Or just use Overleaf — upload this folder, it compiles out of the box with
Overleaf's default TeX Live.

## Writing schedule
- Week 1: Abstract + §1 Introduction (all of us brainstorm, one drives)
- Week 2: §2 Related Work (paper lead rotates, collect 15–20 refs)
- Week 3: §3 System Design (redraw diagram digitally in Week 2–3)
- Week 4: §4 Implementation (we fill this in as code lands)
- Week 5: §5 Evaluation (run the benchmark, fill tables) + §6–7
- Week 6: Polishing, citations, figures, screenshots, camera-ready
