# Operations

Each operation ends with the same things: write its files (and their `.js` twins), rewrite `mas/state.js`, update this MAS's entry in `home/projects.js` (`title`, `step`, `phase`, `agents`, `runs`), and tell the student the one next thing to do. Formats are in `harness/formats.md`. Times are ISO 8601 UTC.

**Paths:** except for `setup` and `choose`, every path below is inside the **current MAS folder** named by `current` in `home/projects.js` — `me/task.md` means `<folder>/me/task.md`. `home/` is the only shared folder.

---

## setup

Goal: make this folder ready and tell the student what their tool can do. Runs once per folder; every MAS shares the result.

1. Note which assistant you are (Claude Code, Codex, Antigravity, …) and the operating system, and whether you were started **in this folder** (your working directory or workspace is this folder). If not — e.g. the setup line was pasted into a chat that was already open in another folder — carry on with setup, but add to your final reply: "Next time, start your assistant inside this folder, so it loads this folder's instructions by itself" — for a terminal tool, with its start command from the table in step 7 and `cd <this folder's full path>` in front; for an app, by opening this folder.
2. Write `home/env.md` (a few sentences) — this also proves you can write files. If writing fails, stop and explain how to allow file edits in this tool (see the table below).
3. Web search: try one tiny search (e.g. "UK weather today"). `canSearch` = whether it worked.
4. Subagents — **test, don't guess**: actually start one tiny subagent (instruction: "Reply with the single word ok") the way AGENTS.md → Running roles as agents describes. If it replies, `"parallel"`; if your tool has no way to start one or it fails, `"sequential"`. If your tool only confirms the start and the reply comes later as a message (e.g. Antigravity), wait for that message before writing `home/env.js`; don't end setup on the confirmation alone. Say the result in your reply in the same words as the file — never claim parallel agents if the file says sequential.
5. Write `home/env.js`. If `home/projects.js` does not exist, write it with `"current": null` and an empty `projects` list. (Old layout: if this folder already has a top-level `me/task.md`, ask the student for a short name and move `me/`, `mas/`, `team/`, `sources/`, `outputs/` and `raw/` into that MAS folder before going on.)
6. Open the panel (AGENTS.md → Opening the panel), and say where it is in case it didn't open.
7. Give tool tips only if needed:

| Tool | Tip |
|---|---|
| Claude Code / Claude app | Claude Code: start it with `claude --dangerously-skip-permissions` so it doesn't stop to ask (only inside this folder). Claude app: trust this folder; allow file edits and web search when prompted. |
| Codex | Start Codex with `codex --search --dangerously-bypass-approvals-and-sandbox`: live web search, and no stops to ask (only inside this folder). |
| Antigravity | CLI: start it with `agy --dangerously-skip-permissions` so it doesn't stop to ask (only inside this folder). IDE: approve edits when asked. |
| Other | Allow file edits in this folder and web search. |

8. Reply: one-line welcome, the 4 steps, that this folder can hold several MAS (one folder each), "Keep `office/index.html` open — it follows whichever MAS we work on", and "Type `next` to start your first MAS."

---

## choose  (start of every conversation · `new` · "switch to …")

Goal: agree with the student which MAS this conversation works on.

1. List this folder and read `home/projects.js`. A MAS folder is a folder that contains `me/` or `mas/` — ignore `home/`, `office/`, `harness/`, `examples/`, `practice/` and hidden folders. If a MAS folder is missing from `projects`, add it (title from its `me/task.js`, or the folder name); drop entries whose folder no longer exists.
2. Set `"current": null` in `home/projects.js` — the panel now shows the list of MAS while the student chooses.
3. Decide new or continue:
   - **No MAS yet**, or the student typed `new`: it's a new MAS — don't ask for a name.
   - **Otherwise** (skip the question if the student already named one): ask "Start a new MAS, or continue one of these?" and list each as `folder — title — step` (e.g. `headphone-deals — Headphone deal finder — 4 Run, done`). If they answer "new", it's a new MAS.
4. **New:** start `describe` straight away and ask its first question in this same reply. The MAS gets its folder and name from the student's first answer (describe → step 1). The new MAS counts as chosen: if the student types `next` instead of answering, just ask question 1 again — don't run `choose` again.
   **Continue:** set `"current"` to the folder the student picked in `home/projects.js`, then reply `MAS: <folder>` and one line on where it stands (read its `mas/state.js` → `next`). If its `phase` is `running`, no agents of yours are working in this new conversation: say the last run stopped halfway and that `next` finishes it, keeping the work already done. If its `me/task.md` is missing, step 1 is unfinished: carry on with `describe` in this same reply, asking the first question not yet answered in `me/answers.md`.

---

## describe  (step 1 · ingredient: memory)

