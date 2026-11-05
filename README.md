# awesome-mas

**Build your own multi-agent assistant — for any task — with the AI tool you already use.**

Describe a task in your own words. Your AI designs a small team of agents for it, you shape the team by chatting, lock it, and watch your agents work together in an animated office. No coding, nothing extra to install.

Works with **Claude** (app or Claude Code), **Codex** (app or CLI), **Antigravity** (IDE or CLI) and most other AI coding assistants.

📖 **Step-by-step guide:** https://weixijia.github.io/awesome-mas/

---

## Start in one minute

1. **Make a new, empty folder** (e.g. `my-mas` on your Desktop).
2. **Open it in your AI tool** (see your tool below).
3. **Paste this sentence** — it is the same for every tool:

   ```
   Set up awesome-mas here: read https://raw.githubusercontent.com/weixijia/awesome-mas/main/SETUP.md and follow it.
   ```

Your assistant downloads everything, tests what your tool can do, opens the panel, and says *“Type `next` to start your first MAS.”*

## Set up in your tool

<details open>
<summary><b>Claude Code</b> (terminal)</summary>

1. Install [Claude Code](https://code.claude.com/docs/en/setup) and sign in.
2. Open a terminal in your empty folder and run:
   ```
   claude
   ```
3. When asked, choose **trust this folder** — otherwise every file edit asks for permission.
4. Paste the setup sentence.

Agents run as **real parallel subagents** (the panel shows *Real agents*).
</details>

<details>
<summary><b>Claude app</b> (desktop)</summary>

1. Install the [Claude desktop app](https://claude.com/download) and sign in.
2. Open the **Code** tab → **Open folder…** → choose your empty folder.
3. Paste the setup sentence. Approve when it asks to download or edit files in this folder.
4. Tip: click `office/index.html` in the chat to open the panel next to your conversation.
</details>

<details>
<summary><b>Codex CLI</b> (terminal)</summary>

1. Install [Codex](https://developers.openai.com/codex) and sign in.
2. Open a terminal in your empty folder and run:
   ```
   codex --search
   ```
   (`--search` gives live web results; without it Codex uses cached search.)
3. Paste the setup sentence. If the download is blocked, approve network access when asked, or use the ZIP below.

Agents run as **real parallel subagents**.
</details>

<details>
<summary><b>Codex app</b> (desktop)</summary>

1. Install the [Codex app](https://developers.openai.com/codex) and sign in.
2. Open your empty folder as a project.
3. Paste the setup sentence. If Codex says it can't download (its sandbox may block internet for commands), use the ZIP below, then type `next`.
</details>

<details>
<summary><b>Antigravity</b> (IDE or CLI)</summary>

1. Install [Antigravity](https://antigravity.google/) and sign in.
2. **IDE:** *Open Folder* → your empty folder. **CLI:** open a terminal in the folder and run:
   ```
   agy
   ```
3. Paste the setup sentence. Allow it to edit files in this folder when asked.

Setup tests whether Antigravity can start subagents here. If it can't, your assistant plays each role in turn (*Role-play* in the panel) — the steps and the office are the same, only slower.
</details>

<details>
<summary><b>Any other AI coding assistant</b> (Cursor, Copilot, Gemini CLI, opencode, …)</summary>

1. Open your empty folder in the assistant.
2. Paste the setup sentence.
3. If it doesn't follow the steps on its own, start each conversation with:
   ```
   Read AGENTS.md and follow it.
   ```
</details>

**Can't download from inside your tool?** Download [the ZIP](https://github.com/weixijia/awesome-mas/archive/refs/heads/main.zip), unzip it, move everything from `awesome-mas-main` into your folder, open the folder in your tool and type `next`.

## What to type

| Type | What happens |
|---|---|
| `next` | Do the next step (describe → design → lock → run) |
| a change in your own words, e.g. *“add a budget checker”* | Change the team before it is locked |
| `run again` | Re-run the whole team (e.g. after changing a condition in `me/task.md`) |
| `unlock` | Change a locked team |
| `new` | Start another MAS in the same folder |
| *“switch to lisbon trip”* | Continue another MAS |

Every new conversation starts by asking whether to start a new MAS or continue one you have.

## The 4 steps — type `next` each time

| Step | You | You'll see |
|---|---|---|
| **1 · Describe** | Answer 5 short questions about your task | Your requirements R1, R2… |
| **2 · Design** | — | A draft team for *your* requirements appears in the office, with who reports to whom |
| **3 · Refine & lock** | Change roles in words (*“add a budget checker”*); then lock | Your team moves into the office |
| **4 · Run** | — | Agents working side by side, handing work to each other, checking each other — then a result with sources you can open |

Afterwards: change a condition and type `run again`, type `unlock` to redesign your team, or type `new` to start another MAS. One folder can hold several MAS, each in its own folder; every new conversation starts by asking which one to work on.

## Talk here, watch there

- **Talk** to your assistant — in a terminal or an app. That's where everything happens: answer questions, ask for changes (*“add a budget checker”*), type `next`.
- **Watch** the panel (`office/index.html`, any browser). It's a live view: your task board, your team, each agent at its desk with what it's doing and how far it is, and the result in the side panel when the work is done. Nothing to click.

## What's inside

```
AGENTS.md        instructions your assistant follows (CLAUDE.md / GEMINI.md point here)
SETUP.md         what your assistant does on the setup sentence
harness/         operations, team-design rules, file formats
office/          the live panel (follows whichever MAS you are working on)
home/            what your tool can do, and the list of your MAS (created at setup)
headphone-deals/ one folder per MAS (named when you create it), holding:
  me/            your task, in your words
  mas/           your team's structure and live status
  team/          one job description per agent (created when you lock)
  sources/       every web source your agents used
  outputs/       the result
  raw/           your own files for the agents to read (optional)
examples/        finished examples — double-click examples/index.html
```

## Why a team of agents instead of one chat?

| Ingredient | What you'll notice |
|---|---|
| **Memory** | Close and reopen — it still knows your task, because it lives in files. |
| **Tools** | Agents search the web and save every source, so you can check each claim. |
| **Division of labour** | Specialists work at the same time, and checkers catch what finders miss. |
| **Workflow** | `run again` repeats the whole process in one line. |

More agents also means more tokens — the panel shows the trade-off, and the choice is yours.

## License

MIT
