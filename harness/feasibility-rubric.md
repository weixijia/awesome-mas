# Feasibility Rubric

Shared by every team so results can be compared. Rate each **component** of an idea, not the idea as a whole.

## 1. Maturity — can it be done at all?

Based on NASA's Technology Readiness Levels (TRL 1–9), grouped into four bands.

| Band | TRL | Meaning | Typical evidence |
|---|---|---|---|
| **Proven** | 7–9 | Works in real-world use today | Product on sale, module you can buy, widely used library |
| **Adaptable** | 4–6 | Shown working in a lab or prototype; needs adapting to this project | Open-source repo, paper with a working system, maker build |
| **Research-grade** | 1–3 | Concept or early experiments only; no reusable implementation | Paper without code, theoretical work, a single demo video |
| **Infeasible (now)** | — | Conflicts with physics, or needs resources far beyond a student project | Expert sources stating limits; nothing found that comes close |

## 2. Difficulty — how hard for *this* team?

Calibrated to `project/team.md` (skills) and `project/constraints.md` (time, money, equipment). The same component can be 2 for one team and 4 for another.

| Level | Label | Anchor |
|---|---|---|
| **1** | Plug and play | Buy or download and follow a tutorial. Under 1 week. No new skills. |
| **2** | Integration | Combine known parts. 1–3 weeks. One new skill, learnable from tutorials. |
| **3** | Engineering | Substantial custom work, debugging, tuning. 1–2 months. A skill the team lacks today, or a collaborator. |
| **4** | Specialist | Months, uncertain outcome. Needs expertise or equipment well beyond the team's. |
| **5** | Open research | No known route to a working result within the thesis timeline. |

**Overall difficulty** of an idea = the highest difficulty among its critical components (the weakest link).

## 3. Evidence grade — how much can you trust a source?

| Grade | Source type |
|---|---|
| **A** | Runnable code, a dataset, or a product/module you can obtain |
| **B** | Peer-reviewed paper or thesis with measured results |
| **C** | Demo video, project page, press release, crowdfunding page |
| **D** | Blog post, forum answer, opinion |

A rating backed only by C/D evidence, or by none, must be flagged **low confidence**.

## 4. When a component is Research-grade or Infeasible

State the technical routes that exist, side by side and unranked, each with its cost. Example routes:

- **Wizard-of-Oz** — a human or pre-recorded behaviour fakes the hard part, so the experience can be tested.
- **Substitute technology** — a different, more mature way to get a similar effect.
- **Narrowed scope** — the same technology under easier conditions (fewer users, controlled setting).

The team decides which route, if any, to take.
