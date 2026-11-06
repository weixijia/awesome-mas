---
name: awesome-mas
description: One drawing sheet. A cut-away 30° axonometric of the student's team as an office, with a title-block sidebar.
colors:
  sheet: "#F3F4F1"
  paper: "#FAFBF9"
  white: "#FFFFFF"
  ink: "#1B1F23"
  ink-2: "#4A5259"
  hair: "#B9C0C6"
  slab: "#DCE0DB"
  wall: "#3A4148"
  floor-plain: "#ECEEEA"
  verm: "#E04E2A"
  verm-ink: "#B53A1C"
  verm-t: "#F4C2B1"
  cobalt: "#2B57B5"
  cobalt-t: "#BDCBEA"
  ochre: "#D89A12"
  ochre-t: "#F3DCA6"
  sage: "#5E8C57"
  sage-t: "#CFE0C9"
  plum: "#8E4C8A"
  plum-t: "#E3CBE1"
  teal: "#1F8A84"
  teal-t: "#BFE0DC"
  lead-floor: "#E3E6E1"
  screen-off: "#2B3036"
typography:
  status:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif"
    fontSize: "clamp(28px, 2.6vw + 6px, 44px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: "Archivo, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
  annotation-name:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "20px"
    fontVariation: "'wdth' 88"
  cell-label:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.08em"
  room-label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 88"
  number:
    fontFamily: "Red Hat Mono, ui-monospace, PingFang SC, Microsoft YaHei, monospace"
    fontSize: "13px"
    fontWeight: 500
    fontFeature: "tnum"
rounded:
  none: "0px"
  control: "2px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  stage-x: "32px"
  rule-h: "64px"
components:
  state-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 5px"
  state-chip-flagged:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.ink}"
  state-chip-done:
    backgroundColor: "{colors.sage-t}"
    textColor: "{colors.ink}"
  state-chip-handoff:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  req-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.number}"
    padding: "0 5px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "32px"
  button-outline-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  title-block-cell:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    padding: "9px 14px 11px"
---

<!-- Recorded from the shipped build on branch redesign/office-world (office/, docs/, examples/). Replaces the pre-redesign record of the cream/coral Marvis-style flat office panel. -->

# Design System: awesome-mas

## Overview

**Creative North Star: "The Drawing Sheet"**

The panel is one architectural drawing sheet. A cut-away 30° axonometric of the office fills the stage: rooms are groups, scale figures are agents, leader-line annotations say what each is doing. The right column is the sheet's title block: ruled cells and hairlines, never cards. Docs and examples inherit the sheet: a hairline top rule, ink-ruled grids, and a four-cell title block at the foot.

One black ink does line and type. Colour appears only as flat fills on rooms, figures and status chips. Depth comes from overlapping flat planes and line weight, with no gradients, glows or shadows. Above the drawing sits one large status sentence; everything else is quieter.

**Key Characteristics:**
- Cool drafting-paper ground, one ink, flat group fills.
- Axonometric drawn at true pixel scale and re-laid out on resize, so text never shrinks below its set size.
- Every number in tabular mono; all other text in Archivo.
- Select one thread, dim the rest.
- Motion is small, eased out, and only ever means something; after-work life is the one sanctioned ambient loop.

## Colors

A cool neutral sheet, a near-black ink, and four primary group fills (vermilion, cobalt, ochre, sage) extended by plum and teal. Each group fill has a strong and a tint value.

### Primary
- **Vermilion** (verm): the single accent. Used for the focus ring, caret, link underlines, the selected figure's head outline, the selected leader line, and the sidebar "news" marker. It is never used for text: it reaches only 3.59:1 on the sheet.
- **Vermilion Ink** (verm-ink): vermilion as text. Used for the current step and the Result heading (5.3:1 on the sheet).
- **Vermilion Tint** (verm-t): text selection, and the floor of group A.

### Group fills (strong / tint pairs, assigned by group index, cycling)
- A **verm / verm-t**, B **cobalt / cobalt-t**, C **ochre / ochre-t**, D **sage / sage-t**, E **plum / plum-t**, F **teal / teal-t**.
- The tint fills the room floor and the chair. The strong value is the figure's torso front. Its top face is mixed 25% toward white and its side face 22% toward ink.
- The Lead uses **ink / lead-floor**, with an ink-2 torso top.
- Ochre and sage also carry state: ochre marks flagged (chip fill, the warn triangle, the alert screen) and sage marks done (the tick, the done chip border, the done progress bar). The tints mark evidence grades A to C (sage-t, cobalt-t, ochre-t), with grade D on paper.

