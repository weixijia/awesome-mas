# Function cards — what will *your* assistant do? (M1–M2)

Every assistant uses the same building blocks — project memory, a knowledge base, two agents of your own, one workflow, a panel. **What it does is up to you.** Pick one card, or design your own (card X).

| Card | Your assistant… | Needs | Workflow |
|---|---|---|---|
| **F** Technical feasibility *(default — most guided)* | rates whether each part of your idea can be built, and how hard it is for your team | `/research` cards | `/feasibility` (given) |
| **P** Precedent scout | compares existing projects and products with your idea | `/research` cards | `/precedents` (you build it) |
| **U** User-insight synthesiser | turns your interview or observation notes into themes with evidence | your notes in `raw/` | `/insights` (you build it) |
| **B** Prototyping & BOM helper | lists component options and integration risks for your prototype | `/research` cards | `/bom` (you build it) |
| **X** Freestyle | does a job you define | you decide | you build it |

## How to use a card

1. Tell `/onboard` which card you chose (question 9). It records it in `project/assistant.md`.
2. Paste the card's **agent prompts** into Claude Code, one at a time. Rewrite the *italic* parts in your own words. Keep the names exactly as written — the workflow finds agents by name.
3. Cards P, U, B, X: paste the **workflow prompt** to create your slash command.
4. Run your workflow. Its result lands in `outputs/`.

Claude Code will **always ask your permission** before writing into `.claude/` — choose **Yes**. This is a safety feature: an agent can't quietly change its own configuration.

---

## Card F — Technical feasibility (default)

**Agent prompt 1 — `feasibility-reviewer`**

> Create a project subagent in `.claude/agents/` named `feasibility-reviewer`.
> Its job: for each technical component it is given, rate Maturity (Proven / Adaptable / Research-grade / Infeasible) and Difficulty (1–5) using `harness/feasibility-rubric.md`, judged for our team as described in `project/team.md` and `project/constraints.md`.
> *It should pay special attention to: (e.g. what we can realistically build in our workshop, power and size limits for wearables, ...).*
> Every rating must cite a source card from `wiki/sources/` or say "No evidence found" and be marked low confidence.
> It must not suggest what we should do; for Research-grade or Infeasible components it lists technical routes side by side, unranked.
> Output: one Markdown table with columns Component | Critical? | Maturity | Difficulty | Why, for this team | Evidence.
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

**Agent prompt 2 — `sparring-critic`**

> Create a project subagent in `.claude/agents/` named `sparring-critic`.
> Its job: act as a sceptical technical critic of our idea. It looks for *(e.g. assumptions about accuracy or speed, what happens in real-world conditions, safety, what breaks first in a prototype, ...)*.
> It reads `project/`, the component table it is given and the cited source cards in `wiki/sources/`.
> It asks hard questions instead of giving answers, and never tells us what to do or proposes a different project.
> Output three sections: "Assumptions that may not hold", "Likely failure modes", "Questions the team needs to answer" (max 5 numbered questions).
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

**Workflow:** already built — run `/feasibility`.

---

## Card P — Precedent scout

Run `/research` on your topic first (aim for products, projects and cases).

**Agent prompt 1 — `precedent-curator`**

> Create a project subagent in `.claude/agents/` named `precedent-curator`.
> Its job: from the source cards in `wiki/sources/`, pick the existing projects, products or studies that are precedents for our idea and describe each factually: what it is, who it's for, how it works technically, materials or form, and what it shows works or doesn't.
> *It should pay special attention to: (e.g. form factor, how users interact with it, price, ...).*
> Every row cites its source card. It never invents precedents that are not in the wiki.
> Output: one Markdown table with columns Precedent | What it is | How it works | What it shows | Evidence.
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

**Agent prompt 2 — `gap-mapper`**

> Create a project subagent in `.claude/agents/` named `gap-mapper`.
> Its job: compare our idea in `project/brief.md` with the precedents it is given, and map where our idea overlaps with them and where it differs — technically and in use. *It should look closely at: (e.g. who the user is, setting of use, the core interaction, ...).*
> It states overlaps and differences as facts with citations, and never judges which direction is better or tells us what to do.
> Output two sections: "Overlaps with existing work" and "Differences from existing work", then "Open questions" (max 5).
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

