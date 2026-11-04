# Prompt cards — copy, paste, then change

## M3 — Build your panel

> Build a single self-contained HTML file at `panel/index.html` that opens by double-clicking, with no server and no internet.
> Read `.claude/agents/`, `wiki/index.md`, `wiki/log.md` and the newest file in `reviews/`, and write their content directly into the page yourself. Do not use scripts or terminal commands.
> Show four sections:
> 1. **My agents** — a card per agent with its name, description, tools and model.
> 2. **Knowledge base** — every source card with its evidence grade (colour A–D) and a link to the file.
> 3. **Latest feasibility review** — the component table, coloured by maturity.
> 4. **Activity** — the log as a timeline, newest first.
> Style: clean and readable, large type, works on a laptop screen. Then tell me how to open it.

Then customise it, for example:

- "Make the agents section look like a team org chart."
- "Add a filter so I can show only grade A and B sources."
- "Use our project's colours: …"

**Fast finishers:** "Turn what you just did into a skill called `/panel`, so I can regenerate the panel any time." Then run `/panel` after your next `/research`.

## M4 — Test the memory

1. Type `/clear` — this wipes the conversation, like opening a new chat window.
2. Then ask:

> Without me explaining anything: what is our project, which component is the riskiest, and what evidence do we have for it?

Compare this with what happens if you open a **new** web chat and ask the same.

## Useful any time

- "What did we do so far? Read `wiki/log.md` and summarise."
- "Read `raw/<file>` and add what's relevant as source cards." (for PDFs or notes you dropped in)
- "Which of our components has no grade A or B evidence yet?"
