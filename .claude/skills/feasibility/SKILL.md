---
name: feasibility
description: Rate whether the team's idea is technically achievable and how hard it is, component by component, using the shared rubric and the team's own reviewer agents. Use when the student asks "can this be built?" or "how hard is this?".
argument-hint: "[idea — leave empty to use project/brief.md]"
disallowed-tools: Bash PowerShell
---

# /feasibility — technical feasibility review

Idea: $ARGUMENTS
(If empty, use the idea in `project/brief.md`.)

## 1. Check the team's agents

Look in `.claude/agents/` for agents whose `name` is `feasibility-reviewer` and `sparring-critic`.
If either is missing, stop and reply with which one is missing and: "Build it with the prompt in `handouts/function-cards.md`, then run `/feasibility` again." Do not do its job yourself.

## 2. Load context

Read `project/brief.md`, `project/team.md`, `project/constraints.md`, `harness/feasibility-rubric.md` and `wiki/index.md`.

## 3. Decompose

Split the idea into 3–6 technical components (for example sensing, processing, output/actuation, interaction, power and form factor, data). Mark the components without which the idea fails as **critical**. For each component, list the matching source cards from the index, or "none". Show the student this table.

## 4. Fill evidence gaps (once)

If two or more components have no source card, launch one `researcher` agent on those components (maximum 3 sources), then add the new cards to `wiki/index.md`. Do this at most once per run.

## 5. Review in parallel

Launch `feasibility-reviewer` and `sparring-critic` **in parallel**. Give both the idea text, the component table with card paths, and the paths of the project files and the rubric. Tell the student both are running (about 1–3 minutes).

## 6. Merge

Create `outputs/<YYYY-MM-DD>-feasibility-<idea-slug>.md` from `harness/templates/feasibility-report.md`:

- Copy the reviewer's ratings table unchanged. Do not alter any rating.
- Copy the critic's challenges and open questions unchanged.
- Where the two agents disagree, record both views under "Disagreements".
- Overall difficulty = the **highest** difficulty among critical components (the weakest link), not the average.

Append an entry to `wiki/log.md`.

## 7. Reply

The ratings table, the overall verdict line and the top 3 open questions, with a link to the review file. No recommendations.
