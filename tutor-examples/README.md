# Tutor examples — finished runs you can borrow

Complete example runs of the sample project (StepCue) for each function card, produced by your tutor with this starter. Use them to **see what a finished result looks like**, or to **keep going if you hit your usage limit** or a step fails.

| Folder | Card | Workflow | Main output |
|---|---|---|---|
| [`card-F/`](card-F/) | F Technical feasibility | `/feasibility` | [feasibility review](card-F/outputs/) · [panel](card-F/panel/index.html) (open by double-clicking) |
| [`card-P/`](card-P/) | P Precedent scout | `/precedents` | [precedents and gaps](card-P/outputs/) |
| [`card-U/`](card-U/) | U User-insight synthesiser | `/insights` | [themes and evidence check](card-U/outputs/) (from the fictional notes in `raw/`) |
| [`card-B/`](card-B/) | B Prototyping & BOM helper | `/bom` | [component options and risks](card-B/outputs/) |

Each folder is a snapshot of a project at the end of M2–M3:

- `project/` — what `/onboard` wrote (sample project)
- `wiki/` — 15 source cards from two `/research` runs, plus the activity log
- `agents/` — the two agents built from the function card prompts
- `skills/` — the workflow built from the workflow template (cards P, U, B)
- `outputs/` — the workflow result
- `report/progress.md` — what `/milestones` reports
- `panel/` — the finished panel (card F)

Agents and skills are stored in plain `agents/` and `skills/` folders, **not** `.claude/`, so they don't load into your own session by accident.

## Hit your usage limit or stuck? Borrow and continue

Copy with Finder or Explorer from the card folder into your own starter folder:

| To skip… | Copy | Into your |
|---|---|---|
| `/research` (MS2) | `wiki/` | `wiki/` |
| building agents (MS3) | `agents/*.md` | `.claude/agents/` |
| building the workflow (cards P, U, B) | `skills/<name>/` | `.claude/skills/` |
| running the workflow (MS4) | `outputs/*.md` | `outputs/` |

Then carry on with the next module. Do **not** copy `report/` — your baseline, comparison and progress must be your own. Run `/milestones` to see where you stand.
