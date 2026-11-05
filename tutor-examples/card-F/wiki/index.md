# Wiki index

Catalogue of every source card. Agents read this first and add to it after each `/research`.

Line format, grouped under a `## <topic>` heading:

`- [<title>](sources/<slug>.md) — <one-line summary> — grade <A–D> — <type>`

<!-- Cards are added below this line. -->

## Freezing of gait: real-time detection and cueing
- [Wearable Online FoG Detection and Cueing System (detection facet)](sources/fog-online-detection-cueing-mcu.md) — CNN+RNN on an Arduino Portenta H7, 40 Hz, 261 ms average delay, 1 Hz vibration cue; shank, detects after onset — grade B — paper
- [Wearable Online FoG Detection and Cueing System (products facet)](sources/online-fog-detection-cueing-system.md) — same paper as above (duplicate card); 45% shorter average freeze in a very small preliminary sample — grade B — paper
- [DeepFoG: IMU-Based FoG Detection via Deep Learning](sources/deepfog-wrist-imu.md) — single wrist IMU, 11 patients, offline; sensitivity/specificity 83/88% (leave-one-subject-out) — grade B — paper
- [Deep learning for FoG detection using wearable sensors](sources/fog-hybrid-dl-edge-devices.md) — quantized hybrid model, ~211 ms per window on Raspberry Pi 4, <75 ms on Coral Edge TPU; not microcontrollers — grade B — paper
- [Daphnet Freezing of Gait Dataset (UCI)](sources/daphnet-fog-dataset.md) — public labelled FoG accelerometer data including an ankle/shank position — grade A — dataset
- [Vibrotactile Foot Device for FoG: Pilot Study](sources/vibrotactile-foot-device-pilot.md) — 33 patients; vibration cues cut FoG episodes by 33.1% and time frozen by ~32.6% — grade B — paper

## Freezing of gait: pre-FoG prediction
- [Early Detection of FoG Using IMU and Plantar Pressure Data](sources/early-fog-detection-imu-plantar-pressure.md) — 2 s Pre-FOG class, 7 freezers; Total-FOG 76.4% sens / 86.2% spec, Pre-FOG windows alone 55.2% sens; gain is detection within ~1 s of onset — grade B — paper

## Wearable hardware: power, battery and commercial examples
- [ParCuR: AI-Enabled Gait Cueing Wearable](sources/parcur-ankle-cueing-wearable.md) — ESP8266 + MPU-6050 + vibration motor, 300 mAh; 79.3 mA motor off / 151.7 mA on, est. 225 / 120 min; Wi-Fi not BLE — grade B — paper
- [Cue2walk User Experiences](sources/cue2walk-user-experiences.md) — commercial shank-worn cueing device, 16 users, about 9 h/day use; no battery specs given — grade B — paper
- [DRV2605L Flexible Haptic and Vibration Driver (TI)](sources/ti-drv2605l-haptic-driver.md) — I2C driver for ERM and LRA, 2–5.2 V supply, LRA resonance tracking, built-in effect library — grade A — product
- [Adafruit DRV2605L Haptic Controller Breakout, Arduino Code](sources/adafruit-drv2605-arduino-library.md) — open-source library and examples; chains up to 7 effects for rhythmic patterns — grade A — repo
- [CUE1+ (Parkinson's UK Tech Guide)](sources/cue1plus-parkinsons-uk-tech-guide.md) — commercial chest-worn vibrotactile cueing device; size, weight, price; user complaints of loud buzzing and adhesive irritation; sales paused — grade C — product

## Vibrotactile cueing: motor, placement and perception
- [Good vibrations: tactile cueing for FoG in PD](sources/good-vibrations-tactile-cueing-fog.md) — vibrating socks, 31 people with PD; no group-level FoG improvement, 22 of 31 responded, wide individual variation — grade B — paper
- [Identification of anatomical locations for vibrotactile perception in PD](sources/vibrotactile-location-perception-pd.md) — 21 people with PD; correct location perception thigh 96%, wrist 92%; abstract only — grade B — paper
- [Vibration perception thresholds vs contact force](sources/vpt-contact-force-frequency.md) — at 30 Hz and 200 Hz, threshold depends on frequency and contact force (0.3–9.6 N); heel site, healthy participants — grade B — paper
