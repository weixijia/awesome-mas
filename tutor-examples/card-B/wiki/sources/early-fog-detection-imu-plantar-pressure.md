---
title: Early Detection of Freezing of Gait during Walking Using Inertial Measurement Unit and Plantar Pressure Distribution Data
url: https://pmc.ncbi.nlm.nih.gov/articles/PMC8004667/
type: paper
evidence_grade: B
accessed: 2026-11-04
topics: [pre-FoG prediction, IMU, plantar pressure]
---

# Early Detection of Freezing of Gait during Walking Using Inertial Measurement Unit and Plantar Pressure Distribution Data

**What it is:** Sensors 2021 paper from 11 men with Parkinson's (7 froze). It classifies a "Pre-FOG" class (2 s before freeze) with Shimmer3 IMUs on shanks and thighs plus insole pressure sensors.

**Key excerpt** (verbatim from the page):
> The model achieved early detection by identifying the transition from Pre-FOG to FOG while maintaining excellent FOG detection performance (93.4% sensitivity).

**What it shows works:** Best model (IMU + plantar pressure, leave-one-freezer-out): Total-FOG 76.4% sensitivity / 86.2% specificity; FOG windows 93.4% sensitivity; transition windows 85.2%. Pre-FOG windows alone only 55.2% sensitivity. IMU-only model: 61.9% sensitivity, 91.6% specificity.

**Relevance to this project:** Gives measured numbers for how well a pre-freeze state can be detected from wearable IMU data, and shows the gain is mostly detection within about 1 s of onset.

**Limitations:** Only 7 participants froze; window-based metrics; not personalized; about 14% false positives at 86% specificity; best result needs insole pressure sensors, not IMU alone; research setup (512 Hz IMUs, not low-power).
