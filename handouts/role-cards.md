# Role cards — design your two agents (M2)

`/feasibility` calls two agents that **you** create. The workflow finds them by name, so keep the names exactly as written below. Everything else — how they think, what they focus on — is your design.

## How to create an agent

Paste a prompt like the ones below into Claude Code. Rewrite the parts in *italics* in your own words. Claude writes the file `.claude/agents/<name>.md` for you. Open it afterwards and read it: that file **is** your agent.

Claude Code will **always ask your permission** before writing into `.claude/` — choose **Yes**. This is a safety feature: an agent can't quietly change its own configuration.

---

## Card 1 — `feasibility-reviewer`

**Job:** rate each component of the idea for maturity and difficulty, using the shared rubric and your team's real skills.

**Prompt to adapt:**

> Create a project subagent in `.claude/agents/` named `feasibility-reviewer`.
> Its job: for each technical component it is given, rate Maturity (Proven / Adaptable / Research-grade / Infeasible) and Difficulty (1–5) using `harness/feasibility-rubric.md`, judged for our team as described in `project/team.md` and `project/constraints.md`.
> *It should pay special attention to: (e.g. what we can realistically build in our workshop, power and size limits for wearables, ...).*
> Every rating must cite a source card from `wiki/sources/` or say "No evidence found" and be marked low confidence.
> It must not suggest what we should do; for Research-grade or Infeasible components it lists technical routes side by side, unranked.
> Output: one Markdown table with columns Component | Critical? | Maturity | Difficulty | Why, for this team | Evidence.
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

---

## Card 2 — `sparring-critic`

**Job:** challenge the idea technically — hidden assumptions, failure modes, unanswered questions — without proposing a new direction.

**Prompt to adapt:**

> Create a project subagent in `.claude/agents/` named `sparring-critic`.
> Its job: act as a sceptical technical critic of our idea. It looks for *(e.g. assumptions about accuracy or speed, what happens in real-world conditions, safety, what breaks first in a prototype, ...)*.
> It reads `project/`, the component table it is given and the cited source cards in `wiki/sources/`.
> It asks hard questions instead of giving answers, and never tells us what to do or proposes a different project.
> Output three sections: "Assumptions that may not hold", "Likely failure modes", "Questions the team needs to answer" (max 5 numbered questions).
> Make it read-only (tools: Read, Grep, Glob) and use the Sonnet model.

---

## Design questions — answer in one line each in `report/comparison.md`

1. Why is each of these a separate **agent** (own context, own tools) rather than one long prompt?
2. Why are both agents **read-only**? What could go wrong if they could write files?
3. If you added a third agent for your project, what would its single job be?