### Neutral
- **Sheet** (sheet): the page and sidebar ground.
- **Paper** (paper): raised panes, such as the requirement chips, docs panels, button hover and screen backgrounds.
- **White** (white): desk tops, the task board, and paper sheets in the drawing.
- **Ink** (ink): all line and primary text, filled buttons, and the wall caps.
- **Ink 2** (ink-2): secondary text and dashed routes (7.2:1 on the sheet).
- **Hairline** (hair): cell dividers, progress-bar tracks, idle and waiting chip borders, and subline separators. It is never used for readable text.
- **Slab** (slab) and **Wall** (wall): the building slab top, which is also the halo behind room labels, and the wall faces.
- **Plain floor** (floor-plain): the lounge floor.

### Dark mode
Follows the system (`prefers-color-scheme`). The CSS variables swap to a dark sheet (`#1C1F22`), dark paper and light ink. The drawing's own colours go through `tone()` in office.js, so no second palette is kept by hand:
- neutral surfaces become one cool dark grey, keeping their light-to-dark order (lit top faces stay lightest);
- ink lines and wall caps become light;
- pale tints (room floors, chairs) become deep tints of the same hue;
- strong group colours stay, with cobalt, sage and plum lifted slightly for contrast;
- skin, hair and the fridge light never change.

### Named Rules
**The One Ink Rule.** Line and type are ink or ink-2. Colour exists only as flat fills.
**The Vermilion-Ink Rule.** Vermilion fills and strokes; verm-ink writes.

## Typography

**Display/Body Font:** Archivo variable (wght 100–900, wdth 62–125), self-hosted woff2 in latin and latin-ext subsets.
**CJK fallback:** PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, then sans-serif.
**Mono:** Red Hat Mono 400/500, self-hosted. It falls back to ui-monospace, then PingFang SC and Microsoft YaHei, so CJK digits and labels inside numeric strings still render.

**Character:** A drafting grotesk. Names and labels are narrowed with `font-stretch` 88–92%. Large text is tracked tight (-0.02 to -0.035em).

### Hierarchy
- **Status sentence** (600, clamp 28–44px, 1.05, max 30ch, balanced): one per panel, at the top of the stage. It is `aria-live="polite"`.
- **Docs H1** (600, clamp(34px, 4.6vw, 60px), 1.02, -0.035em) and **Examples H1** (600, clamp(32px, 4.2vw, 52px)): page titles on Read surfaces.
- **Title** (600, 24px): role card name. The result title is 20px.
- **Body** (400, 16px/1.5): the base size. Sidebar content runs at 15px and the activity feed at 14px.
- **Annotation** (name 600 15px at wdth 88; say line 14px/19px ink-2, clamped to 2 lines).
- **Cell label** (600, 13px, 0.08em, uppercase): only for naming a ruled title-block cell or table header (Task, Team, Activity, Result). A cell's count beside it reverts to mono with no case change.
- **Title-block key/value** (12px ink-2 / 15px 600).
- **Mono** (500, 13px, tabular): every number. That covers step numbers (01–04), elapsed time, percentages, requirement IDs (R1), evidence grades, run numbers and timestamps. Weight 400 is for `code` and file paths.

### Named Rules
**The Tabular Number Rule.** Any figure that counts, times or identifies is set in Red Hat Mono with tabular-nums. Archivo never sets a number on its own.
**The Floor Rule.** Text inside the drawing is never smaller than 12px (requirement IDs and markers are 12px mono, room labels 13px). This holds because the drawing is laid out at true pixel scale and never scaled down with a CSS transform.

## Layout

- **Panel grid:** a 64px top rule (56px and sticky at ≤600px) over a two-column sheet: `minmax(0,1fr)` stage plus `--side` = clamp(340px, 32vw, 460px). When a result is ready (`body.wide-side`, >1100px only), the side widens to clamp(460px, 45vw, 680px). The column change animates over .35s.
- **Stage padding** is 26px 32px 12px, or 20px 16px at ≤760px. Cell padding is 18px 22px 20px. Spacing steps observed: 6, 10, 14, 18, 22, 32px.
- **Breakpoints:**
  - ≤1100px: the title block becomes a fixed overlay sliding in from the right, and inactive step labels hide.
  - ≤760px: the mode note hides and the freshness stamp drops under the status.
  - ≤600px: one scrolling column with the sidebar stacked below.
  - Docs: 900px and 600px. Examples: 900px.
