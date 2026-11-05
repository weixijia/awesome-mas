# Precedents: StepCue, a wearable vibration cue for freezing of gait

Date: 2026-11-05

## Files used
- [brief](../project/brief.md)
- [assistant job](../project/assistant.md)
- [wiki index](../wiki/index.md)
- [team](../project/team.md)
- [constraints](../project/constraints.md)
- [card](../wiki/sources/adafruit-drv2605-arduino-library.md)
- [card](../wiki/sources/cue1plus-parkinsons-uk-tech-guide.md)
- [card](../wiki/sources/cue2walk-user-experiences.md)
- [card](../wiki/sources/deepfog-wrist-imu.md)
- [card](../wiki/sources/fog-hybrid-dl-edge-devices.md)
- [card](../wiki/sources/early-fog-detection-imu-plantar-pressure.md)
- [card](../wiki/sources/good-vibrations-tactile-cueing-fog.md)
- [card](../wiki/sources/vibrotactile-location-perception-pd.md)
- [card](../wiki/sources/parcur-ankle-cueing-wearable.md)
- [card](../wiki/sources/ti-drv2605l-haptic-driver.md)
- [card](../wiki/sources/vibrotactile-foot-device-pilot.md)
- [card](../wiki/sources/fog-online-detection-cueing-mcu.md)
- [card](../wiki/sources/online-fog-detection-cueing-system.md)

## Precedents (precedent-curator)

