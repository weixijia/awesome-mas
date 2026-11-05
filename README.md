# awesome-mas

**Build your own multi-agent assistant — for any task — with the AI tool you already use.**

Describe a task in your own words. Your AI designs a small team of agents for it, you shape the team on a mind map, lock it, and watch your agents work together in an animated office. No coding, nothing extra to install.

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
| **2 · Design** | — | A mind map of the agent team designed for *your* requirements |
| **3 · Refine & lock** | Change roles in words (*“add a budget checker”*) or on the mind map; then lock | Your team appears in the office |
| **4 · Run** | — | Agents working side by side, handing work to each other, checking each other — then a result with sources you can open |

Afterwards: change a condition and type `run again`, or type `unlock` to redesign your team.

## Two ways to work — same files

- **Chat:** do everything by talking to your assistant (terminal or app).
- **Panel:** open `office/index.html`, click *Connect project folder* (Chrome or Edge) to fill in the form and edit the mind map, then type `next` in your assistant to let it do the AI work. In other browsers the panel shows everything; make changes by telling your assistant.

## What's inside

```
AGENTS.md        instructions your assistant follows (CLAUDE.md / GEMINI.md point here)
SETUP.md         what your assistant does on the setup sentence
harness/         operations, team-design rules, file formats
office/          the panel (mind map, animated office, result)
me/              your task, in your words
mas/             your team's structure and live status
team/            one job description per agent (created when you lock)
sources/         every web source your agents used
outputs/         the result
raw/             your own files for the agents to read (optional)
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
