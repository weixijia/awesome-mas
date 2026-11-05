# Feasibility review: StepCue

- **Date:** 2026-11-05
- **Idea reviewed:** A small wearable that notices when a person with Parkinson's is about to "freeze" while walking and gives a rhythmic vibration cue on the wrist or ankle to help them start walking again. Moment of use: the user approaches a doorway, their steps shorten and they start to freeze; within a second the band pulses in a steady rhythm and they step through.
- **Team context used:** [brief](../project/brief.md) · [team](../project/team.md) · [constraints](../project/constraints.md)
- **Rubric:** [feasibility-rubric](../harness/feasibility-rubric.md)

## Overall verdict

Research-grade · Overall difficulty 5 (driven by: Pre-freeze prediction, before or at onset) · Confidence medium

## Component ratings (from feasibility-reviewer)

| Component | Critical? | Maturity | Difficulty (1–5) | Why, for this team | Evidence |
|---|---|---|---|---|---|
| 1. Motion sensing (ankle/shank IMU) | Yes | Proven | 2 | A cheap IMU such as the MPU-6050 is already used in a small wearable (35 x 41 mm, 39.6 g, parts EUR 9.40). Member B has basic Arduino skills (Electronics 2), so wiring one over I2C is learnable. Daphnet includes an ankle/shank accelerometer for later data work. The ParCuR card does not say where the IMU sits, and Daphnet is accelerometer-only and lab-recorded. Confidence: medium. | [Daphnet](../wiki/sources/daphnet-fog-dataset.md) (A); [ParCuR](../wiki/sources/parcur-ankle-cueing-wearable.md) (B); [Cue2walk](../wiki/sources/cue2walk-user-experiences.md) (B, shank-worn commercial unit) |
| 2. Real-time FoG detection on a microcontroller | Yes | Adaptable | 4 | A CNN+RNN ran at 40 Hz on a Cortex-M7 (Portenta H7) with 261 ms average delay, so the sub-second loop is demonstrated. The team's gaps are signal processing, ML and low-power firmware, and the demonstrated system is personalized (210-351 s of training data per patient). Its offline sensitivity was only 0.024 with class imbalance, and the card saw no code link. Other results are offline (DeepFoG wrist, 83/88%) or run on a Raspberry Pi or Coral rather than an MCU. ParCuR's processing ran on an external computer. Daphnet is a small, lab-recorded dataset. Confidence: medium (all B-grade papers; the only A-grade item is the dataset). | [MCU detection](../wiki/sources/fog-online-detection-cueing-mcu.md) (B); [online system](../wiki/sources/online-fog-detection-cueing-system.md) (B, duplicate card); [DeepFoG](../wiki/sources/deepfog-wrist-imu.md) (B); [hybrid DL](../wiki/sources/fog-hybrid-dl-edge-devices.md) (B); [Daphnet](../wiki/sources/daphnet-fog-dataset.md) (A); [ParCuR](../wiki/sources/parcur-ankle-cueing-wearable.md) (B) |
| 3. Pre-freeze prediction (before or at onset) | Yes | Research-grade | 5 | The one study found has a 2 s Pre-FOG class: Pre-FOG windows alone reached 55.2% sensitivity. The card says the gain is mostly detection within about 1 s of onset. The best result needed insole pressure sensors plus shank and thigh IMUs at 512 Hz (IMU-only: 61.9% sensitivity), and only 7 participants froze. The other detectors in the wiki are detection after onset, with no prediction horizon. With the team's ML and signal-processing gap and no collaborator in the wiki, no reliable route to prediction was found within the timeline. Confidence: medium (single B paper, no code). | [early detection](../wiki/sources/early-fog-detection-imu-plantar-pressure.md) (B); [MCU detection](../wiki/sources/fog-online-detection-cueing-mcu.md) (B, "Detection after onset, not prediction") |
| 4. Vibrotactile rhythmic cue (motor, driver, placement) | Yes | Proven | 2 | The DRV2605L (2-5.2 V, I2C, ERM or LRA) is a catalogue part. The Adafruit Arduino library chains up to 7 effects for patterned pulses, which fits the team's Arduino level (a new skill, learnable). The Slemenšek cue was 1 Hz rhythmic vibration. Clinical evidence is mixed: a pilot with 33 patients showed fewer FoG episodes and less time frozen, while the 31-person sock study found no group-level effect (22 of 31 responded). Ankle-specific perception in PD was not captured (wrist 92%, thigh 96%). The VPT study is healthy heel data only, but it shows band tightness changes perception. The 2 V minimum supply bounds single-cell battery choices, no motor current figures were captured, and 3 of 42 pilot patients could not perceive the vibration. Confidence: medium for hardware; the cue's clinical effect is not established for this form factor. | [DRV2605L](../wiki/sources/ti-drv2605l-haptic-driver.md) (A); [Adafruit library](../wiki/sources/adafruit-drv2605-arduino-library.md) (A); [foot pilot](../wiki/sources/vibrotactile-foot-device-pilot.md) (B); [Good vibrations](../wiki/sources/good-vibrations-tactile-cueing-fog.md) (B); [location perception](../wiki/sources/vibrotactile-location-perception-pd.md) (B); [VPT vs force](../wiki/sources/vpt-contact-force-frequency.md) (B) |
| 5. Power, battery and wearable form factor | Yes | Adaptable | 3 | ParCuR measured 79.3 mA (motor off) and 151.7 mA (motor on) on a 300 mAh cell, estimated at 225 and 120 min, with Wi-Fi rather than BLE. Cue2walk users wear their device about 9 h/day, so the runtime gap is large. The card gives no Cue2walk battery figures, and the ML inference load is not in ParCuR's numbers. Member A's CAD (3) and sewing and 3D-print access cover the enclosure and strap. The low-power firmware gap and the £300 budget are the limits. CUE1+ (chest-worn, about 50 g) reports loud buzzing and adhesive irritation. Confidence: medium-low (battery evidence is one lab estimate; CUE1+ is grade C). | [ParCuR](../wiki/sources/parcur-ankle-cueing-wearable.md) (B); [Cue2walk](../wiki/sources/cue2walk-user-experiences.md) (B); [CUE1+](../wiki/sources/cue1plus-parkinsons-uk-tech-guide.md) (C) |
| 6. Data, ethics and testing with users | Yes | Adaptable | 4 | Labelled public data exists (Daphnet, CC BY 4.0), so training data without patients is available, though it is a small, lab-recorded, acceleration-only cohort. Testing with people with Parkinson's needs ethics approval, fall-risk control and health-data handling, and the team has no clinical collaborator beyond an informal PhD contact. Prototype due in 6 months at about 20 h/week. User research is Member A 2 and Member B 1. The exhibition must be demonstrable by people without Parkinson's. Low confidence on the ethics and approval timeline: No evidence found. | [Daphnet](../wiki/sources/daphnet-fog-dataset.md) (A, data only); No evidence found for ethics or approval timelines |

