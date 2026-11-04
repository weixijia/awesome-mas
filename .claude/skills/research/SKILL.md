---
name: research
description: Find cited evidence (papers, code, products, cases) on a technical topic for the team's project and file it in the wiki. Use when the student asks what already exists, or whether there is code, research or a product for something.
argument-hint: "[topic]"
---

# /research — find and file evidence

Topic: $ARGUMENTS

1. Read `project/brief.md`. If it is empty, stop and ask the student to run `/onboard` first.
   If no topic was given, use the "least sure" part of the brief and say so.
2. Read `wiki/index.md`. Note existing cards related to the topic and collect their URLs.
3. Launch **two `researcher` agents in parallel** on the same topic, each restricted to different kinds of source so they don't overlap:
   - **Researcher 1 — "evidence":** papers, theses, datasets only.
   - **Researcher 2 — "build and real world":** open-source code, maker builds, products, startups, crowdfunding, patents only.
   Give each: the topic, its source angle, a one-line project summary, a maximum of **3** sources, and the URLs to skip.
   While they work, tell the student: "Two researchers are searching in parallel (about 1–3 minutes). Open the `wiki/sources/` folder to watch the cards appear."
4. When both have returned, check for duplicates (same URL, DOI or title). If two cards describe one source, list it **once** in the index and say so in your reply.
5. Add each new card to `wiki/index.md` under a topic heading, using the line format shown in that file. Append an entry to `wiki/log.md`.
6. Reply with a table — card | type | evidence grade | one-line relevance — followed by the researchers' `Gaps`. No recommendations.
