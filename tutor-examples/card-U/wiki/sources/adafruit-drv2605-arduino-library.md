---
title: Adafruit DRV2605L Haptic Controller Breakout - Arduino Code
url: https://learn.adafruit.com/adafruit-drv2605-haptic-controller-breakout/arduino-code
type: repo
evidence_grade: A
accessed: 2026-11-04
topics: [haptic driver IC, DRV2605L, Arduino, maker build]
---

# Adafruit DRV2605L Haptic Controller Breakout - Arduino Code

**What it is:** Adafruit's tutorial page and open-source Arduino library for the DRV2605L breakout board, with runnable examples (basic, complex, audio).

**Key excerpt** (verbatim from the page):
> 123 built-in vibration effects

**What it shows works:** An I2C microcontroller can play built-in effects, or chain up to 7 effects in a sequence using `setWaveform` and `go()`. Examples run from the Arduino Library Manager.

**Relevance to this project:** Informs prototyping a patterned (rhythmic) vibration cue from a microcontroller with off-the-shelf parts.

**Limitations:** The fetched page does not cover ERM vs LRA selection (a search summary said Adafruit tested only its ERM pancake motor; that was not confirmed on the fetched page). No wearable or gait context. Sequences are limited to 7 effects.
