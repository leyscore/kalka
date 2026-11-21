# Taste by construction (prototype)

An experiment, outside the workspaces and outside `bun run check`: nothing in the app, the
packages or the tools imports it. It tests one idea for Kalka's design agent: make the first
draft good by construction, by having the agent commit to a **design genome** before it draws
and having the tools enforce it, instead of asking a model for "a landing page" and cleaning up
afterwards.

## The idea

A page drawn with no direction is the average of every page. Kalka's design guide and anti-slop
catalogue (`packages/core/src/tools/prompts/`) already tell the agent so; here the same
decisions become data the tools can check.

1. **Genome.** Independent axes, each a small set of specified options (`genome/axes/`):
   structure (composition grammars written as rules, not markup), type (pairing, scale ratio,
   headline treatment), colour (palettes grouped by strategy), rhythm, shape, imagery, motion,
   and one signature detail the agent writes from the brief's own facts. `genome/compat.json`
   lists the pairs that may not be combined; `bun src/check-genome.ts` validates the axes and
   counts the compatible genomes (37 million for a web page).
2. **Chosen from the brief.** The agent reasons axis by axis from the subject and its audience
   and proposes three genomes that must differ on at least five axes. The resolver
   (`src/genome.ts`) refuses unknown options and forbidden pairs and says why; the agent answers
   again.
3. **Enforced by the tools.** A genome resolves to exact values: a Tailwind v4 theme with every
   default palette, size, radius and shadow removed (`themeCSS`). `src/gate.ts` snaps every
   class to the nearest value the genome has and refuses what has no equivalent (gradients,
   blur, style attributes, `<style>`, emoji). This is the prototype of what `write_html`,
   `update_styles` and `update_css_class` would do in a document that has a genome.
4. **Measured, not judged.** `src/render.ts` reads back what Chromium computed;
   `src/measure.ts` derives the craft metrics (spacing rhythm, type scale, contrast, alignment),
   a lint for the measurable signs of the anti-slop catalogue, and a style vector.
   `src/singularity.ts` scores the distance from the page a model draws with no direction (same
   briefs, bare prompt), on the style vector and on a CLIP embedding.
5. **Three drafts, then the best.** One draft per genome, scored; the best gets one refinement
   pass from its screenshot, kept only if it scores at least as well. A VLM ranking counts for a
   tenth of the score.

6. **A floor, not a ceiling.** With `--free` the agent may add an option of its own on any axis
   (a palette derived from the subject, a composition, a type treatment). `registerInvented`
   holds it to the checks every menu option passed: contrast, the refused combinations, and the
   catalogue's known defaults (an indigo accent, cream with terracotta, neon on dark grey).
7. **Brand mode.** When a product already has its system, `src/brand.ts` seeds one from a
   rendered page (`seedFromPage`) or from custom properties such as `kalka tokens` output or a
   Tailwind `@theme` (`seedFromCSS`). Colours, type, shape and the product's own parts are
   locked; only structure, imagery, motion, signature and an unspecified rhythm are chosen, inside
   what the matrix allows next to the brand. `fidelity` measures token adherence and part reuse.

The result of each draft is a static HTML page with one compiled stylesheet, which
`bun kalka import` reads.

## Sources and licences

The open-source libraries and templates in `sources/sources.json` were read as raw material and
decomposed into the structure grammars and the atom recipes (`genome/atoms.json`). None of their
markup is in this folder. Each entry records the repository, commit, licence and what was
abstracted from it; the licence texts are in `sources/licences/`. What was left out, and why, is
in the `excluded` list of the same file. `bun src/scan-sources.ts <clones>` reproduces
`sources/analysis.json` from local clones.

## Running it

Generation goes through the local Claude Code CLI (`claude -p`), the engine Kalka's agent
drives over ACP; no key is read. Everything lands in the ignored `runs/`.

```sh
bun src/check-genome.ts
TASTE_PYTHON=/path/to/python-with-torch bun src/run.ts all --parallel 4   # 20 briefs
bun src/run.ts baseline --sample 1 --briefs saas-freight                  # repeated runs
bun src/run.ts direction --free --briefs saas-freight                      # options may be invented
bun src/run.ts rebuild && bun src/run.ts duel --v2                        # second build prompt, blind VLM duel
bun src/brand-run.ts /path/to/source-clones                               # brand-mode briefs
bun src/report.ts /path/to/output                                         # tables and side-by-sides
```

`briefs.json` holds the 20 fixed briefs.

## What the first run showed

On 20 briefs the pipeline's pages measure cleaner than the current guide's (craft 97 against 89,
19 pages of 20 with no slop sign against 7), repeated runs differ more, and brand-mode pages
stay on the product's tokens. A blind VLM comparison nevertheless preferred the current guide's
page 17 times of 20: the genome pages were flat, with no product shown on the first screen. A
second build prompt (`FIRST_SCREEN` in `src/prompts.ts`) brought that to 13 of 20. The metrics
here measure the floor; they do not measure whether a page has an idea.

## Limits to keep in mind

- The selection score is built from the same metrics the report shows; an improvement on them is
  expected by construction. Only people can say whether the pages are better; a blind test
  with designers is the next step.
- No stock photo provider runs here: every image is the same neutral plate in every condition.
- The gate works on classes. In the product it belongs in the tools, on the scene graph.
- The folder is outside `bun run lint`; it type-checks, and follows the repository's conventions
  except for function complexity in the gate, the lint and the in-page measurement.