| Precedent | What it is | How it works | What it shows | Evidence |
|---|---|---|---|---|
| Adafruit DRV2605L Haptic Controller Breakout, Arduino code | Open-source Arduino library and tutorial for a haptic driver breakout board, for makers. Form factor: breakout board (no wearable or gait context). Price: not stated. | An I2C microcontroller plays built-in effects, or chains up to 7 effects with `setWaveform` and `go()`. The page lists 123 built-in effects. Examples (basic, complex, audio) install from the Arduino Library Manager. | A patterned (rhythmic) vibration cue can be prototyped from a microcontroller with off-the-shelf parts. Sequences are limited to 7 effects. The fetched page does not cover ERM vs LRA selection. Grade A. | [adafruit-drv2605-arduino-library](../wiki/sources/adafruit-drv2605-arduino-library.md) |
| CUE1+ (Charco Neurotech, via Parkinson's UK Tech Guide) | Commercial cueing wearable for people with Parkinson's. Chest-mounted, about 5 x 5 x 2.5 cm and roughly 50 g, Class I medical device. Price: 795 GBP plus VAT, plus a 60 GBP per year adhesive patch fee. | Focused vibrotactile stimulation and cueing. The card gives no motor or driver details and describes no freeze detection. The user panel found it easy to use and sturdy. | A commercial vibration cueing product exists. Users complained of loud or distracting buzzing and of skin irritation from the adhesive. Sales were paused at the time of access. It is worn on the chest, not the ankle. Grade C (catalogue entry). | [cue1plus-parkinsons-uk-tech-guide](../wiki/sources/cue1plus-parkinsons-uk-tech-guide.md) |
| Cue2walk | Commercial single-sensor device for people with freezing of gait (FoG). Worn on the outer shank, under the knee. Price: not stated. | Gives auditory and/or vibratory cues triggered by button, heel tap, or automatic freeze detection. An earlier study cited on the card reports 89% sensitivity, 93% specificity and 1.6 s latency. Setup effort: not stated. | A survey of 16 owners found use of about 9 h/day (SD 4) over about 6 months. 15/16 reported positive effects, 13/16 shorter FoG episodes and 12/16 fewer falls (all self-reported). The study was retrospective with no control group, and the authors are tied to the manufacturer. The card gives no battery capacity, battery life or charging details. Grade B. | [cue2walk-user-experiences](../wiki/sources/cue2walk-user-experiences.md) |
| DeepFoG (single wrist IMU) | Deep-learning FoG detector for people with Parkinson's, using one wrist-worn IMU (accelerometer and gyroscope). Evaluated offline on the CuPiD dataset. Price: not stated. | Uses 3 s windows with a 0.25 s decision step, at 128 Hz. There is no embedded deployment, and smartwatch use is only proposed. No user interaction. | 11 patients, 184 labelled episodes. Leave-one-subject-out: 83% sensitivity, 88% specificity. 10-fold: 86% / 90%. It is offline and retrospective, with no measured latency. It detects freezes and does not predict them. Grade B. | [deepfog-wrist-imu](../wiki/sources/deepfog-wrist-imu.md) |
| Deep learning techniques for detecting FoG using wearable sensors (hybrid model, edge deployment) | Frontiers in Physiology 2025 paper. A hybrid deep-learning FoG detector tested on four public datasets (lower-limb, ankle and waist IMUs; one with EMG/EEG). Edge boards: Raspberry Pi 4 and Coral Edge TPU. Price: not stated. | Uses 2 s windows with 50% overlap. 8-bit quantization and pruning cut the model from about 6.5 MB to 2.9 MB. No user interaction. | Average accuracy 92.5%, F1 89.3%, AUC 0.91 (per-dataset accuracy 0.85 to 0.98). Latency is about 211 ms per window on a Raspberry Pi 4 and under 75 ms on a Coral Edge TPU. The edge targets are single-board computers, not microcontrollers. It uses multi-sensor datasets and detects freezes without predicting them. The card notes that the text and tables disagree and the 92.5% average does not match per-dataset figures (about 89%). Grade B. | [fog-hybrid-dl-edge-devices](../wiki/sources/fog-hybrid-dl-edge-devices.md) |
| Early Detection of FoG Using IMU and Plantar Pressure Data | Sensors 2021 study of 11 men with Parkinson's (7 froze). Shimmer3 IMUs on shanks and thighs plus insole pressure sensors. Research setup. Price: not stated. | Classifies a "Pre-FOG" class (the 2 s before a freeze) from window-based IMU and plantar pressure data. The IMUs ran at 512 Hz, which is not low-power. No user interaction. | The best model (IMU + plantar pressure, leave-one-freezer-out) gave Total-FOG 76.4% sensitivity / 86.2% specificity, 93.4% on FOG windows and 85.2% on transition windows. Pre-FOG windows alone reached only 55.2% sensitivity. The IMU-only model gave 61.9% sensitivity / 91.6% specificity. The gain is mostly detection within about 1 s of onset. False positives were about 14%. Only 7 participants froze, and the models were not personalized. Grade B. | [early-fog-detection-imu-plantar-pressure](../wiki/sources/early-fog-detection-imu-plantar-pressure.md) |
| Good vibrations: tactile cueing for FoG in PD (Klaver et al. 2023) | Study of 31 people with PD and FoG. Vibrating socks (open and closed loop), compared with auditory cueing and no cueing, tested ON and OFF medication. Price: not stated. | Tactile cues delivered through the socks. The card lacks motor specifications and was read at abstract level only. | Cueing did not improve FoG at the group level. Mean time frozen with no cueing was 11.2% (ON) and 21.5% (OFF); no cue type changed percent time frozen (ON p = 0.20, OFF p = 0.12). 22 of 31 participants responded (more than 10% relative reduction in time frozen), and which cue worked varied widely between individuals. The cue was delivered by socks, not an ankle band. Grade B. | [good-vibrations-tactile-cueing-fog](../wiki/sources/good-vibrations-tactile-cueing-fog.md) |
| Identification of anatomical locations for vibrotactile perception in PD (Raghuvanshi et al. 2025) | Study of 21 people with PD and 21 age-matched healthy people, using the authors' own custom vibrotactile system. Price: not stated. | Compares how accurately vibration location is identified across body sites. Motor type and frequency were not extracted. | In the PD group the thigh was identified correctly 96% of the time and the wrist 92%. Only the thigh was significantly better (p &lt; 0.05) than all other locations except the wrist. Healthy participants scored 100% at the wrist and thigh and 98% at the finger. Ankle-specific numbers for the PD group were not captured. Past work on shin, calf, ankle, Achilles tendon and heel was in healthy people only. Abstract-level reading. Grade B. | [vibrotactile-location-perception-pd](../wiki/sources/vibrotactile-location-perception-pd.md) |
| ParCuR (AI-enabled gait cueing wearable) | Sensors 2025 paper. A small wearable, 35 x 41 mm and 39.6 g, with the vibration motor at the foot arch. Parts cost EUR 9.40. | MPU-6050 IMU (64 Hz), ESP8266 microcontroller, vibration motor and 300 mAh LiPo battery. It uses Wi-Fi (UDP), and processing runs on an external computer. Online detection triggers stimulation within 0.7 s of episode onset. | Measured current was about 79.3 mA with the motor off and about 151.7 mA with it on, giving an estimated 225 min (motor off) and 120 min (motor always on). On the Daphnet dataset, leave-one-patient-out gave 81.4 +/- 11.2% sensitivity and 77.5 +/- 2.9% specificity. The pilot trial had 2 patients with 0 and 1 FoG events, so it reported no accuracy. Battery figures are lab estimates, and Wi-Fi power does not transfer to BLE. Grade B. | [parcur-ankle-cueing-wearable](../wiki/sources/parcur-ankle-cueing-wearable.md) |
| TI DRV2605L haptic and vibration driver | Texas Instruments catalogue IC for ERM and LRA actuators. Packages: DSBGA (9 pin) and VSSOP (10 pin). Price: not stated. | I2C, PWM or analog input. Supply is 2 V to 5.2 V. It has over 100 effects (6 ERM libraries, 1 LRA library) and LRA-only automatic resonance tracking. Startup is 0.7 ms and shutdown draws 4 µA. Operating range is -40 to 85 °C. | The card lists it as a battery-compatible drive option for rhythmic effect sequencing. The page is a product summary, not the full datasheet, and has no motor part numbers or current figures. The effect library depends on licensed Immersion software, and Smart-Loop is patent pending. The 2 V minimum supply bounds single-cell designs. Grade A. | [ti-drv2605l-haptic-driver](../wiki/sources/ti-drv2605l-haptic-driver.md) |
| Vibrotactile Foot Device for FoG: Pilot Study | Pilot study (Mov Disord Clin Pract 2024) of a closed-loop device with four vibration disks per foot, in an insole style. Price: not stated. | Insole pressure sensors trigger the vibration at foot contact. It is run from an Android app. Vibration range is 5-250 Hz, set to 200 Hz. The cue is foot-contact-triggered, not freeze-prediction. | 33 PD patients with FoG were tested in the "off" medication state. FoG episodes fell from 4.5 to 3.0 per trial (33.1% reduction, P &lt; 0.001). Percent time frozen fell from 27.9 to 18.8 (32.6% reduction, P &lt; 0.001). 73% reported at least minimal improvement. 42 were enrolled; 6 showed no objective freezing and 3 could not perceive the vibration. It was single-center, with no control group, no double blinding and a fixed order. The gain in stride length did not survive correction. Grade B. | [vibrotactile-foot-device-pilot](../wiki/sources/vibrotactile-foot-device-pilot.md) |
| Wearable Online FoG Detection and Cueing System (Slemenšek et al. 2024) | Bioengineering 2024 paper. A shank-worn sensor strip just under the knee (accelerometers, gyroscopes, muscle-activity sensors), 57 g, plus wireless vibration cueing units. The vibrators were on the arms and waist. Price: not stated. | A CNN+RNN model runs on an Arduino Portenta H7 (STM32F747, Cortex-M7) via TensorFlow Lite at 40 Hz. Vibration cues go out over RF. The cue is 1 Hz rhythmic vibration with 10 intensity levels, continuing 3 s after the last detected FoG sample. Models are personalized, with 210-351 s of training data each. | Average detection delay was 10.45 samples (261 ms). Offline on 6 patients: accuracy 0.951, but sensitivity 0.024 and specificity 0.968 (class imbalance, FoG about 5.9% of samples). In the real-time test on 3 patients, FoG probability fell by 32%, 44% and 58% with stimulation. The abstract-level claim of a 45% shorter average freeze comes from a very small sample, and the authors call the results preliminary. It detects after onset and does not predict. It is not an ankle or wrist band, and there was no placebo control. Grade B. | [fog-online-detection-cueing-mcu](../wiki/sources/fog-online-detection-cueing-mcu.md), [online-fog-detection-cueing-system](../wiki/sources/online-fog-detection-cueing-system.md) |

Gaps: The wiki has no precedent for an ankle-worn or wrist-worn band that detects a freeze before it happens and runs on a low-power microcontroller. It has no BLE power figures and no motor specifications or current draw for coin-type ERM or LRA motors. It has no soft-strap or textile enclosure examples and no phone-app precedent for setting the rhythm. It has no precedent for demonstrating such a device to people without Parkinson's, and none on ethics or safety handling for testing. It also has no ankle-specific vibration perception data for people with PD.

## Gap map (gap-mapper)

### Overlaps with existing work

- **Core interaction, rhythmic vibration cue.** Both the idea and the precedents deliver a rhythmic vibration cue to a person with Parkinson's.
  - Brief: "rhythmic vibration cue on the wrist or ankle" ([brief](../project/brief.md)).
  - Slemenšek et al. use a "1 Hz rhythmic vibration" cue with 10 intensity levels ([card](../wiki/sources/online-fog-detection-cueing-system.md): "Cue is 1 Hz rhythmic vibration, 10 intensity levels").
  - CUE1+ combines "focused vibrotactile stimulation and cueing" ([card](../wiki/sources/cue1plus-parkinsons-uk-tech-guide.md)).
  - The foot-device pilot sets its vibration to 200 Hz ([card](../wiki/sources/vibrotactile-foot-device-pilot.md): "set to 200 Hz").

- **Core interaction, sensing triggers the cue.** The idea and several precedents detect gait events automatically and then cue.
  - Brief: "notices when a person with Parkinson's is about to 'freeze'" ([brief](../project/brief.md)).
  - Cue2walk cues by "button, heel tap, or automatic freeze detection" ([card](../wiki/sources/cue2walk-user-experiences.md)).
  - ParCuR "triggers stimulation within 0.7 s of episode onset" ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)).
  - Slemenšek et al. give "an average detection delay of just 261 milliseconds" ([card](../wiki/sources/online-fog-detection-cueing-system.md)).

