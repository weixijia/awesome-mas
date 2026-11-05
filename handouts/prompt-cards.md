# Prompt cards — copy, paste, then change

## M3 — Build your panel

Run `/milestones` first, so your progress is up to date. Then paste:

> Build a single self-contained HTML file at `panel/index.html` that opens by double-clicking, with no server and no internet.
> Read `project/assistant.md`, `.claude/agents/`, `wiki/index.md`, `wiki/log.md`, `report/progress.md` and the newest file in `outputs/`, and write their content directly into the page yourself. Do not use scripts or terminal commands.
> Show five sections:
> 1. **Milestones** — a progress bar and the milestone checklist from `report/progress.md`.
> 2. **My assistant** — its job from `project/assistant.md`, and a card per agent with its name, description, tools and model.
> 3. **Knowledge base** — every source card with its evidence grade (colour A–D) and a link to the file.
> 4. **Latest output** — the main table or findings from the newest file in `outputs/`.
> 5. **Activity** — the log as a timeline, newest first.
> Style: clean and readable, large type, works on a laptop screen. Then tell me how to open it.

Then customise it, for example:

- "Make the agents section look like a team org chart."
- "Add a filter so I can show only grade A and B sources."
- "Use our project's colours: …"

**Fast finishers:** "Turn what you just did into a skill called `/panel`, so I can regenerate the panel any time. Write the skill file directly; no scripts." Then run `/panel` after your next workflow run.

## M4 — Test the memory

1. Type `/clear` — this wipes the conversation, like opening a new chat window.
2. Then ask:

> Without me explaining anything: what is our project, what does our assistant do, and what is the most important finding in our latest output — with its evidence?

Compare this with what happens if you open a **new** web chat and ask the same.

## Useful any time

- `/milestones` — "where am I, what's next?"
- "What did we do so far? Read `wiki/log.md` and summarise."
- "Read `raw/<file>` and add what's relevant as source cards." (for PDFs or notes you dropped in)
- "Which of our claims has no grade A or B evidence yet?"
