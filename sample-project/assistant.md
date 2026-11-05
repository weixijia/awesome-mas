# Our assistant

- **Function card:** F Technical feasibility
- **Its job, in our words:** Tell us which parts of StepCue can be built with our skills and budget, how hard each part is, and what evidence exists.
- **Workflow command:** `/feasibility`
- **Agents:** `feasibility-reviewer` (rates maturity and difficulty per component) · `sparring-critic` (challenges assumptions, finds failure modes)
- **What it reads:** wiki sources, project files
- **What it writes:** `outputs/<YYYY-MM-DD>-feasibility-<slug>.md`
- **Why agents? (draft — revisit in M4):** TBD
