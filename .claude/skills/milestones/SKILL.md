---
name: milestones
description: Check the team's tutorial progress against milestones MS0–MS6 (and stretch goals) by inspecting files, show what is done and what's next, and save it to report/progress.md. Use when the student asks "where am I?", "what's next?" or "am I done?".
disallowed-tools: Bash PowerShell
---

# /milestones — check progress

Checks are about **mechanisms, not content quality**: they only test that files exist and are filled in, so they work for every function card. Use Read, Glob and Grep only — no scripts or terminal commands.

## Checks

| # | Milestone | Done when |
|---|---|---|
| MS0 | Ready | `report/m0-baseline.md` has a pasted answer below the `---` line (not just `<paste the answer here>`) |
| MS1 | Context | `project/brief.md`, `project/team.md` and `project/assistant.md` exist, and the brief's idea line and assistant's card line are filled (not blank or only `TBD`) |
| MS2 | Knowledge | ≥ 4 source cards in `wiki/sources/` with a `url:` line, each linked from `wiki/index.md`. **Card U:** ≥ 3 notes files in `raw/` (besides `README.md`) also counts |
| MS3 | Roles | ≥ 2 agent files in `.claude/agents/` besides `researcher.md`, each with `name:`, `description:` and a `tools:` line |
| MS4 | Workflow | ≥ 1 file in `outputs/`, and `wiki/log.md` has an entry for a workflow run (not `onboard` or `research`) |
| MS5 | Showcase | `panel/index.html` exists and mentions at least one of the team's agent names and the word "milestone" |
| MS6 | Evaluate | in `report/comparison.md`, the table has entries in both the "Web chat" and "Your MAS" columns, and the "Why agents?" section is filled (not just the `<...>` placeholder) |

Stretch (report only if present): S1 a skill in `.claude/skills/` the team created (not `onboard`, `research`, `feasibility`, `milestones`) · S2 a `hooks` entry in `.claude/settings.json` · S3 a `.mcp.json` file · S4 a single-agent vs MAS comparison in `report/`.

## Steps

1. Read `project/assistant.md` to know the team's card (default F).
2. Run every check. For each, note ✅ or ⬜ and, if ⬜, the one concrete thing missing.
3. Write `report/progress.md`:
   - a heading with the team's working title and card,
   - a progress line such as `Progress: 4 / 7 core milestones`,
   - the table (Milestone | Status | Missing),
   - a `## History` section: keep earlier lines and append `- [YYYY-MM-DD HH:MM] n/7` .
4. If `panel/index.html` exists, update **only** its milestones section (progress bar, checklist, history) to match `report/progress.md`, editing the file directly. Leave the rest of the panel unchanged.
5. Reply with the table and **one** next step: the first ⬜ milestone and the command or handout that achieves it (`/onboard`, `/research`, `handouts/function-cards.md`, the team's workflow, `handouts/prompt-cards.md`, `report/comparison.md`). Do not judge the quality of their work.