- **Read surfaces** use a max-width 1180px sheet with 16px gutters, and grids ruled by ink borders on the top and left of the grid plus the right and bottom of each cell.

### Axonometric drawing rules (office.js / model.js)
- **Projection:** 30° axonometric. Screen = O + ((x−y)·cos30°·U, (x+y)·0.5·U − z·U). Plan units are roughly metres. Walls are 1.25 high and stand on the back and left edges only (cut-away). The slab is 0.3 deep with a lip of 0.12–0.15.
- **Scale U (px per unit):**
  - Fitted downward from min(70, height fit, width fit after reserving 2 × 0.55 × label width), shrinking ×0.94 per try for up to 14 tries, with a floor of 20.
  - Label width is 214px when the host is wider than 1000px and 190px otherwise. Label height is 92px.
  - **List mode** applies when the host is narrower than 620px, when no label layout fits, or when U < 32 while list mode could draw larger. In list mode U = min(48, width fit). Leaders are dropped, and annotations become a numbered grid (`minmax(260px,1fr)`, 24px column gap). Each figure carries an 18px ink square marker numbered in 12px white mono.
- **Figure size:** about 2.15U tall (head centre at 1.68U, head radius 0.17U, torso 0.4 × 0.28 × 0.66U, legs 0.84U). At the U cap of 70, figures reach roughly 150px. Badges are max(14px, 0.32U) squares.
- **Draw order:** layers are slab → walls (with the task board and requirement notes) → floors → routes → things → labels. Inside "things", every desk, chair, bench and figure is depth-sorted by x+y and re-sorted as figures move. Chairs are split from desks so a seated figure overlaps the desk correctly.
- **Room labels on the slab lip:** each group room is lettered on the lip, never on the floor where furniture stands. The label sits 15px below the lip edge and is rotated +30° along the front edge. Front-row rooms go under their own floor, and rooms further back queue after them with 0.45 unit gaps. Overflow continues up the right lip at -30°. Labels carry a 5px slab-coloured halo. The text reads "A · in parallel", "A · first", or "B · after A".
- **Leaders:**
  - Each leader starts at the role's desk (the desk-top centre, or its front-left or back-right top corner), never at the moving person.
  - Annotations sit in a left and a right margin. The side follows the anchor's x relative to the drawing centre, and labels keep their anchors' vertical order.
  - Labels have a 10px gap to the drawing (the hull of slab, walls and heads, padded 10px) and an 8px margin to the sheet edge, and sit at least 20px from their anchor.
  - Slots are scored to keep leaders off other roles' desks and figures. Labels can move to the other margin when that removes hits, and crossing leaders swap slots.
  - Leaders are 1px ink with a 2.5px dot at the desk end.

## Elevation & Depth

Flat. There is no `box-shadow`, gradient, blur or glow anywhere. Depth in the drawing comes from three-face boxes (top, left and right faces in fixed tonal steps) and overlap order. Depth in the UI comes from rules: 1px ink for structure, 1px hair for subdivision, and a 2px ink top border on the title block.

### Line weights
- 2px: section cuts, meaning the slab outline and wall caps.
- 1.25px: objects, meaning furniture, wall faces and figures.
- 1px: leaders and UI rules.
- 0.8px: requirement notes and paper sheets.
- 0.75px: floor outlines and idle routes, which are dashed 5/4 at 0.55 opacity.

### Named Rules
**The Flat Plane Rule.** Depth is overlap plus line weight, never a shadow.

## Shapes

Square by default. The only radius is 2px on buttons and notes. Chips, swatches, markers, badges and title-block cells are square-cornered, with 1px borders. Status icons are drawn SVG shapes: an ochre warn triangle and a sage tick square, both outlined in ink. Directional UI icons are 16px inline SVG strokes.

## Components

### Status sentence and subline
There is one sentence for the whole sheet (`M.headline`). Priority order: flagged, then hand-off, then two or more working ("X and Y are searching at the same time."), then one working, then the Lead, then done or waiting. The subline is 16px ink-2 with hair-coloured separators: group, n of N working, mono elapsed, and an honest mode note.

