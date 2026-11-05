---
title: Wearable Online Freezing of Gait Detection and Cueing System
url: https://pmc.ncbi.nlm.nih.gov/articles/PMC11505507/
type: paper
evidence_grade: B
accessed: 2026-11-04
topics: [fog-detection, rhythmic-cueing, embedded-ml, latency]
---

# Wearable Online Freezing of Gait Detection and Cueing System

**What it is:** Slemenšek et al., Bioengineering 2024;11(10):1048. A wearable that runs a CNN+RNN model (TensorFlow Lite on an Arduino Portenta H7, 40 Hz) and triggers on-demand vibration cues over RF when FoG is detected.

**Key excerpt** (verbatim from the page):
> achieving an average detection delay of just 261 milliseconds
> by decreasing the average duration of freezing of gait episodes by 45%

**What it shows works:** Detection delay 261 ms average (240 ms in simulated-FoG test). Cue is 1 Hz rhythmic vibration, 10 intensity levels, continuing 3 s after the last detected FoG sample. In three real-time patients the FoG share of samples fell by 32%, 44% and 58%. Sensor strip sits just under the knee; vibrators were on arms and waist.

**Relevance to this project:** Informs the "detect and cue within about a second" requirement: shows a sub-second on-device loop is demonstrated, though it detects an ongoing freeze rather than predicting an imminent one.

**Limitations:** Authors call results preliminary; very small patient numbers. Offline results with six patients: accuracy 0.951, specificity 0.968, but sensitivity 0.024 and precision 0.023 (class imbalance, FoG about 5.9% of samples), so the 95.1% is accuracy, not sensitivity. Personalized per patient. Not an ankle/wrist form factor. Only the first 100,000 characters of the page were read. No code link was seen in what was read.
