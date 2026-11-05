# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: students** — Innovation Design Engineering (Imperial College London + Royal College of Art) master's students, mostly design-trained and **not programmers**. In a 3-hour workshop (and afterwards on their own) they use an AI coding assistant they already have — Claude (app or Claude Code), Codex (app or CLI), Antigravity (IDE or CLI) or similar — to design and run a small personal multi-agent system for **any task they choose** (price comparison, trip planning, thesis feasibility, meal plans…). They watch the live panel on their own laptop, beside the AI chat.
- **Secondary: the tutor** — projects the panel in class: an opening demo replay of a finished run, and a gallery walk where students look at each other's panels. It must read clearly from the back of a room as well as on a laptop.

## Product Purpose

awesome-mas teaches, by doing, **why a team of agents can beat a single chat**: memory (the task lives in files), tools (agents search the web and save checkable sources), division of labour (specialists work in parallel and checkers catch mistakes) and workflow (`run again` repeats the whole process). Success = a student can name those four ingredients from what they saw, can justify why each role exists, and can judge when more agents are not worth the extra tokens.

## Positioning

A tool-agnostic kit, not an app: everything is plain files plus one static web page, driven by whatever AI assistant the student already uses — no install, no server, no account. The team is **derived from the student's own requirements** and shown as people working in an office, so multi-agent collaboration stops being a black box.

## Operating Context

- Four steps, each triggered by typing `next` in the AI chat: Describe → Design → Refine & lock → Run (then `run again` / `unlock`).
- **All control happens in the chat.** The web panel (`office/index.html`) is a **read-only, real-time view**: it polls data files the agents write (`mas/*.js`, `me/task.js`, `outputs/result.js`) and shows the task board, the draft/locked team, each agent's live status, run progress, the activity log and the result. Nothing in it is clickable as a control (only viewing: open a person's card, collapse the sidebar).
- Opened by double-click (`file://`), any modern browser, offline. Viewed side-by-side with a chat window on 13–16" laptops, and full-screen on a projector.
- Runs take ~3–8 minutes; status updates arrive every few seconds to minutes and may be bursty. Some tools run roles as real parallel subagents, others play each role in turn ("role-play mode") — the panel must show which, honestly.
- Other web surfaces: `docs/index.html` (setup guide, GitHub Pages) and `examples/index.html` (launcher for three finished example runs).

## Capabilities and Constraints

- Static HTML/CSS/vanilla JS only. **No build step, no dependencies, no CDN, no web fonts from the network, no external images** — must work offline from `file://`.
- Data contract is fixed in `harness/formats.md` (status states: idle, waiting, working, handoff, flagged, done; optional `progress` 0–100; `say` ≤ ~60 chars; `result.work[]` per-role summaries). Timestamps in data are unreliable; the panel times things itself.
- Content (task titles, requirements, role names, `say` messages, results) is written in the student's own language — often English or Chinese, possibly others. Role and team sizes vary (Lead + 1…6+ roles, 1…4 groups).
- Must respect `prefers-reduced-motion`.
- Undecided: none recorded.

## Brand Commitments

- Name: **awesome-mas** (lower case). Existing logo, colours and typography are **not** binding — free to redesign.
- Visual reference the user named: Tencent **Marvis "office" view** — anthropomorphic agents who sit at their desks and work when given a task and rest or wander when idle, so collaboration is visible.
- UI language: English. Content in any language must look equally good (CJK-capable typography).

## Evidence on Hand

- Three real example runs in `examples/` (Claude Code price comparison, Codex Lisbon trip, Antigravity thesis feasibility) with real sources and results.
- A real student-perspective run in Chinese (Black Friday TV comparison, Antigravity) used for testing.
- No testimonials, user numbers or endorsements exist — do not invent any.

## Product Principles

1. **One place to act, one place to watch.** The chat is for doing; the panel is for seeing. Never blur them.
2. **Make collaboration legible.** Every visual element answers: who is working, on what, for which requirement, handing to whom, and how far along.
3. **Honest by default.** Show real mode (parallel vs role-play), real progress, real sources; no fake activity.
4. **The student's words lead.** Their task and requirements are the content; the interface frames them.
5. **Cost is part of the lesson.** More agents = more tokens; keep that visible, never preachy.

## Accessibility & Inclusion

- WCAG AA contrast; readable on a projector from the back of a room and on a laptop.
- Status must never be conveyed by colour or motion alone (labels/icons too).
- `prefers-reduced-motion` honoured with static equivalents.
- Mixed-script content (Latin + CJK) must render with appropriate fonts and line breaking.