### Annotation (leader note)
This is a button. Rows: name; say line (two lines, or the flag text when flagged; "In the lounge" when idle); a meta row with icon, state chip and mono "%" and time; and a 3px progress bar on a hair track (the bar is ink, or sage when done). Hover and selected states underline the name in vermilion.

### State chips
These are 13px, 600 weight, wdth 88, with a 0 5px pad, a 1px border and an 18px line height.
- **idle / waiting:** hair border.
- **working:** ink border.
- **flagged:** ochre fill with an ink border.
- **done:** sage-t fill with a sage border.
- **handoff:** ink fill with paper text.
- **draft:** dashed ink border.

### Figure states (CSS pose classes)
- **idle:** walks to the lounge (bench to sit, counter to stand).
- **waiting:** standing at the desk with a screensaver on the monitor.
- **working:** seated with arms typing (.36s alternate). Every 8–16s the figure pauses to think for 1.5s with the head tilted -12°. The monitor shows search, check, sheet, write, plan or type, inferred from the `say` text.
- **handoff:** stands, carries a white sheet along the dashed route to the receiver's visit spot, then a paper lands on that desk's stack (up to 4 sheets). The route marches while the hand-off runs.
- **flagged:** stands with the right arm raised and nudges twice. The monitor shows the alert screen and an ochre warn badge sits above the head.
- **done:** seated, leaning back 7°, with a sage tick badge. After 1.5–2.5s the figure stands, stretches (both arms up) and goes into after-work life (see Motion).

### Draft blueprint and print-order build-up
- **Draft blueprint (team not locked):** slab, floors, walls, furniture and figures are drawn as dashed 4/3 ink outlines with no fill. Screens and routes are hidden. Only the Lead's desk is inked. Chips read "draft".
- **Print-order build-up (draft to live, or first entrance):** fills ink in floors first (.7s), then furniture (+.55s). Figures enter from the door, each starting 900ms + 420ms × index after the previous step. Task-board notes pin in, staggered by 80ms.

### Isolate and dim (signature interaction)
- Selecting a figure, annotation, team row or feed line isolates its thread: its figure, desk, room floor and label, its hand-off route, the receiving desk, its leader (vermilion, 1.5px), and the requirement chips it serves.
- Everything else drops to 0.25 opacity as a flat tint with no blur, over .3s. The sidebar opens the role card.
- Selecting the same thread again, clicking empty drawing, or pressing Escape clears the selection.

### Title-block sidebar
- Ruled cells, top to bottom: role card (when selected) or Result (when ready); Task (summary and requirement chips with "who" swatches); Team (an org list by group with 10px colour swatches, state chips and a cost line under a 1px ink rule); and Activity (a 48px mono timestamp column).
- The foot is a 2 × 2 title block with a 2px ink top rule and 1px ink internal rules: Project, Team (v1 · locked), Mode, Run (01 · in progress).
- **Result-wide variant:** while a result is shown, the column widens (see Layout). The result renders as markdown at 15px, with tables ruled ink on top and bottom and hair on the sides, and cells at least 5em wide. Sources carry evidence-grade squares (A to D).

### Buttons
- **Outline** (sb-toggle, replay): 30–32px tall, 1px ink border, 2px radius, 14px 600. Hover fills with paper. The active sidebar toggle is filled ink.
- **Primary** (docs and examples): ink fill, paper text, 44px minimum height. Hover uses #2E343A.
- **Docs tabs:** ink-ruled, with the selected tab in ink fill.

## Motion

Work motion eases out and never loops for decoration. The one sanctioned ambient loop is after-work life: only for figures whose work is done, slow (one action per 8–16 s), paused when hidden or offscreen, static under reduced motion. The wrap party is a one-shot per run.