## Technical routes for hard components

### Pre-freeze prediction (before or at onset) — Research-grade

- **Wizard-of-Oz trigger.** A person or a pre-recorded or simulated signal fires the cue at the doorway moment.
  - Cost: the detection and prediction claim is not tested.
  - Cost: it suits the exhibition demo, since non-PD people can show it.
  - Cost: it needs little ML skill and very little extra budget.
- **Substitute technology: detection at or just after onset.** This is the approach in the demonstrated systems (261 ms delay), and the early-detection paper reports its gain as detection within about 1 s of onset.
  - Cost: this is component 2's difficulty (4), with the ML and firmware gap.
  - Cost: it does not predict, so the cue arrives after the freeze has started.
- **Substitute technology: add plantar pressure sensing.** The best Pre-FOG result used IMU plus insole pressure.
  - Cost: extra sensors in the shoe or insole change the "small ankle/wrist band" form factor.
  - Cost: it adds parts, wiring and power, and the setup was research-grade (512 Hz).
  - Cost: it still gave only 55.2% sensitivity on Pre-FOG windows alone.
- **Substitute technology: foot-contact-triggered cueing.** The foot pilot cued at foot contact from insole pressure sensors, without predicting freezes.
  - Cost: it changes what the device does, from freeze-triggered to gait-triggered.
  - Cost: that pilot used four disks per foot and a 33-patient sample without controls, and its sensing was in the insole.
