---
title: "DeepFoG: An IMU-Based Detection of Freezing of Gait Episodes in Parkinson's Disease Patients via Deep Learning"
url: https://pmc.ncbi.nlm.nih.gov/articles/PMC8185568/
type: paper
evidence_grade: B
accessed: 2026-11-04
topics: [FoG detection, wrist IMU, deep learning]
---

# DeepFoG: An IMU-Based Detection of Freezing of Gait Episodes in Parkinson's Disease Patients via Deep Learning

**What it is:** A deep-learning FoG detector using accelerometer and gyroscope data from a single wrist-worn IMU, evaluated offline on the CuPiD dataset.

**Key excerpt** (verbatim from the page):
> Freezing of Gait (FoG) is a movement disorder

(The fetch tool would only return short quotes from the abstract; this is the one verified fragment.)

**What it shows works:** 11 patients with FoG (184 labeled episodes, 128 Hz), 3 s windows, decision step 0.25 s. Leave-one-subject-out: sensitivity 83%, specificity 88%. 10-fold: 86% / 90%.

**Relevance to this project:** Informs the wrist placement option and the accuracy range from a single wrist IMU.

**Limitations:** Offline, retrospective analysis; no embedded deployment and no measured latency (0.25 s is the decision step). Detection, not prediction. Small dataset. Smartwatch use is only proposed.
