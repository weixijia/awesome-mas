# Cheat sheet

## The only 6 things you need

| To… | Do this |
|---|---|
| Start | Open a terminal **in this folder**, type `claude`, press Enter |
| Ask anything | Type in plain English. No code needed. |
| Run a workflow | Type `/onboard`, `/research <topic>`, `/milestones`, … at the start of a message |
| Approve an action | When asked "Do you want to…?", choose **Yes** (read what it wants to do first) |
| Stop it | Press `Esc` |
| Start a fresh conversation | Type `/clear` (your files stay — that's the point) |

To leave: type `/exit`. To see files: open this folder in Finder / Explorer, VS Code, or Obsidian.

**Lost? Type `/milestones`.** It shows what you've done and the one next step.

## Milestones

| # | Milestone | You have… |
|---|---|---|
| MS0 | Ready | Claude Code running here + a web-chat answer in `report/m0-baseline.md` (before class) |
| MS1 | Context | your project and your assistant's job in `project/` (`/onboard`) |
| MS2 | Knowledge | ≥ 4 cited source cards in `wiki/` (`/research`) — or ≥ 3 notes files in `raw/` (card U) |
| MS3 | Roles | 2 agents of your own design (`handouts/function-cards.md`) |
| MS4 | Workflow | one workflow run with its result in `outputs/` |
| MS5 | Showcase | a panel that shows your system and progress (`handouts/prompt-cards.md`) |
| MS6 | Evaluate | `report/comparison.md` filled, including "Why agents?" |

## What a chat window can't do — and you will see today

| # | Capability | Where you'll see it |
|---|---|---|
| 1 | **Memory** — it remembers through files, not the conversation | `project/`, and after `/clear` in M4 |
| 2 | **Action** — it searches, reads and writes files on your computer | `wiki/sources/` filling up during `/research` |
| 3 | **Roles** — several specialised agents, each with its own context and permissions | your two agents in `.claude/agents/` |
| 4 | **Build** — it writes software and gives you a working tool | `panel/index.html` |
| 5 | **Verify** — every claim points to a source you can open and check | links in `outputs/` |

## If something goes wrong

- "Agent not found" after creating one → type `/exit`, then `claude` again.
- It's been running for more than 8 minutes → press `Esc`, then ask: "What were you doing? Continue with fewer sources."
- Usage limit reached or a step fails → see `tutor-examples/README.md`: copy the finished example for your card and continue.
