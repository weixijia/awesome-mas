---
title: Deep learning techniques for detecting freezing of gait episodes in Parkinson's disease using wearable sensors
url: https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1581699/full
type: paper
evidence_grade: B
accessed: 2026-11-04
topics: [FoG detection, edge deployment, quantization, ankle IMU]
---

# Deep learning techniques for detecting freezing of gait episodes in Parkinson's disease using wearable sensors

**What it is:** Frontiers in Physiology 2025 paper presenting a hybrid deep-learning FoG detector, tested on four public datasets (lower-limb/ankle/waist IMUs, one with EMG/EEG), then quantized and run on edge boards.

**Key excerpt** (verbatim from the page):
> Post-training quantization and pruning enabled deployment on edge devices such as Raspberry Pi and Coral TPU, achieving inference latency under 350 ms.

**What it shows works:** 2 s windows, 50% overlap. Reported average accuracy 92.5%, F1 89.3%, AUC 0.91 (per-dataset accuracy 0.85 to 0.98). 8-bit quantization and pruning cut the model from about 6.5 MB to 2.9 MB. About 211 ms per window on Raspberry Pi 4, under 75 ms on Coral Edge TPU.

**Relevance to this project:** Informs model size and latency when moving a FoG detector from a PC to small hardware, and shows ankle placement in the DeFOG data.

**Limitations:** Detection, not prediction (no prediction horizon). Edge targets are single-board computers, not microcontrollers. Multi-sensor datasets, not a single IMU. The text and tables disagree on which dataset belongs to Tables 3 and 4, and the 92.5% average does not match per-dataset figures (about 89%). Last ~32k characters of the page were not read.
