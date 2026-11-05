---
title: Wearable Online Freezing of Gait Detection and Cueing System
url: https://pmc.ncbi.nlm.nih.gov/articles/PMC11505507/
type: paper
evidence_grade: B
accessed: 2026-11-04
topics: [FoG detection, microcontroller, vibration cueing, shank IMU]
---

# Wearable Online Freezing of Gait Detection and Cueing System

**What it is:** Bioengineering 2024 paper (Slemenšek et al.) describing a shank-worn sensor strip (accelerometers, gyroscopes, muscle-activity sensors) with a CNN+RNN model running on an Arduino Portenta H7 (STM32F747), plus wireless vibration cueing units.

**Key excerpt** (verbatim from the page):
> The device operates at a real-time processing rate of 40 Hz and is deployed in practical settings to provide ‘on demand’ vibratory stimulation to patients.

**What it shows works:** Model runs on a Cortex-M7 via TensorFlow Lite for C at 40 Hz. Average detection delay 10.45 samples (261 ms). Cueing is 1 Hz rhythmic vibration, 10 intensity levels. Offline on 6 patients: accuracy 0.951 but sensitivity 0.024 and specificity 0.968 (the authors attribute the low sensitivity to class imbalance, FoG about 5.9% of samples). Real-time test on 3 patients with personalized models (210-351 s of training data each): FoG probability fell by 32%, 44% and 58% with stimulation.

**Relevance to this project:** Informs on-device inference on a microcontroller and the detect-to-cue latency (detection, not prediction).

**Limitations:** Detection after onset, not prediction. Placement is under the knee with muscle-activity sensors and a 57 g unit, not an ankle/wrist band. Very small sample (9 patients; 3 for real-time). Cueing effect called preliminary by the authors; no placebo-controlled study. Sensor count not stated in the portion read; the last ~38k characters of the page were not read.
