# Cheat sheet

## The only 6 things you need

| To… | Do this |
|---|---|
| Start | Open a terminal **in this folder**, type `claude`, press Enter |
| Ask anything | Type in plain English. No code needed. |
| Run a workflow | Type `/onboard`, `/research <topic>` or `/feasibility` at the start of a message |
| Approve an action | When asked "Do you want to…?", choose **Yes** (read what it wants to do first) |
| Stop it | Press `Esc` |
| Start a fresh conversation | Type `/clear` (your files stay — that's the point) |

To leave: type `/exit`. To see files: open this folder in Finder / Explorer, VS Code, or Obsidian.

## What a chat window can't do — and you will see today

| # | Capability | Where you'll see it |
|---|---|---|
| 1 | **Memory** — it remembers through files, not the conversation | `project/`, and after `/clear` in M4 |
| 2 | **Action** — it searches, reads and writes files on your computer | `wiki/sources/` filling up during `/research` |
| 3 | **Roles** — several specialised agents, each with its own context and permissions | your two agents in `.claude/agents/` |
| 4 | **Build** — it writes software and gives you a working tool | `panel/index.html` |
| 5 | **Verify** — every claim points to a source you can open and check | links in `reviews/` |

## Today's path

`/onboard` → `/research <topic>` → create 2 agents → `/feasibility` → build panel → `/clear` + memory test → fill `report/comparison.md`

## If something goes wrong

- "Agent not found" after creating one → type `/exit`, then `claude` again.
- It's been running for more than 8 minutes → press `Esc`, then ask: "What were you doing? Continue with fewer sources."
- Usage limit reached → open `tutor-examples/` (shared by your tutor) and continue the comparison with the example outputs.
