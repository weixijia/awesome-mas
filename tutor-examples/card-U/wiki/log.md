# Activity log

Append-only. Newest entries at the bottom. Format:

```
## [YYYY-MM-DD] <onboard | research | feasibility | panel | other> | <subject>
- what was done, which files were written
```

<!-- Entries are added below this line. -->

## [2026-11-04] onboard | StepCue (sample project)
- Copied the sample project into `project/brief.md`, `project/team.md`, `project/constraints.md`.

## [2026-11-04] research | detecting freezing of gait in real time with a small wearable motion sensor
- Two researchers: (1) detection algorithms and sensor placement, (2) products, code and datasets. 6 cards filed in `wiki/sources/`, 2 of them for the same paper (PMC11505507).
- Gaps: no pre-onset prediction source, no wrist-worn real-time source, no open-source repo or commercial product page fetched.

## [2026-11-04] research | pre-FoG prediction and low-power wearable hardware (evidence gap fill for /feasibility)
- One researcher run, 3 cards in `wiki/sources/`: early-fog-detection-imu-plantar-pressure, parcur-ankle-cueing-wearable, cue2walk-user-experiences. Index updated.
- Gaps: no BLE power budget, no IMU-only pre-FoG evidence.

## [2026-11-04] feasibility | StepCue
- `feasibility-reviewer` and `sparring-critic` ran in parallel. Wrote `reviews/2026-11-04-stepcue.md`.
- Verdict: Research-grade · overall difficulty 5, driven by anticipating a freeze before onset.

## [2026-11-04] research | small vibration motors for rhythmic cueing in a wearable ankle band
- Two researchers: (1) evidence, (2) build and real world. 6 cards filed in `wiki/sources/`: good-vibrations-tactile-cueing-fog, vibrotactile-location-perception-pd, vpt-contact-force-frequency, ti-drv2605l-haptic-driver, adafruit-drv2605-arduino-library, cue1plus-parkinsons-uk-tech-guide. No duplicates. Index updated.
- Gaps: no motor part numbers or datasheets (ERM/LRA), no ERM vs LRA study at ankle/shank, no ankle-band strap build, no patents, no measured motor power draw.

## [2026-11-04] panel | regenerated panel/index.html
- Read 3 agents, 15 source cards, 5 log entries and 2026-11-04-stepcue.md.

## [2026-11-05] onboard | StepCue (sample project, card U)
- Sample project loaded (same as typing `sample` in /onboard).

## [2026-11-05] insights | stepcue-fog-notes
- Ran insight-coder, then evidence-sceptic on 3 notes in raw/.
- Output: [2026-11-05-insights-stepcue-fog-notes.md](../outputs/2026-11-05-insights-stepcue-fog-notes.md)