- **Technical approach, IMU plus microcontroller plus vibration motor plus LiPo.** The idea's parts list matches ParCuR's.
  - Brief: "Motion sensor (accelerometer/gyroscope), small microcontroller, vibration motor, rechargeable battery" ([brief](../project/brief.md)).
  - ParCuR: "MPU-6050 IMU (64 Hz), ESP8266 microcontroller, vibration motor at the foot arch and a 300 mAh LiPo battery" ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)).

- **Technical approach, accelerometer and gyroscope sensing.** Several FoG detectors use the same sensor types.
  - DeepFoG uses "accelerometer and gyroscope data from a single wrist-worn IMU" ([card](../wiki/sources/deepfog-wrist-imu.md)).
  - The hybrid deep-learning paper uses "lower-limb/ankle/waist IMUs" ([card](../wiki/sources/fog-hybrid-dl-edge-devices.md)).

- **Placement, wrist and ankle/lower leg.** The brief names wrist or ankle; the precedents cover wrist, ankle and shank.
  - DeepFoG is wrist-worn ([card](../wiki/sources/deepfog-wrist-imu.md)).
  - ParCuR is a small ankle-category wearable, with the motor at the foot arch ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)).
  - Cue2walk sits on the "outer shank, under the knee" ([card](../wiki/sources/cue2walk-user-experiences.md)).
  - The hybrid paper's DeFOG data includes ankle placement ([card](../wiki/sources/fog-hybrid-dl-edge-devices.md)).

