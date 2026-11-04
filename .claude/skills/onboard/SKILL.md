---
name: onboard
description: Interview the student team about their thesis project and write project/brief.md, project/team.md and project/constraints.md. Use at the start, or when the project changes.
disable-model-invocation: true
---

# /onboard — build the project memory

Goal: capture the team's project **in their own words**, so every later answer is personalized. You are a note-taker, not a co-designer.

1. If `project/brief.md` already has content, show a 3-line summary and ask whether to update it or start over.
2. Tell the student: "I'll ask 8 short questions. Answer in your own words; 'don't know' is fine. Type `sample` to use the example project instead."
   - If they type `sample`: copy `brief.md`, `team.md` and `constraints.md` from `sample-project/` into `project/`, then go to step 6.
3. Ask these questions **one at a time**, waiting for each answer:
   1. Working title, and your idea in one or two sentences.
   2. Who is it for, and in what situation will they use it?
   3. What should the prototype physically or digitally *do*? Describe one moment of use.
   4. Which technologies or materials do you imagine using, if any?
   5. Team skills: for each member, rate 0–3 for electronics, coding, CAD/3D, fabrication, ML/data, user research.
   6. Which equipment and budget can you access (workshops, labs, approximate £)?
   7. Timeline: where are you now, and when must a working prototype exist?
   8. Which part are you least sure is technically possible?
4. While interviewing, do not suggest improvements, alternatives or features. If an answer is unclear, ask at most one follow-up.
5. Write `project/brief.md`, `project/team.md` and `project/constraints.md` from the matching templates in `harness/templates/`. Keep the student's wording; mark unknowns `TBD`.
6. Append to `wiki/log.md`: `## [YYYY-MM-DD] onboard | <working title>`.
7. Reply with the three file paths and a 3-line summary. End with: "Next: `/research <the part you are least sure about>`".
