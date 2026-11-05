---
name: onboard
description: Interview the student team about their thesis project and their assistant's job, and write project/brief.md, team.md, constraints.md and assistant.md. Use at the start, or when the project changes.
disable-model-invocation: true
disallowed-tools: Bash PowerShell
---

# /onboard — build the project memory

Goal: capture the team's project **in their own words**, so every later answer is personalized. You are a note-taker, not a co-designer.

1. If `project/brief.md` already has content, show a 3-line summary and ask whether to update it or start over.
2. Tell the student: "I'll ask 9 short questions. Answer in your own words; 'don't know' is fine. Type `sample` to use the example project instead."
   - If they type `sample`: copy `brief.md`, `team.md`, `constraints.md` and `assistant.md` from `sample-project/` into `project/`, then go to step 6.
3. Ask these questions **one at a time**, waiting for each answer:
   1. Working title, and your idea in one or two sentences.
   2. Who is it for, and in what situation will they use it?
   3. What should the prototype physically or digitally *do*? Describe one moment of use.
   4. Which technologies or materials do you imagine using, if any?
   5. Team skills: for each member, rate 0–3 for electronics, coding, CAD/3D, fabrication, ML/data, user research.
   6. Which equipment and budget can you access (workshops, labs, approximate £), and roughly how many hours a week can the team spend?
   7. Timeline: where are you now, and when must a working prototype exist? Any ethics or privacy issues (testing with people, personal or health data, cameras or sensors in homes)?
   8. Which part are you least sure about?
   9. What should your assistant do for you? Show the five cards from the table at the top of `handouts/function-cards.md` (F, P, U, B, X — one line each) and ask them to pick one. F is the default if they are unsure.
4. While interviewing, do not suggest improvements, alternatives or features. If an answer is unclear, ask at most one follow-up.
5. Write `project/brief.md`, `project/team.md`, `project/constraints.md` and `project/assistant.md` from the matching templates in `harness/templates/`. Keep the student's wording; mark unknowns `TBD`. In `assistant.md`, fill the card, workflow command and agent names from the chosen card in `handouts/function-cards.md`; leave "Why agents?" as `TBD`.
6. Append to `wiki/log.md`: `## [YYYY-MM-DD] onboard | <working title> (card <letter>)`.
7. Reply with the file paths and a 3-line summary. End with: "Next: `/research <the part you are least sure about>`" — or, for card U: "Next: put your notes in `raw/`."
