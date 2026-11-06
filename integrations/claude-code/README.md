# Claude Code · live office

The awesome-mas office, showing your own Claude Code sessions as they work.

- **You** are the Lead. You have no office and walk between the desks: first to a session that needs you, otherwise to one that is working.
- **Each session is a team** with its own room. Subagents that are still running sit in their session's room.
- **Tabs** along the top: **All** shows every team, and each other tab shows one team. In All, clicking a person or a card opens that team. Inside a team, clicking copies `claude --resume <session id>`.
- **States** use the office's usual language:

  | Office state | What the session is doing | Where you see it |
  |---|---|---|
  | `working` | busy | at the desk, typing |
  | `flagged` | asked you a question or waits for approval | standing with a raised hand |
  | `done` | finished in the last 20 minutes | resting |
  | `idle` | quiet for longer | resting |

  Resting people mostly sit at their desk and now and then take a short break in the lounge. Sessions quiet for over 45 minutes leave the office.
- **Lounge options:** the page turns on `roamLead`, `deskRest` and `kitchen` (see `DESIGN.md`). Light and dark mode follow the system.

## Run it

```sh
python3 integrations/claude-code/feed.py
```

Then open `integrations/claude-code/index.html` in a browser. It works from `file://` and needs no server. To leave some sessions out, add `--ignore ~/some/folder` (repeatable).

## What it reads

`feed.py` only reads local files and sends nothing anywhere:

- `~/.claude/sessions/*.json`: which sessions are running, with their name, folder and busy/idle state.
- The tail of each session's transcript (`~/.claude/projects/*/<id>.jsonl`): to describe the current action, for example "Editing app.js" or "Searching the web".
- `~/.claude/projects/*/<id>/subagents/`: subagents that have not finished and wrote something in the last 2 minutes.

These are Claude Code's own working files, not a public API, so an update to Claude Code may change them.

`agents.js` (the feed's output) holds your session names and recent actions. It is listed in `.gitignore`, so it stays out of commits.