1. Interview the student, **one question at a time**, waiting for each answer:
   1. What should your assistant help you do? *(Examples: compare prices before a purchase, plan a trip, check if a thesis idea is feasible, find a flat, plan meals, make a study plan, organise an event, prepare job applications — anything.)*
   2. What are your preferences and limits? *(budget, time, things to avoid…)*
   3. What does a good result look like? How will you judge it?
   4. Will you do this again? How often?
   5. Do you have your own material for it? *(If yes, put the files in `<folder>/raw/` — tell them the real folder name.)*
   If an answer is unclear, ask one short follow-up. Don't suggest a different task or add features. If `me/answers.md` already holds some answers (the student continued this MAS), don't ask those again.
   **New MAS — name it right after the first answer**, before asking question 2:
   - Folder name: 2–4 English words from the task, lower-case letters, digits and hyphens, at most 40 characters, not an existing folder and not `home`, `office`, `harness`, `examples` or `practice` (e.g. "Compare prices before I buy noise-cancelling headphones" → `headphone-deals`). Title: a few words in the student's language.
   - Create `<folder>/raw/README.md` (one line: "Put your own files for this MAS here. Your assistant reads them but never changes them."). Write `<folder>/mas/state.js` (`step: 1`, `phase: "describe"`, `next: "Answer the questions in the chat."`). Add `{"folder": …, "title": …, "step": 1, "phase": "describe"}` to `projects` in `home/projects.js` and set `"current"` to this folder.
   - Start that reply with `MAS: <folder>` and one line: "I've called this MAS *<title>* (folder `<folder>/`) — tell me if you'd like another name." Then ask question 2. If the student wants another name, change only the `title` (in `home/projects.js` now, and in `me/task.*` later); the folder keeps its name.
2. Write `me/answers.md` as you go (from the first answer on, once the folder exists), then `me/task.md` and `me/task.js`:
   - title: the name agreed after question 1 (or the one the student asked for since) — don't make up a new one; one-line summary;
   - **requirements R1…Rn**: 3–7 short, checkable lines drawn only from what the student said;
   - repeat.
3. `mas/state.js`: `step: 2`, `phase: "design"`, `next: "Type next and I'll design a team for this task."`
4. Reply: show the requirements. Then the **"a chat can't do this"** moment: "Try it: close this conversation, start a new one in this folder — I'll list your MAS and pick this one up from `me/task.md`. A web chat forgets when you close it." End with "Type `next` to design your team."

---

## design  (step 2 · ingredient: division of labour)

1. Read `me/task.md` and `harness/roles.md`.
2. Derive the team: Lead + roles, each with `serves`, `why`, `job`, `tools`, `group`, `handsTo`. Prefer the smallest team that serves every requirement well.
3. Write `mas/structure.md` and `mas/structure.js` (`version: 1`, `locked: false`, a one-paragraph `rationale`).
4. `mas/state.js`: `step: 3`, `phase: "refine"`, `version: 1`, `locked: false`, `next: "Tell me anything you want to change, then type next to lock your team."`
5. Reply as described in `harness/roles.md` → How to present a design.

---

## refine  (step 3)

Input: the student's change in plain words.

1. Apply the change to the structure (both files). Keep role ids stable; new ids are lower-case-with-hyphens.
2. Explain the effect in one or two lines: speed (what still runs in parallel), cost (agent count), coverage (requirements served). If a role now serves no requirement, or a requirement is no longer served, say so — but the student's choice stands.
3. If the student edited `mas/structure.md` by hand, apply the same change to `mas/structure.js` (or the other way round) and briefly confirm what the team now is.
4. `mas/state.js`: unchanged step/phase, update `updated` and `next`.

---

## lock  (step 3 → 4)

1. The student typed `next` after you told them it locks the team — that is their decision. Lock straight away; don't ask "Lock this team?" or "Are you sure?". (They can `unlock` at any time.)
2. Write `team/lead.md` and one `team/<role-id>.md` per role (format in `harness/formats.md`). Write them so a fresh agent can do the job from the file alone.
3. Set `"locked": true` in both structure files.
4. Write `mas/status/lead.js` and `mas/status/<role-id>.js` for every role with `state: "idle"`, `say: "Ready"` — one write per file with your file tool, not a shell loop.
5. `mas/state.js`: `step: 4`, `phase: "locked"`, `locked: true`, `next: "Type next to run your team."`
6. Reply: the final team as a small table (role · serves · group), then "Your team is locked — each role now has a desk in the office panel. Type `unlock` if you want to change it." Ask the student to open one file in `team/` and read it: "This file *is* the agent — its whole job description."

---

## run  (step 4 · ingredients: tools, division of labour, workflow)

The panel animates the office from the status files, so **status updates are part of the job, not optional**. Do steps 0–2 before starting any role.

