---
name: insights
description: Code the team's interview and observation notes into themes, then stress-test those themes against the notes. Use when the student asks "what do our notes say?", "what themes are in our research?" or runs /insights.
---

# /insights

Thematic coding of the team's own notes in `raw/`, followed by an evidence check. This workflow reports what the notes show. It never tells the team what to do.

## Steps

1. **Read the context.** Read these files. If `project/brief.md` or `project/assistant.md` is missing or empty, tell the student to run `/onboard` and stop.
   - `project/brief.md`
   - `project/assistant.md`
   - `wiki/index.md`
   - every note in `raw/` (list with Glob). If `raw/` has no notes, tell the student to add their notes there and stop.

2. **Check the agents exist.** Look in `.claude/agents/` for `insight-coder.md` and `evidence-sceptic.md`.
   - If either is missing, stop. Say which one is missing and point to `handouts/function-cards.md`.
   - Do not do a missing agent's job yourself.

3. **Run the agents in order** (not in parallel; the second needs the first's output).
   1. Delegate to `insight-coder`. Ask it to code all notes in `raw/` into themes, with quotes tagged by file.
   2. Give the full, unedited `insight-coder` result to `evidence-sceptic`. Ask it to check each theme against the notes in `raw/`.

4. **Write the output file** `outputs/<YYYY-MM-DD>-insights-<short-slug>.md` (today's date; a short kebab-case slug from the main topic of the notes). Contents:
   - A title (`# Insights: <topic>`) and the date.
   - A **Files used** section: relative Markdown links to every file read in step 1, e.g. `[brief](../project/brief.md)`, `[interview-1](../raw/interview-1.md)`.
   - `## Thematic coding (insight-coder)`: the agent's result **unchanged**.
   - `## Evidence check (evidence-sceptic)`: the agent's result **unchanged**.
   - Do not summarise, trim, reword or add recommendations inside the two result sections.

5. **Append to `wiki/log.md`** (add at the end; never overwrite existing entries):

   ```
   ## [YYYY-MM-DD] insights | <short-slug>
   - Ran insight-coder, then evidence-sceptic on N notes in raw/.
   - Output: [file name](../outputs/<file name>)
   ```

6. **Reply in exactly 3 lines**, then the file link:
   - Line 1: how many notes were read and how many themes were found.
   - Line 2: how many themes the evidence check supported, and how many it flagged (counter-evidence or overreaching wording).
   - Line 3: the single strongest-supported theme, described neutrally.
   - Then: `[outputs/<file name>](outputs/<file name>)`

## Rules

- Do not recommend, suggest or rank what the team should do. No "you should", "I recommend", "the best option". Describe only what the notes show.
- Every claim must come from the agents' results, which are tied to files in `raw/`. If there is no evidence, say `No evidence found`.
- Never write in `decisions/`. Never edit `raw/` or `harness/`.
- Write files directly; do not use scripts or terminal commands.