**Workflow prompt — `/precedents`** (use the workflow template at the end, with: agents `precedent-curator` then `gap-mapper` — the second needs the first's table, so run them one after the other; output name `precedents`).

---

## Card U — User-insight synthesiser

Put your own notes in `raw/` first (one file per interview or observation). No notes yet? Copy the example files from `sample-project/interviews/` into `raw/` using Finder or Explorer.

**Agent prompt 1 — `insight-coder`**

> Create a project subagent in `.claude/agents/` named `insight-coder`.
> Its job: read every notes file in `raw/` and group what participants said and did into themes. *It should look especially for: (e.g. moments of difficulty, workarounds people use, emotions, ...).*
> Every theme lists supporting quotes, each tagged with its file name. It never invents quotes or participants, and refers to people by participant ID (P1, P2…) rather than guessing gender or other details the notes don't state.
> Output: one Markdown table with columns Theme | What participants said or did | Quotes (file) | Number of participants.
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

**Agent prompt 2 — `evidence-sceptic`**

> Create a project subagent in `.claude/agents/` named `evidence-sceptic`.
> Its job: check each theme it is given against the notes in `raw/`. For each theme: how many participants support it, any counter-evidence, and whether the wording claims more than the notes show. *It should be especially strict about: (e.g. themes from a single participant, leading questions, ...).*
> It never tells us what to design.
> Output: one Markdown table with columns Theme | Support (n of N) | Counter-evidence | Overreach? | Confidence (high/medium/low).
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

**Workflow prompt — `/insights`** (template below, with: agents `insight-coder` then `evidence-sceptic`, one after the other; input `raw/`; output name `insights`).

---

## Card B — Prototyping & BOM helper

Run `/research` first on the parts you need (e.g. "small vibration motors for a wearable").

**Agent prompt 1 — `parts-finder`**

> Create a project subagent in `.claude/agents/` named `parts-finder`.
> Its job: for each function our prototype needs (from `project/brief.md`), list 2–3 component options found in `wiki/sources/`, with key specs, approximate price and where the evidence comes from. *It should pay special attention to: (e.g. size, battery life, availability in the UK, ...).*
> Options are listed side by side and unranked; it never picks one for us. Missing specs are written as "not in sources".
> Output: one Markdown table with columns Function | Option | Key specs | Approx. price | Evidence.
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

**Agent prompt 2 — `risk-checker`**

> Create a project subagent in `.claude/agents/` named `risk-checker`.
> Its job: check the component options it is given for integration risks — voltage and power compatibility, battery life, size, heat, safety, availability, and whether our team (see `project/team.md`) has the skills to wire and program them. *It should be especially careful about: (e.g. anything worn on the body, ...).*
> It states risks with evidence and never tells us which option to choose.
> Output: one Markdown table with columns Option | Risk | Why | Evidence | Severity (low/medium/high).
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

**Workflow prompt — `/bom`** (template below, with: agents `parts-finder` then `risk-checker`, one after the other; output name `bom`).

---

## Card X — Freestyle

Before building, write in `project/assistant.md`: the job, the two agents and their single responsibilities, what the workflow reads and writes, and **why this job needs agents rather than one chat**. Then write two agent prompts in the same style as the cards above (name, job, attention points, evidence rule, no directing, output format, read-only, Sonnet), and use the workflow template.

---

## Workflow template (cards P, U, B, X)

Paste this, replacing the `<...>` parts:

> Create a project skill at `.claude/skills/<name>/SKILL.md`, invoked as `/<name>`. When I run it, it should:
> 1. Read `project/brief.md`, `project/assistant.md` and `wiki/index.md`<, and the notes in raw/ — card U only>.
> 2. Check that the agents `<agent-a>` and `<agent-b>` exist in `.claude/agents/`; if not, stop and tell me which is missing.
> 3. Run `<agent-a>`, then give its result to `<agent-b>`<, or: run both in parallel>.
> 4. Write both results unchanged into `outputs/<YYYY-MM-DD>-<name>-<short-slug>.md`, with a title, the date, and links to the files they used.
> 5. Append an entry to `wiki/log.md`.
> 6. Reply with a 3-line summary and the file link. It must not recommend what we should do.
> Write the skill file directly; do not use scripts or terminal commands.

---

## Design questions — answer in one line each in `report/comparison.md`

1. Why is each of your roles a separate **agent** (own context, own tools) rather than one long prompt?
2. Why are your agents **read-only**? What could go wrong if they could write files?
3. If you added a third agent, what would its single job be?
