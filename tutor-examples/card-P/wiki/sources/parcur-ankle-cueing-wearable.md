---
title: ParCuR—A Novel AI-Enabled Gait Cueing Wearable for Patients with Parkinson's Disease
url: https://pmc.ncbi.nlm.nih.gov/articles/PMC12656022/
type: paper
evidence_grade: B
accessed: 2026-11-04
topics: [low-power hardware, battery life, vibration cue, ankle wearable]
---

# ParCuR—A Novel AI-Enabled Gait Cueing Wearable for Patients with Parkinson's Disease

**What it is:** Sensors 2025 paper describing a small wearable with an MPU-6050 IMU (64 Hz), ESP8266 microcontroller, vibration motor at the foot arch and a 300 mAh LiPo battery. Parts cost EUR 9.40; 35 x 41 mm, 39.6 g.

**Key excerpt** (verbatim from the page):
> The online detection algorithm triggers stimulation within 0.7 s of episode onset

**What it shows works:** Measured current is about 79.3 mA with motor off and about 151.7 mA with motor on, giving an estimated 225 min (motor off) and 120 min (motor always on). On the Daphnet dataset, leave-one-patient-out gave 81.4 +/- 11.2% sensitivity and 77.5 +/- 2.9% specificity.

**Relevance to this project:** A concrete, low-cost hardware example with real current and runtime figures for IMU + radio + vibration motor on a small battery.

**Limitations:** Uses Wi-Fi (UDP), not BLE, so its power figures do not transfer directly to BLE. Processing runs on an external computer. Battery figures are from lab estimates; runtime is only 2-4 h. Pilot trial had 2 patients with 0 and 1 FoG events, so no accuracy was reported from the trial.
