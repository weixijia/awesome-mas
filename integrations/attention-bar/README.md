# AttentionBar

A macOS menu bar app that keeps an eye on your coding agents, and on you.

- **Agents office:** your live Claude Code sessions drawn in the awesome-mas animated office: who is working, who is idle, and who is waiting on you.
- **On track / drifting:** when no agent has worked on a work task for a while and you aren't active in a work app, it opens with "Up next": two or three next steps, each with a prompt you can paste into that session.
- **Break mode:** pause monitoring when you step away (Ross has your back).

Made by [@zihan95](https://github.com/zihan95) on top of the awesome-mas office.

## Requirements

- macOS 14 or later, with Xcode command line tools (`swiftc`)
- `python3`
- [Claude Code](https://docs.claude.com/en/docs/claude-code) (the `claude` CLI), which the coach uses to sort sessions and suggest next steps

## Install

```sh
cd integrations/attention-bar
./install.sh            # first run creates config.json; edit it, then run again
```

Edit `config.json`:

| Key | What it does |
|---|---|
| `work_paths` / `personal_paths` | Folders that count as work or personal. Sessions elsewhere are classified by the coach. |
| `work_context` | One or two sentences about your work, so the coach can tell work from personal. |
| `work_apps` | Apps that count as "working" when you're typing in them. |
| `window_minutes` | How long without work activity before it calls you drifting. |

`install.sh` builds the app and starts three LaunchAgents at login: the menu bar app, an activity sampler and the attention guard. Remove them with `./install.sh --uninstall`.

## Files

| File | Role |
|---|---|
| `AttentionBar/` | The menu bar app (SwiftUI) |
| `attention_guard.py` | Decides on track or drifting and writes the "Up next" suggestions |
| `sample.py` | Samples the focused app and agent activity every 30 s into `log.jsonl` |
| `agents_feed.py` | Feeds live sessions to the office (`office/agents.js`) |
| `office/` | The awesome-mas office drawing, adapted for live sessions |
| `callcheck/` | Tells the guard when you're on a call (camera or mic in use) |
| `jump.py` | Jumps to a session's terminal (Orca, Herdr, Terminal or the Claude app) |

Everything stays on your machine. Logs, state and your config are git-ignored.
