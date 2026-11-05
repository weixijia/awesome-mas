---
name: precedents
description: Tabulate existing projects, products or studies that resemble the team's idea, then map where the idea overlaps with and differs from them, using the team's own precedent-curator and gap-mapper agents. Use when the student asks "what already exists like this?" or "how is our idea different?".
argument-hint: "[focus — leave empty to use project/brief.md]"
---

# /precedents — precedent table and gap map

Focus: $ARGUMENTS
(If empty, use the idea in `project/brief.md`.)

## 1. Load context

Read `project/brief.md`, `project/assistant.md` and `wiki/index.md`.
If `project/brief.md` or `project/assistant.md` is missing or empty, stop and tell the student to run `/onboard`.

## 2. Check the team's agents

Look in `.claude/agents/` for agents whose `name` is `precedent-curator` and `gap-mapper`.
If either is missing, stop and reply with which one is missing and: "Build it with the prompt in `handouts/function-cards.md`, then run `/precedents` again." Do not do its job yourself.

## 3. Run in sequence

Tell the student in one sentence what is starting (about 1–3 minutes).

1. Launch `precedent-curator`. Give it the idea text (or focus), the paths of `project/brief.md` and `wiki/index.md`, and the list of source cards in the index.
2. When it finishes, launch `gap-mapper`. Give it the idea text, the path of `project/brief.md`, and the **complete, unedited result** of `precedent-curator`.

Do not run them in parallel: `gap-mapper` needs the curator's result.

## 4. Write the output

Create `outputs/<YYYY-MM-DD>-precedents-<short-slug>.md` (today's date; slug in short kebab-case from the idea). Structure:

```markdown
# Precedents: <short title of the idea>

Date: <YYYY-MM-DD>

## Files used
- [brief](../project/brief.md)
- [assistant job](../project/assistant.md)
- [wiki index](../wiki/index.md)
- one relative link per source card that appears in the results, e.g. [card](../wiki/sources/<slug>.md)

## Precedents (precedent-curator)
<result copied unchanged>

## Gap map (gap-mapper)
<result copied unchanged>
```

Copy both results **unchanged**: no rewording, trimming, reordering, ranking or added commentary. If an agent's result has its own title heading, keep the text and demote headings so the file structure stays valid.

## 5. Log

Append to `wiki/log.md` (never overwrite it):

```markdown
## [YYYY-MM-DD] precedents | <short-slug>
- Ran `precedent-curator` then `gap-mapper` on the idea in `project/brief.md`.
- Output: [<file name>](../outputs/<file name>)
```

## 6. Reply

Exactly 3 lines, then the file link:

1. How many precedents were tabulated.
2. How many overlaps and how many differences were mapped.
3. Any gaps in evidence (for example `No evidence found` rows), or "none".

Link: `outputs/<file name>`

Do not recommend what the team should do, and do not judge whether the idea is original or good. Decisions belong to the students.