- **Technical approach, haptic driver prototyping.** The idea names a "vibration motor" with a microcontroller ([brief](../project/brief.md)).
  - The Adafruit library lets "an I2C microcontroller" play or chain up to 7 effects ([card](../wiki/sources/adafruit-drv2605-arduino-library.md)).
  - The TI DRV2605L is "for ERM and LRA actuators" with I2C, PWM or analog input ([card](../wiki/sources/ti-drv2605l-haptic-driver.md)).

- **Who the user is and setting.** The idea targets people with Parkinson's and freezing of gait, walking at home or outdoors.
  - Brief: "People with Parkinson's who experience freezing of gait, walking at home or outdoors" ([brief](../project/brief.md)).
  - Cue2walk owners report "about 9 h/day (SD 4) usage over about 6 months" in everyday use ([card](../wiki/sources/cue2walk-user-experiences.md)).
  - Klaver et al. and the foot-device pilot studied people with PD who have FoG ([card](../wiki/sources/good-vibrations-tactile-cueing-fog.md), [card](../wiki/sources/vibrotactile-foot-device-pilot.md)).

- **Technical approach, on-device inference on a microcontroller.** The brief's "least certain part" is real-time detection on a small device, which Slemenšek et al. also run on a microcontroller.
  - Brief: "in real time, on a tiny device" ([brief](../project/brief.md)).
  - Slemenšek et al. run a CNN+RNN on a "Cortex-M7 via TensorFlow Lite for C at 40 Hz" ([card](../wiki/sources/online-fog-detection-cueing-system.md)).

- **Technical approach, a phone app.** The brief says "maybe a phone app to set the rhythm" ([brief](../project/brief.md)). The foot-device pilot is "run from an Android app" ([card](../wiki/sources/vibrotactile-foot-device-pilot.md)).

### Differences from existing work