- **Work motion:** figures walk along the axo grid (x then y legs) with a 160ms anticipation lean, a two-frame step and a 220ms settle; poses ease out (`cubic-bezier(.16, 1, .3, 1)`). One rAF loop runs only while something moves, and stops while the tab is hidden or the drawing is off screen (IntersectionObserver); CSS animations pause with it.
- **After-work life (done figures only):** the lounge holds a sofa (2–3 seats, seated lean-back, optional cup), a coffee counter (queue of 2, cup in hand with a slow sip every 7s), a table-tennis table (two players with bats; a ball crosses end to end on an arc every 1.2s, seven hits, a pause, then a re-serve), a standing chat pair (facing each other; a hairline three-dot bubble alternates between them every 2–4s with a head tilt, always on the speaker's outer side so it never covers the partner) and a high party table with snack blocks. Every spot is placed so that no two head-and-chest boxes overlap on screen, whichever spots are occupied (tested for 1–8 roles). Once three or more are done the sofa fills first and a seated figure stays seated. In the lounge and at the party the head tick is hidden (being there already says done); it stays at the desk. Each figure picks a free station every 8–16s, seeded per figure and run so choices are stable across re-renders; a station is never double-booked. While anyone still works, finished figures stay quiet: coffee first, then the sofa. Nobody plays while working, waiting, flagged or handing off. Overflow stands in a ring round the party table.
- **Wrap party (one-shot, per run):** when every figure is done and the result is ready, everyone (Lead included) walks to a front-first arc round the party table, spaced so nobody hides behind anyone, and cheers twice; bunting in the group colours is drawn along the lounge's back wall (ink line via stroke-dashoffset, then the flags drop in), and one burst of flat paper chips falls and lands on the floor. Bunting and confetti stay as static parts of the drawing. After ~9.5s figures disperse, pairs first. It plays only when the finish is seen live; reopening a finished run draws the decorations statically. A new run, or a demo replay, can party again.
- **Lounge options (off by default; `MASOffice.create(host, { kitchen, deskRest })`, or `?kitchen=1` / `?deskRest=1` on the panel):** `kitchen` widens the lounge (8.4 units) and adds a kitchen corner along the back wall (coffee counter, a counter with a microwave whose window glows while someone heats lunch, a fridge whose door opens with the light on), a round table with four chairs people sit at, a water cooler that bubbles while used, potted plants (also one per work room) and a wall clock showing the real time. People stand beside an appliance, never in front of it, so it stays visible. `deskRest` keeps finished figures mostly at their own desk, sitting without typing; every 15–40 s there is a one-in-three chance of a 15–35 s break at a lounge station, then they walk back.
- **Re-planning:** when the team changes (a role added or removed during refine), desks are re-planned and every figure walks to its new place, so nobody is left standing at a desk that now belongs to someone else.
- **Reduced motion:** no walking, ball, confetti fall or bunting draw; figures are placed straight at their stations in static poses (cup in hand, seated, one chat bubble), and the decorations are drawn finished. State labels are unchanged.

## Do's and Don'ts

### Do:
- **Do** write one status sentence, in sentence case, ending with a full stop.
- **Do** keep the sheet's copy free of em-dash headlines. Use "·" as the separator in labels ("A · in parallel", "v1 · locked").
- **Do** keep role emoji in the data but never render them as role icons on the sheet; role names render in one ink. Result and work text written by agents is rendered as written (including any emoji in it), because it is content, not chrome.
- **Do** set every number in tabular Red Hat Mono.
- **Do** honour `prefers-reduced-motion`: all animations and transitions are off, figures jump straight to their spots, hand-offs only add the paper, and done figures stay seated.
- **Do** use the 2px vermilion `:focus-visible` outline at a 2px offset. Annotations, team rows and tabs are real buttons, and docs tabs support arrows, Home and End.
- **Do** keep text pairs at AA or better:
  - ink on sheet: 15.0:1.
  - ink-2 on sheet: 7.2:1.
  - verm-ink on sheet: 5.3:1.
  - ink on ochre: 6.75:1.
  - ink on sage-t: 12.0:1.
  - paper on ink: 16.0:1.

### Don't:
- **Don't** use cream or warm paper grounds. The sheet is cool (sheet and paper).
- **Don't** use glows, drop shadows, gradients or blur, including for the dim state.
- **Don't** add pulsing status dots or decorative loops. Repeating motion is allowed only when it shows work (typing, monitor content, the marching route during a hand-off) or as after-work life for figures whose work is done (see Motion).
- **Don't** use marquees or ticker text.
- **Don't** use glyph or emoji icons. Icons are drawn SVG.
- **Don't** set vermilion text on the sheet (3.59:1). Use verm-ink.
- **Don't** shrink the drawing with CSS transforms. Re-lay it out at true scale, or fall back to list mode.
- **Don't** put kicker or eyebrow lines above headlines. Uppercase tracking is only for labelling a ruled cell or table header.