0. If `outputs/result.md` already exists, copy it unchanged to `outputs/result-run<N>.md` (N = its run number) **before anything else**.
1. Read `me/task.md`, `mas/structure.js`, every file in `team/`, and `raw/` if any role uses `read my files`.
2. Rewrite **every** status file (one write per file with your file tool): each role `waiting` ("Waiting for my turn"); `lead.js` `working` ("Planning the run"). `mas/state.js`: `phase: "running"`, `next: "Watch the office panel — your team is working."`
3. For each group in order (A, then the group whose `after` is A, …): start every role in the group **at the same time** (AGENTS.md → Running roles as agents), giving each this **role brief**:

   > You are **<role name>** in a small multi-agent team. **Work only inside the folder `<folder>/`** — every path below is inside it (write `<folder>/mas/status/<role-id>.js`, not `mas/status/<role-id>.js`).
   > Your job description is in `team/<role-id>.md` — read it first and follow it exactly.
   > Read and write files with your file tools, one file per call — no shell commands, heredocs or scripts (they trigger approval prompts for the student), and never write outside `<folder>/`.
   > The task is in `me/task.md`. Your inputs: <list the files from roles that hand to you, or "none">.
   > While you work, keep `mas/status/<role-id>.js` updated (format in `harness/formats.md`) — the student is watching these live: `working` when you start, a new short `say` for each major action (e.g. "Searching Currys…"), and finally `handoff` with `"to": "<handsTo>"`. **Whenever you find a problem** (something that breaks a requirement, a doubtful source, a mistake in your input), set `flagged` with a short `flag` (e.g. "Refurbished — breaks R2"), then go back to `working`. Include a rough `progress` (0–100) in every update — the panel shows it as a progress bar under your name.
   > Save each web source you use as a card in `sources/` (format in `harness/formats.md`); never invent sources, prices or quotes. If a page won't open (403, "Access Denied", a cookie or consent wall), say so in your notes and use another source — never guess what the page said.
   > Write your result to `outputs/work/<role-id>.md` and finish with a 3-line summary.

   Wait for the whole group to finish. In sequential mode, play each role yourself in turn, without ending your turn between roles. If your subagent tool returns before the agents finish (e.g. Antigravity), follow AGENTS.md → Running roles as agents: end your turn with one line, and continue from step 4 when they report back.
4. After each role finishes: make sure its status shows `handoff` to its `handsTo`, then set it to `done` ("Handed over"). Between groups, update `lead.js` (`working`, e.g. "Group A done — starting the checkers").
5. Lead: status `working` ("Writing the result"). Combine `outputs/work/*.md` into `outputs/result.md` — the answer to the task, every fact linked to its source card, problems the checkers found clearly marked, and a closing line that leaves the decision to the student. **Keep it short and readable for a non-specialist**: start with a 2–3 line answer, then at most one main table and a short "what the checkers caught" list (about one screen in total). Link to `outputs/work/<role-id>.md` for detail instead of copying it. Write `outputs/result.js` directly with your file tool, not with a script (`run` = previous run + 1), including `work`: one 3–5 line summary per role of what it found or decided (the panel shows it when the student clicks that agent). If an earlier `outputs/result.md` exists, first copy it to `outputs/result-run<N>.md`.
6. Lead status `done` ("Result ready"). `mas/state.js`: `phase: "done"`, `next: "Done! Change a condition in me/task.md and type run again — or type unlock to change your team."`
7. Reply: the headline result in 2–4 lines, a link to `outputs/result.md`, and the **"a chat can't do this"** moments the student just saw: agents working at the same time, a checker catching what a finder missed (if it happened), every claim linked to a source they can open, and that `run again` repeats the whole workflow in one line.

---

## resume  (a run that stopped halfway)

A run stopped before `outputs/result.md` was written: the conversation was closed, the usage limit was hit, or an agent failed. Finish it without redoing work that is already done.

1. Do `run` step 1, then read every `mas/status/*.js`. A role is **done** only when its status is `handoff` or `done` **and** `outputs/work/<role-id>.md` exists. Every other role is unfinished — including one whose work file exists but whose status says `waiting`, `working` or `flagged`: that file may be left over from an earlier run (`run` resets every status at its start).
2. Rewrite the status of each unfinished role to `waiting` ("Waiting for my turn"), each done role to `done` ("Handed over"), and `lead.js` to `working` ("Picking up where we stopped"). `mas/state.js`: `next: "Watch the office panel — your team is working."`
3. Tell the student in one or two lines what was finished and what will run now, and be honest about the mode (AGENTS.md → Running roles as agents).
4. Continue with `run` step 3 from the first group that has an unfinished role, starting only its unfinished roles (their inputs are the work files already written). Then finish with `run` steps 4–7 as usual. It is still the run that stopped, so it gets one run number (step 5), not two.

---

## unlock

1. Set `"locked": false` and add 1 to `version` in both structure files.
2. Set every status to `idle`.
3. `mas/state.js`: `step: 3`, `phase: "refine"`, `locked: false`, new `version`, `next: "Change your team, then type next to lock it again."`
4. Reply briefly. Existing `team/` files are rewritten at the next `lock`.