- **Prediction versus detection.** The idea aims at "about to 'freeze'" and "*before* or *as* it happens" ([brief](../project/brief.md)). Most precedents detect only.
  - DeepFoG: "Detection, not prediction" ([card](../wiki/sources/deepfog-wrist-imu.md)).
  - Hybrid paper: "Detection, not prediction (no prediction horizon)" ([card](../wiki/sources/fog-hybrid-dl-edge-devices.md)).
  - Slemenšek et al.: "Detection after onset, not prediction" ([card](../wiki/sources/fog-online-detection-cueing-mcu.md)).
  - The one pre-freeze study classifies a "Pre-FOG" class, but windows alone reached "only 55.2% sensitivity" ([card](../wiki/sources/early-fog-detection-imu-plantar-pressure.md)). Its best model needs "insole pressure sensors, not IMU alone", with IMUs at 512 Hz ("not low-power").
  - The foot-device pilot cues at foot contact: "foot-contact-triggered, not freeze-prediction" ([card](../wiki/sources/vibrotactile-foot-device-pilot.md)).

- **Time to cue.** The idea's moment of use says "within a second" ([brief](../project/brief.md)). The precedents report these figures:
  - Cue2walk's earlier study: "1.6 s latency" ([card](../wiki/sources/cue2walk-user-experiences.md)).
  - ParCuR: "within 0.7 s of episode onset" ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)).
  - Slemenšek et al.: 261 ms average detection delay ([card](../wiki/sources/online-fog-detection-cueing-system.md)).
  - DeepFoG: "no measured latency (0.25 s is the decision step)" ([card](../wiki/sources/deepfog-wrist-imu.md)).

- **Hardware class for inference.** The idea says "small microcontroller" and "tiny device" ([brief](../project/brief.md)).
  - The hybrid paper's edge targets are "single-board computers, not microcontrollers" (Raspberry Pi 4 about 211 ms per window; Coral under 75 ms) ([card](../wiki/sources/fog-hybrid-dl-edge-devices.md)).
  - ParCuR's "processing runs on an external computer" ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)).
  - Slemenšek et al. use an Arduino Portenta H7 and a 57 g unit with muscle-activity sensors ([card](../wiki/sources/fog-online-detection-cueing-mcu.md)).

- **Team skills against precedent methods.** The team lists "Signal processing and machine learning; low-power embedded firmware" as gaps, with ML/data skill at 0 and 1 ([team](../project/team.md)). The detection precedents use deep-learning models:
  - DeepFoG ([card](../wiki/sources/deepfog-wrist-imu.md)).
  - The hybrid model ([card](../wiki/sources/fog-hybrid-dl-edge-devices.md)).
  - Slemenšek et al.'s CNN+RNN, with per-patient "210-351 s of training data" ([card](../wiki/sources/online-fog-detection-cueing-system.md)).

- **Cue location.** The idea's cue is "on the wrist or ankle", with the band "on their ankle" ([brief](../project/brief.md)). The precedents place cues elsewhere:
  - CUE1+ is "Worn on the chest, not the ankle" ([card](../wiki/sources/cue1plus-parkinsons-uk-tech-guide.md)).
  - Klaver et al. use "vibrating socks" ([card](../wiki/sources/good-vibrations-tactile-cueing-fog.md)).
  - The foot-device pilot uses four vibration disks per foot in an insole style ([card](../wiki/sources/vibrotactile-foot-device-pilot.md)).
  - ParCuR's motor is at the foot arch ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)).
  - Slemenšek et al.'s vibrators "were on arms and waist" ([card](../wiki/sources/online-fog-detection-cueing-system.md)).
  - Cue2walk's single sensor is on the shank, under the knee ([card](../wiki/sources/cue2walk-user-experiences.md)).

- **Form factor and enclosure.** The idea is a "soft strap" ([brief](../project/brief.md)). The cards describe other forms: CUE1+ is chest-mounted with an adhesive patch (about 50 g, "skin irritation from adhesive"), the foot device is an insole, and ParCuR is 35 x 41 mm and 39.6 g. No card describes a soft strap or textile enclosure ([card](../wiki/sources/cue1plus-parkinsons-uk-tech-guide.md), [card](../wiki/sources/vibrotactile-foot-device-pilot.md), [card](../wiki/sources/parcur-ankle-cueing-wearable.md)).

