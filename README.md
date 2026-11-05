# awesome-mas

**Build your own multi-agent assistant — for any task — with the AI tool you already use.**

Describe a task in your own words. Your AI designs a small team of agents for it, you shape the team by chatting, lock it, and watch your agents work together in an animated office. No coding, nothing extra to install.

Works with **Claude** (app or Claude Code), **Codex** (app or CLI), **Antigravity** (IDE or CLI) and most other AI coding assistants.

📖 **Step-by-step guide:** https://weixijia.github.io/awesome-mas/

---

## Start in one minute

1. **Make a new, empty folder** (e.g. `my-mas` on your Desktop).
2. **Open it in your AI tool** — Claude app: *Code → Open folder* · Codex app: open the folder as a project · Antigravity: *Open Folder* · terminal tools (`claude`, `codex`, `agy`, …): start them inside the folder.
3. **Paste this sentence:**

   ```
   Set up awesome-mas here: read https://raw.githubusercontent.com/weixijia/awesome-mas/main/SETUP.md and follow it.
   ```

Your assistant downloads everything, checks what your tool can do, opens the panel, and says *“Type `next` to begin.”*

**Can't download from inside your tool?** Download [the ZIP](https://github.com/weixijia/awesome-mas/archive/refs/heads/main.zip), unzip it, move everything from `awesome-mas-main` into your folder, open the folder in your tool and type `next`.

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