- **Narrowed scope.** Single user, personalized model, controlled doorway or simulated FoG on healthy volunteers.
  - Cost: a personalized model needs per-person training data, and the Slemenšek real-time test used 210-351 s per patient.
  - Cost: simulated FoG from healthy people does not show real PD behaviour.
  - Cost: collecting data from patients needs ethics approval.

The team decides which route, if any, to take.

## Challenges and open questions (from sparring-critic)

### Assumptions that may not hold

- **"Detect imminent freezing, cue within about a second" (brief; components 2 and 3).** The cards do not show prediction at ankle/wrist with IMU alone.
  - The pre-FoG card says Pre-FOG windows alone reached only 55.2% sensitivity. The IMU-only model reached 61.9% sensitivity, and the best model needed insole pressure sensors ([early-fog](../wiki/sources/early-fog-detection-imu-plantar-pressure.md): "Pre-FOG windows alone only 55.2% sensitivity").
  - The card itself says the gain is "detection within about 1 s of onset". That is detection, not prediction.
  - The online MCU system "detects after onset, not prediction" ([fog-online](../wiki/sources/fog-online-detection-cueing-mcu.md)).
  - The doorway story in the brief ("steps shorten and they start to freeze; within a second ... pulses") describes detect-at-onset. The word "imminent" is not supported anywhere.
- **A published detector will transfer to the team's own hardware and subjects (components 1, 2).**
  - Daphnet is a lab dataset. The card flags that the subject count and sampling rate are unverified, and that the cohort is reportedly small and acceleration-only. It has no wrist sensor.
  - ParCuR reports 81.4 +/- 11.2% sensitivity and 77.5% specificity on Daphnet. The +/- 11.2 is a wide spread between patients, and 77.5% specificity implies frequent false cues.
  - DeepFoG's 83/88% is wrist, offline, 11 patients ([deepfog](../wiki/sources/deepfog-wrist-imu.md)). The brief says "ankle or wrist" but these results are not interchangeable between placements.
- **"A CNN on a microcontroller works."**
  - The one MCU source ran on an Arduino Portenta H7 (a Cortex-M7 board), with a 57 g under-knee unit that included muscle sensors.
  - Offline sensitivity was 0.024, which the authors attribute to class imbalance. The real-time test used 3 patients with personalised models trained on 210-351 s of each person's data.
  - The hybrid DL card reports ~211 ms per window on a Raspberry Pi 4, "not microcontrollers".
  - The team's gap is stated in `project/team.md`: ML/data skill of 0 and 1, and weak low-power embedded firmware. Personalised training also implies per-user data collection, which the team has no route to yet.
- **Vibration cue reliably helps (component 4).**
  - [good-vibrations](../wiki/sources/good-vibrations-tactile-cueing-fog.md): "Cueing did not improve FOG at the group level", with 22 of 31 responding and wide variation.
  - [foot-pilot](../wiki/sources/vibrotactile-foot-device-pilot.md): no control group, fixed order off-then-on, 3 of 42 could not perceive the vibration. The cue was foot-contact-triggered via insole sensors, not an ankle band.
  - The 45% shorter freeze in the online paper is called preliminary and rests on a very small sample.
  - A 1 Hz cue with 10 intensity levels is a specific pattern. The team's rhythm and frequency choice has no source behind it.
- **Perception of the cue on the ankle or wrist.**
  - The location card gives thigh 96% and wrist 92% correct perception. It is abstract only, and it gives no ankle figure.
  - The threshold-vs-force card used healthy participants at the heel ([vpt](../wiki/sources/vpt-contact-force-frequency.md)). A soft strap may not hold the contact force that matters. Patients with PD may have different thresholds. No evidence found for either.
- **Battery and form factor (component 5).**
  - ParCuR draws 79.3 mA with the motor off and 151.7 mA with it on, giving an estimated 120-225 min on 300 mAh. It used Wi-Fi, with processing on an external computer.
  - Cue2walk users wear their device about 9 h/day, and no battery spec is given. So there is no source showing that a day's wear is achievable.
  - CUE1+ is cited for loud buzzing and adhesive irritation, and sales were paused. That card is grade C.
  - The brief's "maybe a phone app" adds a BLE link. There is no BLE power data in the cards.
- **Cost and time fit.** The budget is £300 and the team has about 20 h/week. Ethics approval for testing with people with Parkinson's is required. No evidence found that approval is feasible within the 6-month interim show.

