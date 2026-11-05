---
name: bom
description: Build a bill-of-materials view for the team's prototype. Runs parts-finder to list component options per function, then risk-checker to list integration risks, and saves both to outputs/. Use when the student asks "what parts could we use?" or "what could go wrong with these parts?".
---

# /bom

Produce a parts and risk report for the team's prototype. This skill gives feedback only. It never recommends what the team should do.

## Steps

1. **Read context.** Read `project/brief.md`, `project/assistant.md` and `wiki/index.md`. If `brief.md` or `assistant.md` is missing or empty, tell the student to run `/onboard` and stop.

2. **Check agents.** Check that both files exist:
   - `.claude/agents/parts-finder.md`
   - `.claude/agents/risk-checker.md`

   If either is missing, stop. Say which one is missing and point to `handouts/function-cards.md`. Do not do the missing agent's job yourself.

3. **Run the agents in order.**
   - Delegate to `parts-finder` first. Give it the brief and the relevant source cards from `wiki/index.md`.
   - Then delegate to `risk-checker`, passing it `parts-finder`'s result exactly as returned.

   Do not run them in parallel: `risk-checker` needs the parts list.

4. **Write the output.** Create `outputs/<YYYY-MM-DD>-bom-<short-slug>.md` (today's date; a short kebab-case slug from the project). Contents:
   - A title (`# BOM and risk check: <project name>`) and the date.
   - A **Files used** section with relative Markdown links, e.g. `[brief](../project/brief.md)`, to `project/brief.md`, `project/assistant.md`, `wiki/index.md`, and every `wiki/sources/` card or `raw/` file that the agents cited.
   - A `## Parts options (parts-finder)` section with the agent's result **unchanged**.
   - A `## Risks (risk-checker)` section with the agent's result **unchanged**.

   Do not edit, summarise, rank or reorder the agents' text.

5. **Log it.** Append to `wiki/log.md` (never overwrite existing content):

   ```
   ## [YYYY-MM-DD] bom | <short-slug>
   - Ran parts-finder then risk-checker.
   - Output: [<file name>](../outputs/<file name>)
   ```

6. **Reply** in exactly 3 lines, then the file link:
   - Line 1: how many functions/parts options were listed.
   - Line 2: how many risks were flagged, and how many items have `No evidence found`.
   - Line 3: what the file contains and which source cards it links.
   - Then: `[outputs/<file name>](outputs/<file name>)`

## Rules

- Do not recommend, rank or choose between options. No "you should", "I recommend", "the best option is".
- Do not add claims of your own; every fact comes from the agents' output with its evidence, or is marked `No evidence found`.
- Never write in `decisions/`, and never edit `raw/` or `harness/`.
- Before each action, say in one plain sentence what you are about to do; afterwards, name the file you wrote.