- **Maturity and evidence.** The idea is at the "Define" stage ([brief](../project/brief.md)) with a £300 budget and 6 months to a working prototype ([constraints](../project/constraints.md)).
  - Cue2walk is a commercial product ([card](../wiki/sources/cue2walk-user-experiences.md)).
  - CUE1+ is a Class I medical device at 795 GBP plus VAT ([card](../wiki/sources/cue1plus-parkinsons-uk-tech-guide.md)).
  - The foot-device pilot tested 33 PD patients, with FoG episodes falling from 4.5 to 3.0 per trial ([card](../wiki/sources/vibrotactile-foot-device-pilot.md)).
  - ParCuR lists parts cost at EUR 9.40 ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)).

- **Effect of a cue on freezing.** The idea's moment of use ends with "they step through" ([brief](../project/brief.md)). Klaver et al. report: "Cueing did not improve FOG at the group level", 22 of 31 responded, and "which cue worked varied widely between individuals" ([card](../wiki/sources/good-vibrations-tactile-cueing-fog.md)). In the foot-device pilot, 3 of 42 enrolled "could not perceive the vibration" ([card](../wiki/sources/vibrotactile-foot-device-pilot.md)).

- **Detection accuracy.** The brief says "reliably" ([brief](../project/brief.md)). The reported figures are:
  - DeepFoG, wrist: 83% sensitivity and 88% specificity, leave-one-subject-out ([card](../wiki/sources/deepfog-wrist-imu.md)).
  - ParCuR, Daphnet dataset: 81.4 +/- 11.2% sensitivity and 77.5 +/- 2.9% specificity ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)).
  - Slemenšek et al., offline: "sensitivity 0.024" ([card](../wiki/sources/online-fog-detection-cueing-system.md)).
  - The hybrid paper's cited average of 92.5% "does not match per-dataset figures (about 89%)" ([card](../wiki/sources/fog-hybrid-dl-edge-devices.md)).

- **Power.** The idea has a "rechargeable battery" with no figure ([brief](../project/brief.md)). ParCuR's lab estimates are "225 min (motor off) and 120 min (motor always on)", using Wi-Fi rather than BLE ([card](../wiki/sources/parcur-ankle-cueing-wearable.md)). Cue2walk's card gives no battery data: "does not state battery capacity, battery life or charging details" ([card](../wiki/sources/cue2walk-user-experiences.md)).

- **Demonstration by people without Parkinson's.** The constraints require that it be "demonstrable at an exhibition by people without Parkinson's" ([constraints](../project/constraints.md)). No evidence found in the supplied cards on demonstrating a cueing device to people without Parkinson's.

- **Phone app and rhythm setting.** The idea says "maybe a phone app to set the rhythm" ([brief](../project/brief.md)). The foot-device pilot has an Android app, and its 5-250 Hz range was set to 200 Hz ([card](../wiki/sources/vibrotactile-foot-device-pilot.md)). No evidence found on an app for setting rhythm, as described in the brief, in the other cards. Slemenšek et al. have a fixed "1 Hz" cue with 10 intensity levels ([card](../wiki/sources/online-fog-detection-cueing-system.md)).

- **Ankle perception in PD.** The idea places the cue at the ankle ([brief](../project/brief.md)). Raghuvanshi et al. report the thigh at 96% and the wrist at 92% identification in PD. "Ankle-specific accuracy numbers for the PD group were not captured", and earlier ankle, shin and heel work was in healthy people only ([card](../wiki/sources/vibrotactile-location-perception-pd.md)).

### Open questions

1. The brief says the band detects when someone is "about to" freeze and also "*before* or *as* it happens". Which of these is the intended trigger for the prototype? The cards report prediction results only from a pre-FOG study that used insole pressure sensors.
2. Which sensor combination does the brief mean for detection: an accelerometer and gyroscope alone at the ankle or wrist, or something extra? The cards that report pre-freeze results use plantar pressure, and the hybrid paper uses multi-sensor datasets.
3. Is the "within a second" in the moment of use measured from the start of step shortening or from freeze onset? The cards use differing reference points (onset, decision step, detection delay).
4. Is the exhibition demonstration meant to run live on a wearer's gait or to simulate a freeze? The cards say nothing about this, and the brief says only "demonstrable at an exhibition by people without Parkinson's".
5. What runtime between charges does the idea assume? The brief gives no figure. ParCuR's lab estimates were 120 to 225 min, and Cue2walk owners report about 9 h/day of use, but its card has no battery data.

No source cards from `wiki/sources/` were used beyond those the curator named. The cards for `daphnet-fog-dataset` and `vpt-contact-force-frequency` were not read. I checked the curator's table against all 13 named cards, and I found no mismatches.

Files read:
- ../project/brief.md
- ../project/team.md
- ../project/constraints.md
- the 13 cards named above, in ../wiki/sources/