### Likely failure modes

1. **Data and validation vacuum.** The team cannot collect its own FoG data without ethics approval. Public data are lab-recorded, from a small cohort, and have no wrist channel. A detector tuned on Daphnet may fail on any other body, gait or walking environment. This breaks first, because everything downstream depends on it.
2. **Late or missing cue.** Detection after onset plus windowing (the MCU system's 261 ms average, with other windows longer) plus motor spin-up plus cue ramp can push total latency past the "about a second" claim. If the cue arrives after the freeze is established, the doorway moment fails. The one MCU cueing paper reports delay for detection only.
3. **False positives (~14-23% at the quoted specificities).**
   - Cues fire during normal walking, turning or standing.
   - Cue-induced attention or gait disturbance could create a fall risk. `project/constraints.md` says the device must not create one.
   - Users may stop trusting it or switch it off.
4. **False negatives.** The MCU paper's offline sensitivity of 0.024 shows a model can look accurate (0.951 accuracy) while missing nearly every freeze. The prototype could show good accuracy numbers and still not work.
5. **Exhibition demo cannot use real freezing.** Visitors without Parkinson's do not freeze. A demo would need simulated or replayed data, and that would not demonstrate detection. It would only demonstrate the cue.
6. **Power and thermal budget.** If the BLE and IMU duty cycle plus an LRA/ERM draw anything like ParCuR's 2-4 h figure, the band is dead before the demo day ends. A 300 mAh pack limits the physical size of the strap, which is the team's strength area.
7. **Haptic integration.** A DRV2605L library supports effect chaining, but it does not guarantee skin contact on a moving ankle. Strap slippage changes sensor orientation, which degrades a model trained on one placement.
8. **Wrist versus ankle ambiguity.** Keeping both open means two sensing pipelines' worth of risk, with 20 h/week.

### Questions the team needs to answer

1. What does "imminent" mean in measurable terms, for example the lead time before onset your detector must reach? On which data (Daphnet or your own) will you measure it, and what is the sensitivity/specificity at that lead time?
2. With ML/data skills of 0 and 1 and no personalised training data, who will train, quantise and deploy the model on the MCU? Have you run any model, or even a threshold rule, on your board at the needed rate?
3. What is the end-to-end latency from the start of the freeze to felt vibration on skin, measured with your actual motor, driver, strap and window length? What do you do with that number if it exceeds one second?
4. What false-cue rate per hour of ordinary walking can a user tolerate, and how will you measure it without access to participants with Parkinson's before ethics approval arrives?
5. What will the exhibition prototype actually demonstrate to visitors without FoG, and which claims will it make about detection versus cueing?

## Disagreements

- **Component 4 (vibrotactile cue).** The reviewer rates it Proven, difficulty 2, because the driver and library are catalogue parts that fit the team's Arduino level, and notes mixed clinical evidence. The critic questions whether the cue helps at all for this form factor (no group-level effect in the sock study; the pilot had no control group and cued from insole sensors, not an ankle band). Both views stand: the hardware is obtainable, and the clinical effect for an ankle band is not established.
- **Component 2 vs critic's latency concern.** The reviewer treats the 261 ms detection delay as showing the sub-second loop is demonstrated. The critic points out that this figure covers detection only, and that windowing, motor spin-up and cue ramp are not included, so the "about a second" claim is untested end to end.
- **Classification of components.** The reviewer marks components 5 and 6 as critical; the critic's brief listed them as non-critical. The ratings above follow the reviewer's classification. This does not change the overall difficulty, which is set by component 3.

## Evidence gaps

- **Component 3 (pre-freeze prediction):** one B-grade paper, no code, 7 participants who froze. Confidence medium.
- **Component 6 (ethics and testing):** No evidence found on ethics or approval timelines. Low confidence on that point.
- **Component 4:** no ankle-specific vibration perception data in PD; the threshold study is healthy participants at the heel; no motor current figures.
- **Component 5:** battery evidence is one lab estimate (Wi-Fi, external processing). No BLE or on-device ML power data. CUE1+ is grade C.
- **Component 2:** no open-source FoG firmware for small MCUs found; the MCU paper has no code link.
- `raw/` holds only its README, so no team material is cited.
