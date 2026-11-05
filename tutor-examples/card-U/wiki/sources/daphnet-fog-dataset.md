---
title: Daphnet Freezing of Gait
url: https://archive.ics.uci.edu/dataset/245/daphnet+freezing+of+gait
type: dataset
evidence_grade: A
accessed: 2026-11-04
topics: [fog-detection, imu-dataset]
---

# Daphnet Freezing of Gait

**What it is:** A public UCI dataset of annotated body-worn accelerometer recordings from Parkinson's patients who experience freezing of gait, recorded during walking tasks. Released under CC BY 4.0, 237 instances and 29 files listed.

**Key excerpt** (verbatim from the page):
> This dataset contains the annotated readings of 3 acceleration sensors at the hip and leg of Parkinson's disease patients
> that experience freezing of gait (FoG) during walking tasks.

**What it shows works:** Freely downloadable labelled FoG data for training and benchmarking a detector. The page lists three accelerometers (ankle/shank, thigh, trunk), each with forward, vertical and lateral acceleration in mg.

**Relevance to this project:** Informs the detection component: a ready training/test set that includes an ankle-level sensor position.

**Limitations:** The fetched page does not state the subject count or sampling rate. A web search summary (not the page itself) gave 10 patients, recorded in a lab in 2008, and a 2026 Scientific Data paper calling the cohort small and acceleration-only; both unverified here. No wrist sensor. Lab recordings, not home use.
