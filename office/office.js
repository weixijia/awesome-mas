/* awesome-mas · the drawing: a cut-away 30° axonometric of the team's office (read-only).
   window.MASOffice.create(host, { onSelect, kitchen, deskRest, roamLead, maxUnit }) → { setData, setSelected, relayout }
   Drawn at true pixel scale and re-laid out on resize, so text never shrinks below its set size. */
(function () {
  'use strict';
  const M = window.MASModel;
  const NS = 'http://www.w3.org/2000/svg';
  const C = Math.cos(Math.PI / 6);
  const GROUP = [['#E04E2A', '#F4C2B1'], ['#2B57B5', '#BDCBEA'], ['#D89A12', '#F3DCA6'], ['#5E8C57', '#CFE0C9'], ['#8E4C8A', '#E3CBE1'], ['#1F8A84', '#BFE0DC']];
  const LEAD = ['#1B1F23', '#E3E6E1'];
  const SKIN = ['#F2D3BC', '#E5B795', '#C98D63', '#9C6A47', '#6E4A33'];
  const HAIR = ['#1B1F23', '#4A3426', '#7A4B2A', '#33302E', '#A8783A'];
  const BUSY = ['working', 'flagged', 'handoff'];
  const SPEED = 2.4; // plan units per second
  const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const esc = M.esc;
  const mix = (hex, to, f) => {
    const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
    const c = [16, 8, 0].map((s) => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  /* Dark mode (follows the system). Surfaces go dark but keep their light-to-dark order, so the lit top faces stay
     lightest; ink lines go light, pale room tints go deep, strong colours stay. Skin, hair, plants and the fridge light never change. */
  const DARK = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const DARK_FIX = { '#3A4148': '#5A636C', '#2B3036': '#3E454C', '#E3E6E1': '#3A4046', '#2B57B5': '#4D78D4', '#5E8C57': '#6FA067', '#8E4C8A': '#A866A3' };
  const toneCache = {};
  function tone(hex) {
    if (!DARK || typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return hex;
    const key = hex.toUpperCase();
    if (DARK_FIX[key]) return DARK_FIX[key];
    if (toneCache[key]) return toneCache[key];
    const n = parseInt(key.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), L = (mx + mn) / 2, d = mx - mn;
    let S = d === 0 ? 0 : d / (1 - Math.abs(2 * L - 1)), H = 0;
    if (d) H = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    let L2 = L;
    if (S < 0.2) { L2 = L >= 0.5 ? 0.15 + 0.15 * (L - 0.5) / 0.5 : 0.86 - 0.5 * L; H = 3.5; S = 0.07; } // surfaces dark (order kept) · ink light · one cool grey
    else if (L > 0.68) { L2 = 0.27; S *= 0.55; }                                    // pale tints → deep tints
    const C = (1 - Math.abs(2 * L2 - 1)) * S, X = C * (1 - Math.abs(H % 2 - 1)), m = L2 - C / 2;
    const [r1, g1, b1] = H < 1 ? [C, X, 0] : H < 2 ? [X, C, 0] : H < 3 ? [0, C, X] : H < 4 ? [0, X, C] : H < 5 ? [X, 0, C] : [C, 0, X];
    return (toneCache[key] = '#' + [r1, g1, b1].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase());
  }
  const toneAll = (str) => (DARK ? String(str).replace(/#[0-9a-f]{6}\b/gi, tone) : str);
  const KEEP = /(^|\s)(skull|hair|fr-light|leaf|stem)(\s|$)/; // skin, hair, plants and the fridge light look the same in both modes
  function svg(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    const keep = DARK && KEEP.test(attrs.class || '');
    for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, !keep && (k === 'fill' || k === 'stroke' || k === 'stop-color') ? tone(attrs[k]) : attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const pts = (list) => list.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const colorsFor = (plan, id) => {
    if (id === 'lead') return LEAD;
    const d = plan.desks[id];
    return GROUP[(d && d.index >= 0 ? d.index : 0) % GROUP.length];
  };
  const ICON = {
    warn: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.2 14.6 13.6H1.4Z" fill="#D89A12" stroke="#1B1F23" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 6.4v3.4M8 11.4v.4" stroke="#1B1F23" stroke-width="1.4" stroke-linecap="round"/></svg>',
    tick: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" fill="#5E8C57" stroke="#1B1F23" stroke-width="1.2"/><path d="M4.6 8.2 7 10.6l4.4-5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="square"/></svg>'
  };

  /* ---------- screen content (drawn in a 100×60 box, skewed onto the monitor face) ---------- */
  const SCREEN = {
    search: '<rect width="100" height="60" fill="#FAFBF9"/><rect x="8" y="6" width="84" height="9" fill="#fff" stroke="#1B1F23" stroke-width="1.2"/><g class="sc-scroll">' +
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => '<rect x="10" y="' + (22 + i * 9) + '" width="' + (46 + (i * 17) % 30) + '" height="3" fill="#2B57B5"/><rect x="10" y="' + (27 + i * 9) + '" width="70" height="2" fill="#B9C0C6"/>').join('') + '</g>',
    check: '<rect width="100" height="60" fill="#FAFBF9"/>' + [0, 1, 2, 3].map((i) => '<rect x="10" y="' + (8 + i * 13) + '" width="8" height="8" fill="#fff" stroke="#1B1F23" stroke-width="1.2"/><path class="sc-tick" style="animation-delay:' + i * 0.7 + 's" d="M11.5 ' + (12 + i * 13) + 'l2 2.4 3.6-4.6" fill="none" stroke="#5E8C57" stroke-width="2"/><rect x="24" y="' + (10 + i * 13) + '" width="' + (60 - i * 7) + '" height="3" fill="#B9C0C6"/>').join(''),
    sheet: '<rect width="100" height="60" fill="#FAFBF9"/><path d="M6 6H94V54H6ZM6 16H94M6 26H94M6 36H94M6 46H94M38 6V54M66 6V54" fill="none" stroke="#B9C0C6" stroke-width="1"/>' +
      [0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => '<rect class="sc-num" x="' + (10 + c * 29) + '" y="' + (9 + r * 10) + '" width="' + (8 + ((r + c) * 7) % 16) + '" height="4" fill="' + (r === 4 ? '#5E8C57' : '#1B1F23') + '"/>').join('')).join(''),
    write: '<rect width="100" height="60" fill="#FAFBF9"/>' + [0, 1, 2, 3, 4].map((i) => '<rect class="sc-line" style="animation-delay:' + i * 0.6 + 's" x="12" y="' + (9 + i * 9) + '" width="' + [72, 66, 76, 58, 40][i] + '" height="3" fill="#4A5259"/>').join(''),
    type: '<rect width="100" height="60" fill="#FAFBF9"/><rect x="12" y="10" width="70" height="3" fill="#4A5259"/><rect x="12" y="19" width="62" height="3" fill="#4A5259"/><rect class="sc-typing" x="12" y="28" width="50" height="3" fill="#4A5259"/><rect class="sc-caret" x="63" y="26" width="1.6" height="7" fill="#E04E2A"/>',
    plan: '<rect width="100" height="60" fill="#FAFBF9"/><path d="M6 8H94V54H6ZM28 8V54M50 8V54M72 8V54M6 23H94M6 38H94" fill="none" stroke="#B9C0C6" stroke-width="1"/>' +
      [[8, 25], [52, 10], [30, 40], [74, 25], [52, 40]].map((p, i) => '<rect class="sc-block" style="animation-delay:' + i * 0.5 + 's" x="' + p[0] + '" y="' + p[1] + '" width="18" height="11" fill="#BDCBEA" stroke="#2B57B5" stroke-width="1"/>').join(''),
    screensaver: '<rect width="100" height="60" fill="#B9C0C6"/><rect x="40" y="20" width="20" height="20" fill="none" stroke="#FAFBF9" stroke-width="2"/>',
    alert: '<rect width="100" height="60" fill="#D89A12"/><path d="M50 12 66 44H34Z" fill="#FAFBF9" stroke="#1B1F23" stroke-width="2" stroke-linejoin="round"/><path d="M50 24v9M50 37v2" stroke="#1B1F23" stroke-width="3"/>',
    send: '<rect width="100" height="60" fill="#FAFBF9"/><rect class="sc-sheet" x="16" y="20" width="18" height="22" fill="#fff" stroke="#1B1F23" stroke-width="1.2"/><path d="M44 31h36m-8-7 8 7-8 7" fill="none" stroke="#1B1F23" stroke-width="1.6"/>',
    done: '<rect width="100" height="60" fill="#CFE0C9"/><path d="M34 31l11 11 22-24" fill="none" stroke="#5E8C57" stroke-width="6"/>',
    off: '<rect width="100" height="60" fill="#2B3036"/>'
  };

  function create(host, opts) {
    const DESK_REST = !!(opts && opts.deskRest); // option: resting people mostly stay at their desk, with short lounge breaks
    const KITCHEN = !!(opts && opts.kitchen);    // option: a fuller lounge (kitchen corner, round table, water cooler, plants, clock)
    const ROAM = !!(opts && opts.roamLead);      // option: the Lead has no office and walks between the desks
    const MAX_U = (opts && opts.maxUnit) || 48;  // option: cap the drawing scale (px per plan unit), e.g. in a small window
    const root = document.createElement('div');
    root.className = 'drawing';
    const scene = svg('svg', { class: 'axo', role: 'img', 'aria-label': 'Axonometric drawing of the team office' });
    const lay = {};
    ['slab', 'walls', 'floors', 'routes', 'things', 'labels'].forEach((k) => { lay[k] = svg('g', { class: 'l-' + k }, scene); });
    const leaders = svg('svg', { class: 'leaders', 'aria-hidden': 'true' });
    const notes = document.createElement('div');
    notes.className = 'notes';
    const list = document.createElement('ol');
    list.className = 'notes-list';
    root.append(scene, leaders, notes);
    host.append(root, list);

    let plan = null, U = 40, O = [0, 0], mode = 'live', S = null, task = null, statuses = {}, timing = {}, selected = null;
    let figs = {}, deskEls = {}, docs = {}, noteEls = {}, labelPos = {}, listMode = false, sig = '', raf = 0, fallback = 0, last = 0, pulseN = 0, printNext = false;
    let lounge = null, runKey = null, party = { key: null, active: false }, decorKey = null, partyTimer = 0, ball = { el: null, t0: 0, on: false }, talkAt = 0;
    const P = (x, y, z) => [O[0] + (x - y) * C * U, O[1] + (x + y) * 0.5 * U - (z || 0) * U];
    const L = (x, y, z) => [(x - y) * C * U, (x + y) * 0.5 * U - (z || 0) * U];

    function box(parent, b, fills, cls) {
      const { x, y, w, d } = b, z = b.z || 0, h = b.h;
      const g = svg('g', { class: cls || 'box' }, parent);
      svg('polygon', { class: 'f-l', points: pts([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]), fill: fills[1] }, g);
      svg('polygon', { class: 'f-r', points: pts([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]), fill: fills[2] }, g);
      svg('polygon', { class: 'f-t', points: pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]), fill: fills[0] }, g);
      return g;
    }
    const floorPoly = (r, z) => pts([P(r.x0, r.y0, z), P(r.x1, r.y0, z), P(r.x1, r.y1, z), P(r.x0, r.y1, z)]);
    const roomOf = (id) => (plan.desks[id] ? plan.desks[id].room : 'lead');

    /* ----- fitting: biggest scale at which annotations fit beside the drawing ----- */
    function relayout() {
      if (!plan) return;
      const r = host.getBoundingClientRect();
      const width = Math.max(240, r.width);
      listMode = width < 620;
      const figTop = 2.15, wallTop = M.PLAN.WALL;
      const extent = (u) => ({ w: (plan.W + plan.D) * C * u, h: (plan.W + plan.D) * 0.5 * u + Math.max(figTop, wallTop) * u + 0.45 * u });
      let ok = false, res = null;
      if (!listMode) {
        const height = Math.max(320, r.height);
        const lw = width > 1000 ? 214 : 190, lh = 92;
        let u = Math.min(70, (height - 24) / (extent(1).h), (width - 2 * lw * 0.55) / extent(1).w); // small teams draw large (≤ ~130px people)
        for (let k = 0; k < 14 && u >= 20; k++, u *= 0.94) {
          place(u, width, height);
          res = M.layoutLabels(anchors(), { width, height, poly: hull(), lw, lh, boxes: M.roleBoxes(plan, members(), P, U), obstacles: roomLabels().map((l) => l.poly) });
          if (res.ok) { ok = true; break; }
        }
        // people drawn small beside the labels? a numbered list below lets the drawing itself grow
        // ...or when the margins force long leaders: drafting labels should sit close to what they name
        const listU = Math.min(MAX_U, (width - 24) / extent(1).w);
        const longest = ok ? Math.max(0, ...res.labels.map((l) => M.pathLength(l.path))) : 0;
        if (!ok || (U < 32 && listU > U) || listU >= U * 1.3 || (longest > height * 0.4 && listU >= U)) listMode = true;
        else { root.style.height = height + 'px'; sizeSvgs(width, height); }
      }
      if (listMode) {
        U = Math.min(MAX_U, (width - 24) / extent(1).w);
        const h = extent(U).h + 24;
        place(U, width, h);
        root.style.height = h + 'px';
        sizeSvgs(width, h);
        res = { labels: [] };
      }
      labelPos = {};
      res.labels.forEach((l) => { labelPos[l.id] = l; });
      root.classList.toggle('list-mode', listMode);
      draw();
    }
    function place(u, width, height) {
      U = u;
      const e = { x0: -plan.D * C * U, x1: plan.W * C * U, top: -Math.max(2.15, M.PLAN.WALL) * U, bottom: (plan.W + plan.D) * 0.5 * U + 0.45 * U };
      O = [(width - (e.x1 - e.x0)) / 2 - e.x0, 12 - e.top]; // top-aligned under the status sentence
    }
    function sizeSvgs(w, h) {
      [scene, leaders].forEach((s) => { s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); });
    }
    // Outline the labels must stay clear of: slab with its lip, wall caps and every head, padded by the label gap.
    function hull() {
      const W = plan.W, D = plan.D, wall = M.PLAN.WALL, q = [];
      [[-0.12, -0.12], [W + 0.15, -0.12], [W + 0.15, D + 0.15], [-0.12, D + 0.15]].forEach(([x, y]) => { q.push(P(x, y, -0.3)); q.push(P(x, y, wall + 0.05)); });
      members().forEach((id) => { const s = plan.desks[id].seat; q.push(P(s.x, s.y, 2.0)); });
      const h = M.convexHull(q), c = h.reduce((a, p) => [a[0] + p[0] / h.length, a[1] + p[1] / h.length], [0, 0]);
      return h.map((p) => { const dx = p[0] - c[0], dy = p[1] - c[1], k = Math.hypot(dx, dy) || 1; return [p[0] + (dx / k) * 10, p[1] + (dy / k) * 10]; });
    }
    function members() { return ['lead'].concat(((S && S.roles) || []).map((r) => r.id)).filter((id) => plan.desks[id]); }
    // Leaders start at the role's desk (fixed), never at the moving person: front-left or back-right top corner.
    function anchors() {
      return members().map((id) => {
        const d = plan.desks[id].desk, c = P(d.x + d.w / 2, d.y + d.d / 2, d.h);
        return { id, ax: c[0], ay: c[1], left: P(d.x, d.y + d.d, d.h), right: P(d.x + d.w, d.y, d.h) };
      });
    }

    /* ----- drawing ----- */
    function draw() {
      Object.values(lay).forEach((g) => { g.textContent = ''; });
      deskEls = {};
      const W = plan.W, D = plan.D, wall = M.PLAN.WALL;
      box(lay.slab, { x: -0.12, y: -0.12, z: -0.3, w: W + 0.27, d: D + 0.27, h: 0.3 }, ['#DCE0DB', '#C9CEC8', '#D3D7D1'], 'slab');
      box(lay.walls, { x: -0.12, y: -0.12, w: W + 0.12, d: 0.12, h: wall }, [DARK ? '#7D868E' : '#1B1F23', '#3A4148', '#3A4148'], 'wall');
      box(lay.walls, { x: -0.12, y: 0, w: 0.12, d: D, h: wall }, [DARK ? '#7D868E' : '#1B1F23', '#3A4148', DARK ? '#4B535B' : '#4A5259'], 'wall');
      if (mode !== 'empty') { // door: a gap in the left wall with a frame
        const dy = plan.door.y - 0.45;
        svg('polygon', { class: 'door', points: pts([P(0, dy, 0), P(0, dy + 0.9, 0), P(0, dy + 0.9, 1.0), P(0, dy, 1.0)]) }, lay.walls);
      }
      drawBoard();
      plan.rooms.forEach((r) => {
        const fill = r.kind === 'group' ? GROUP[r.index % GROUP.length][1] : r.kind === 'lead' ? LEAD[1] : '#ECEEEA';
        svg('polygon', { class: 'floor', points: floorPoly(r, 0), fill, 'data-room': r.id }, lay.floors);
      });
      letterRooms();
      if (plan.lounge) drawLounge();
      members().forEach((id) => drawDesk(id));
      drawRoutes();
      Object.values(figs).forEach((f) => buildFig(f));
      sortThings();
      drawNotes();
      Object.values(figs).forEach(placeFig);
      if (decorKey) drawDecor(false);
      ball.on = false; ballCheck();
      applySelection();
    }
    // Room names are lettered on the slab's lip (geometry in model.js); measured once per caption.
    let measureEl = null;
    const widths = {};
    function measure(text) {
      if (widths[text] == null) {
        if (!measureEl) measureEl = svg('text', { class: 'room-label', x: -999, y: -999, 'aria-hidden': 'true' }, scene);
        measureEl.textContent = text;
        const w = measureEl.getComputedTextLength ? measureEl.getComputedTextLength() : 0;
        if (!w) return text.length * 7.4; // not rendered yet: estimate, do not cache
        widths[text] = w;
      }
      return widths[text];
    }
    const roomLabels = () => M.letterRooms(plan, P, U, measure);
    function letterRooms() {
      roomLabels().forEach((l) => {
        const t = svg('text', { class: 'room-label', 'data-room': l.id, x: l.at[0].toFixed(1), y: l.at[1].toFixed(1), dy: 15,
          transform: 'rotate(' + l.angle + ' ' + l.at[0].toFixed(1) + ' ' + l.at[1].toFixed(1) + ')' }, lay.labels);
        t.textContent = l.text;
      });
    }
    function drawBoard() {
      // the task board hangs on the inner face of the left wall, beside the Lead (no Lead office when roaming: no board)
      if (ROAM) return;
      const reqs = ((task && task.requirements) || []).slice(0, 8);
      const y0 = 0.3, y1 = 2.55, z0 = 0.22, z1 = 1.14, x = 0.0;
      svg('polygon', { class: 'board', points: pts([P(x, y0, z0), P(x, y1, z0), P(x, y1, z1), P(x, y0, z1)]) }, lay.walls);
      const per = 4, nw = (y1 - y0 - 0.2) / per;
      reqs.forEach((r, i) => {
        const cy = y0 + 0.1 + (i % per) * nw, cz = z1 - 0.08 - Math.floor(i / per) * 0.42;
        const g = svg('g', { class: 'r-note', 'data-req': r.id, style: 'animation-delay:' + i * 0.08 + 's' }, lay.walls);
        svg('polygon', { points: pts([P(x, cy + 0.04, cz - 0.36), P(x, cy + nw - 0.04, cz - 0.36), P(x, cy + nw - 0.04, cz), P(x, cy + 0.04, cz)]), fill: '#FAFBF9' }, g);
        const c = P(x, cy + nw / 2, cz - 0.18);
        if (nw * U * C < 22) return; // too small to letter: the note alone carries the count
        const t = svg('text', { x: c[0], y: c[1] + 4, class: 'r-id' }, g);
        t.textContent = r.id;
      });
    }
    let clockEl = null;
    function tickClock() {
      if (!clockEl) return;
      const d = new Date(), mins = d.getMinutes() + d.getSeconds() / 60, hrs = (d.getHours() % 12) + mins / 60;
      const hand = (el, frac, len) => { const a = frac * Math.PI * 2; el.setAttribute('points', pts([P(clockEl.x, 0.006, clockEl.z), P(clockEl.x + Math.sin(a) * len, 0.006, clockEl.z + Math.cos(a) * len)])); };
      hand(clockEl.h, hrs / 12, clockEl.r * 0.55); hand(clockEl.m, mins / 60, clockEl.r * 0.85);
    }
    // Appliances react to whoever is using them.
    function tickKitchen() {
      const fr = lay.things.querySelector('.lounge-fridge'), mw = lay.things.querySelector('.lounge-kitchen');
      const at = (sid) => { const x = figAt(sid); return !!(x && x.arrived); };
      if (fr) fr.classList.toggle('open', at('fridge-0'));
      if (mw) mw.classList.toggle('on', at('micro-0'));
      const wc = lay.things.querySelector('.lounge-cooler');
      if (wc) wc.classList.toggle('on', at('water-0'));
    }
    function drawLounge() {
      clockEl = null;
      const fills = ['#FAFBF9', '#DCE0DB', '#C9CEC8'];
      ball.el = null;
      lounge.furniture.forEach((f) => {
        const g = svg('g', { class: 'furn lounge-' + f.kind, 'data-room': 'lounge' }, lay.things);
        g._depth = f.x + f.w / 2 + f.y + f.d / 2;
        if (f.kind === 'sofa') { // back, then seat; sits behind anyone sitting on it
          g._depth = f.x + f.y;
          box(g, { x: f.x, y: f.y, w: f.w, d: 0.16, h: 0.85 }, fills);
          box(g, { x: f.x, y: f.y + 0.14, w: f.w, d: f.d - 0.14, h: f.h }, fills);
        } else if (f.kind === 'counter') {
          box(g, f, fills);
          box(g, { x: f.x + 0.18, y: f.y + 0.1, z: f.h, w: 0.32, d: 0.3, h: 0.38 }, ['#4A5259', '#1B1F23', '#3A4148']);
          box(g, { x: f.x + 0.68, y: f.y + 0.18, z: f.h, w: 0.14, d: 0.14, h: 0.14 }, ['#FAFBF9', '#E04E2A', '#B23D20']);
        } else if (f.kind === 'party') { // a high table with a few snack blocks
          box(g, { x: f.x + f.w / 2 - 0.06, y: f.y + f.d / 2 - 0.06, w: 0.12, d: 0.12, h: f.h - 0.06 }, ['#3A4148', '#1B1F23', '#3A4148']);
          box(g, { x: f.x, y: f.y, z: f.h - 0.06, w: f.w, d: f.d, h: 0.06 }, fills);
          [[0.08, 0.1, 0], [0.32, 0.12, 1], [0.18, 0.36, 2]].forEach(([dx, dy, k]) => {
            const c = GROUP[k % GROUP.length];
            box(g, { x: f.x + dx, y: f.y + dy, z: f.h, w: 0.16, d: 0.12, h: 0.07 }, [c[1], c[0], mix(c[0], '#1B1F23', 0.22)]);
          });
        } else if (f.kind === 'fridge') { // white fridge: freezer line, handles, magnets; the door swings open while someone is there
          const front = f.y + f.d, zs = f.h * 0.64;
          box(g, f, ['#FAFBF9', '#E4E7E2', '#CDD2CB']);
          svg('polygon', { class: 'inside fr-light', points: pts([P(f.x + 0.05, front, 0.06), P(f.x + f.w - 0.05, front, 0.06), P(f.x + f.w - 0.05, front, zs - 0.04), P(f.x + 0.05, front, zs - 0.04)]), fill: '#FFF3C4' }, g);
          [0.25, 0.45].forEach((zz) => svg('polygon', { class: 'inside', points: pts([P(f.x + 0.05, front - 0.3, zz), P(f.x + f.w - 0.05, front - 0.3, zz), P(f.x + f.w - 0.05, front, zz), P(f.x + 0.05, front, zz)]), fill: '#E4E7E2' }, g));
          svg('polyline', { class: 'fr-line', points: pts([P(f.x, front, zs), P(f.x + f.w, front, zs)]), fill: 'none', stroke: '#1B1F23' }, g);
          [[zs + 0.08, zs + 0.3], [zs - 0.32, zs - 0.08]].forEach(([a, b]) => svg('polyline', { class: 'fr-handle', points: pts([P(f.x + 0.08, front + 0.01, a), P(f.x + 0.08, front + 0.01, b)]), fill: 'none', stroke: '#1B1F23', 'stroke-width': 2.2 }, g));
          [[0.3, zs + 0.18, 0], [0.42, zs + 0.3, 1], [0.34, zs - 0.22, 2], [0.48, zs - 0.12, 3]].forEach(([dx, zz, k]) => svg('polygon', { class: 'magnet',
            points: pts([P(f.x + dx, front + 0.01, zz), P(f.x + dx + 0.08, front + 0.01, zz), P(f.x + dx + 0.08, front + 0.01, zz + 0.07), P(f.x + dx, front + 0.01, zz + 0.07)]), fill: GROUP[k % GROUP.length][0] }, g));
          svg('polygon', { class: 'door-open', points: pts([P(f.x + f.w, front, 0.02), P(f.x + f.w, front + f.w * 0.92, 0.02), P(f.x + f.w, front + f.w * 0.92, zs - 0.02), P(f.x + f.w, front, zs - 0.02)]), fill: '#E4E7E2' }, g);
        } else if (f.kind === 'roundtable') { // pedestal table: base disc, column, round top with a front edge; chairs drawn on their own
          const R = f.r, cx = f.x + R, cy = f.y + R, top = f.h, th = 0.06;
          const arc = (r, z, a0, a1, n) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + ((a1 - a0) * k) / n; return P(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z); });
          svg('polygon', { class: 'rt-base', points: pts(arc(0.26, 0.01, 0, Math.PI * 2, 24)), fill: '#3A4148' }, g);
          box(g, { x: cx - 0.05, y: cy - 0.05, w: 0.1, d: 0.1, h: top - th }, ['#3A4148', '#1B1F23', '#2B3036']);
          const front = arc(R, top, -Math.PI / 4, (3 * Math.PI) / 4, 16);
          svg('polygon', { class: 'rt-edge', points: pts(front.concat(arc(R, top - th, (3 * Math.PI) / 4, -Math.PI / 4, 16))), fill: '#CDD2CB' }, g);
          svg('polygon', { class: 'rt-top', points: pts(arc(R, top, 0, Math.PI * 2, 36)), fill: '#FAFBF9' }, g);
          // a few things on the table: a vase and two mugs
          box(g, { x: cx - 0.06, y: cy - 0.06, z: top, w: 0.12, d: 0.12, h: 0.18 }, [GROUP[1][1], GROUP[1][0], mix(GROUP[1][0], '#1B1F23', 0.22)]);
          [[0.28, -0.12], [-0.2, 0.26]].forEach(([dx, dy]) => box(g, { x: cx + dx, y: cy + dy, z: top, w: 0.08, d: 0.08, h: 0.08 }, ['#FAFBF9', '#E04E2A', '#B23D20']));
          (f.chairs || []).forEach((c) => { // seat facing the table; chairs behind the table get a back, front ones are stools
            const cg = svg('g', { class: 'furn lounge-chair', 'data-room': 'lounge' }, lay.things);
            cg._depth = c.x + c.y - 0.01;
            const sw = 0.4, sx = c.x - sw / 2, sy = c.y - sw / 2 + 0.06;
            box(cg, { x: sx, y: sy, w: sw, d: sw, h: 0.42 }, ['#F3DCA6', '#D89A12', mix('#D89A12', '#1B1F23', 0.2)]);
            if (c.side === 'back') {
              const bx = c.face[0] > 0 ? { x: sx - 0.06, y: sy, w: 0.07, d: sw, h: 0.78 } : { x: sx, y: sy - 0.06, w: sw, d: 0.07, h: 0.78 };
              box(cg, bx, ['#F3DCA6', '#D89A12', mix('#D89A12', '#1B1F23', 0.2)]);
            }
          });
        } else if (f.kind === 'cooler') { // water cooler: cabinet, blue bottle with bubbles while someone fills a cup
          box(g, f, ['#FAFBF9', '#E4E7E2', '#CDD2CB']);
          const fy = f.y + f.d + 0.005;
          [[0.08, '#2B57B5'], [0.22, '#E04E2A']].forEach(([dx, c]) => svg('polygon', { class: 'tap', points: pts([P(f.x + dx, fy, 0.62), P(f.x + dx + 0.06, fy, 0.62), P(f.x + dx + 0.06, fy, 0.7), P(f.x + dx, fy, 0.7)]), fill: c }, g));
          svg('polygon', { class: 'tray', points: pts([P(f.x + 0.05, fy, 0.36), P(f.x + 0.31, fy, 0.36), P(f.x + 0.31, fy, 0.42), P(f.x + 0.05, fy, 0.42)]), fill: '#3A4148' }, g);
          box(g, { x: f.x + 0.05, y: f.y + 0.05, z: f.h, w: 0.26, d: 0.26, h: 0.42 }, ['#DCE6F7', '#BDCBEA', '#9FB3DD'], 'bottle');
          box(g, { x: f.x + 0.13, y: f.y + 0.13, z: f.h + 0.42, w: 0.1, d: 0.1, h: 0.05 }, ['#2B57B5', '#2B57B5', '#1F3F86']);
          [[0.12, 0], [0.2, 0.5], [0.15, 1]].forEach(([dx, k]) => { const b = P(f.x + dx, f.y + f.d - 0.04, f.h + 0.06); svg('circle', { class: 'bubble-w', cx: b[0].toFixed(1), cy: b[1].toFixed(1), r: Math.max(1.4, 0.03 * U), style: 'animation-delay:' + k * 0.5 + 's', fill: '#FAFBF9' }, g); });
        } else if (f.kind === 'plant') { // terracotta pot and leaves; a tall one has a stem
          const cx = f.x + f.w / 2, cy = f.y + f.d / 2, ph = 0.24;
          if (f.room) g.setAttribute('data-room', f.room);
          box(g, { x: f.x + 0.05, y: f.y + 0.05, w: f.w - 0.1, d: f.d - 0.1, h: ph }, ['#E5B795', '#C98D63', '#9C6A47'], 'pot');
          const leaf = (dx, dy, z, r, c) => { const q = P(cx + dx, cy + dy, z); svg('circle', { class: 'leaf', cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: (r * U).toFixed(1), fill: c }, g); };
          if (f.type === 'tall') {
            const a = P(cx, cy, ph), b = P(cx, cy, f.h - 0.2);
            svg('polyline', { class: 'stem', points: pts([a, b]), fill: 'none', stroke: '#4A3426', 'stroke-width': 1.6 }, g);
            [[0.1, 0, 0.62, 0.16, '#5E8C57'], [-0.08, 0.06, 0.8, 0.17, '#8AA884'], [0.04, -0.08, 0.98, 0.18, '#5E8C57'], [0, 0.04, 1.12, 0.15, '#8AA884']].forEach((l) => leaf(...l));
          } else {
            [[-0.09, 0.04, 0.42, 0.19, '#5E8C57'], [0.1, -0.03, 0.46, 0.18, '#8AA884'], [-0.02, 0.1, 0.5, 0.17, '#8AA884'], [0, -0.02, 0.62, 0.19, '#5E8C57']].forEach((l) => leaf(...l));
          }
        } else if (f.kind === 'kitchen') { // counter with a microwave and a fruit bowl
          box(g, f, fills);
          const m = { x: f.x + 0.06, y: f.y + 0.14, z: f.h, w: 0.52, d: 0.36, h: 0.3 };
          box(g, m, ['#E4E7E2', '#3A4148', '#2B3036']);
          const fy = m.y + m.d + 0.005;
          svg('polygon', { class: 'mw-win', points: pts([P(m.x + 0.05, fy, m.z + 0.05), P(m.x + 0.36, fy, m.z + 0.05), P(m.x + 0.36, fy, m.z + m.h - 0.05), P(m.x + 0.05, fy, m.z + m.h - 0.05)]), fill: '#1B1F23' }, g);
          svg('polygon', { class: 'mw-led', points: pts([P(m.x + 0.4, fy, m.z + 0.19), P(m.x + 0.48, fy, m.z + 0.19), P(m.x + 0.48, fy, m.z + 0.24), P(m.x + 0.4, fy, m.z + 0.24)]), fill: '#5E8C57' }, g);
          [[0.7, 0.3, 0], [0.78, 0.36, 2], [0.72, 0.42, 3]].forEach(([dx, dy, k]) => box(g, { x: f.x + dx, y: f.y + dy, z: f.h, w: 0.09, d: 0.09, h: 0.08 }, [GROUP[k][1], GROUP[k][0], mix(GROUP[k][0], '#1B1F23', 0.22)]));
        } else if (f.kind === 'clock') { // a wall clock above the sofa, showing the real time
          g.remove();
          const cg = svg('g', { class: 'wall-clock', 'data-room': 'lounge' }, lay.walls), z = 0.92, r = 0.15;
          const ring = (rr) => pts(Array.from({ length: 24 }, (_, k) => { const a = (k / 24) * Math.PI * 2; return P(f.x + Math.cos(a) * rr, 0.005, z + Math.sin(a) * rr); }));
          svg('polygon', { points: ring(r), fill: '#FAFBF9', stroke: '#1B1F23', 'stroke-width': 1.4 }, cg);
          clockEl = { g: cg, x: f.x, z, r, h: svg('polyline', { class: 'clk-h', fill: 'none', stroke: '#1B1F23', 'stroke-width': 1.8 }, cg), m: svg('polyline', { class: 'clk-m', fill: 'none', stroke: '#E04E2A', 'stroke-width': 1.2 }, cg) };
          tickClock();
        } else if (f.kind === 'tt') { // table-tennis table: legs, top, net
          [0.12, f.w - 0.2].forEach((dx) => box(g, { x: f.x + dx, y: f.y + f.d / 2 - 0.04, w: 0.08, d: 0.08, h: f.h - 0.05 }, ['#3A4148', '#1B1F23', '#3A4148']));
          box(g, { x: f.x, y: f.y, z: f.h - 0.05, w: f.w, d: f.d, h: 0.05 }, ['#CFE0C9', '#9DBA97', '#8AA884']);
          const nx = f.x + f.w / 2;
          svg('polygon', { class: 'net', points: pts([P(nx, f.y - 0.04, f.h), P(nx, f.y + f.d + 0.04, f.h), P(nx, f.y + f.d + 0.04, f.h + 0.12), P(nx, f.y - 0.04, f.h + 0.12)]) }, g);
          ball.el = svg('circle', { class: 'ball', r: Math.max(2.5, 0.055 * U), cx: 0, cy: 0, 'data-room': 'lounge' }, lay.things);
          ball.el._depth = g._depth + 0.01;
          ball.el.style.display = 'none';
        }
      });
    }
    // Bunting on the lounge's back wall and a confetti burst that lands flat: drawn once per finished run, then static.
    function drawDecor(animate) {
      lay.walls.querySelectorAll('.decor').forEach((n) => n.remove());
      lay.routes.querySelectorAll('.confetti').forEach((n) => n.remove());
      if (!plan.lounge || !lounge || !lounge.party) return;
      const g = svg('g', { class: 'decor' + (animate ? ' fresh' : ''), 'data-room': 'lounge' }, lay.walls);
      const x0 = plan.lounge.x0 + 0.15, x1 = plan.W - 0.15, z = 1.12, n = Math.max(4, Math.floor((x1 - x0) / 0.42));
      const at = (k) => { const x = x0 + ((x1 - x0) * k) / n; return [x, z - 0.2 * Math.sin((Math.PI * k) / n)]; };
      const groups = Math.max(1, M.orderGroups(S).length);
      for (let k = 0; k < n; k++) {
        const [xa, za] = at(k), [xb, zb] = at(k + 1), c = GROUP[k % groups];
        svg('polygon', { class: 'flag', style: 'animation-delay:' + (0.9 + k * 0.06).toFixed(2) + 's', fill: c[0],
          points: pts([P(xa + 0.04, 0, za), P(xb - 0.04, 0, zb), P((xa + xb) / 2, 0, (za + zb) / 2 - 0.26)]) }, g);
      }
      svg('polyline', { class: 'bunting-line', pathLength: 1, points: pts(Array.from({ length: n + 1 }, (_, k) => { const [x, zz] = at(k); return P(x, 0, zz); })) }, g);
      const cg = svg('g', { class: 'confetti' + (animate ? ' fresh' : ''), 'data-room': 'lounge' }, lay.routes);
      const rnd = M.seededRandom('confetti:' + decorKey), pc = lounge.party;
      for (let k = 0; k < 28; k++) {
        const a = rnd() * Math.PI * 2, r = 0.35 + rnd() * 1.25;
        const x = Math.min(plan.W - 0.15, Math.max(plan.lounge.x0 + 0.15, pc.x + Math.cos(a) * r * 1.4)), y = Math.min(2.85, Math.max(0.85, pc.y + Math.sin(a) * r));
        const c = GROUP[k % groups][0], dx = 0.07 + rnd() * 0.05, sk = rnd() * 0.08 - 0.04;
        svg('polygon', { class: 'chip', fill: c, style: '--fall:' + (-70 - rnd() * 90).toFixed(0) + 'px;animation-delay:' + (rnd() * 0.6).toFixed(2) + 's',
          points: pts([P(x, y, 0.01), P(x + dx, y + sk, 0.01), P(x + dx + 0.03, y + sk + 0.06, 0.01), P(x + 0.03, y + 0.06, 0.01)]) }, cg);
      }
    }
    function drawDesk(id) {
      const d = plan.desks[id], col = colorsFor(plan, id);
      if (d.roam) return; // a roaming Lead has no desk
      const g = svg('g', { class: 'furn desk', 'data-id': id, 'data-room': d.room }, lay.things);
      g._depth = d.desk.x + d.desk.w / 2 + d.desk.y + d.desk.d;
      box(g, d.chair, [col[1], mix(col[1], '#1B1F23', 0.18), mix(col[1], '#1B1F23', 0.28)], 'chair');
      g._chairDepth = d.chair.x + d.chair.w / 2 + d.chair.y + d.chair.d / 2;
      box(g, d.desk, ['#FFFFFF', '#E4E7E2', '#CDD2CB'], 'deskbox');
      const m = d.monitor;
      box(g, { x: m.x + m.w / 2 - 0.05, y: m.y - 0.05, z: m.z, w: 0.1, d: 0.1, h: 0.12 }, ['#3A4148', '#1B1F23', '#1B1F23']);
      box(g, { x: m.x, y: m.y, z: m.z + 0.1, w: m.w, d: m.d, h: m.h }, ['#1B1F23', '#1B1F23', '#3A4148']);
      const o = P(m.x + 0.04, m.y + m.d, m.z + 0.1 + m.h - 0.04);
      const sx = (m.w - 0.08) / 100, sz = (m.h - 0.08) / 60;
      const scr = svg('g', { class: 'screen', transform: 'matrix(' + [C * U * sx, 0.5 * U * sx, 0, U * sz, o[0], o[1]].map((v) => v.toFixed(3)).join(' ') + ')' }, g);
      const inner = svg('svg', { width: 100, height: 60, viewBox: '0 0 100 60', overflow: 'hidden' }, scr);
      const stack = svg('g', { class: 'stack' }, g);
      deskEls[id] = { g, inner, stack, act: null };
      // the chair is drawn with the desk; split it out so a seated figure overlaps the desk but not vice versa
      const chair = g.querySelector('.chair');
      const cg = svg('g', { class: 'furn chairg', 'data-id': id, 'data-room': d.room }, lay.things);
      cg.appendChild(chair);
      cg._depth = g._chairDepth;
      renderStack(id);
    }
    function renderStack(id) {
      const de = deskEls[id], d = plan.desks[id];
      if (!de) return;
      de.stack.textContent = '';
      const n = docs[id] || 0;
      for (let k = 0; k < Math.min(n, 4); k++) {
        const s = d.stack, z = d.desk.h + 0.012 + k * 0.025, dx = (k % 2) * 0.03;
        svg('polygon', { class: 'paper' + (k === n - 1 ? ' landed' : ''), points: pts([P(s.x + dx, s.y, z), P(s.x + 0.32 + dx, s.y, z), P(s.x + 0.32 + dx, s.y + 0.24, z), P(s.x + dx, s.y + 0.24, z)]) }, de.stack);
      }
    }
    function setScreen(id, act) {
      const de = deskEls[id];
      if (!de || de.act === act) return;
      de.act = act;
      de.inner.innerHTML = toneAll('<g class="scr act-' + act + '">' + (SCREEN[act] || SCREEN.off) + '</g>');
    }
    function drawRoutes() {
      ((S && S.roles) || []).forEach((r) => {
        const a = plan.desks[r.id], b = plan.desks[r.handsTo || 'lead'];
        if (!a || !b || b.roam || r.handsTo === r.id) return;
        const path = [a.stand].concat(M.gridRoute(plan, a.stand, b.visit));
        svg('polyline', { class: 'route', 'data-route': r.id, points: pts(path.map((p) => P(p.x, p.y, 0.01))) }, lay.routes);
        const e = P(b.visit.x, b.visit.y, 0.01);
        svg('circle', { class: 'route-end', 'data-route': r.id, cx: e[0], cy: e[1], r: 3 }, lay.routes);
      });
    }

    /* ----- figures ----- */
    function buildFig(f) {
      if (f.g) f.g.remove();
      const col = colorsFor(plan, f.id), h = M.hash(f.id);
      const g = svg('g', { class: 'fig', 'data-id': f.id, 'data-room': roomOf(f.id) }, lay.things);
      g.style.setProperty('--sit', (0.36 * U).toFixed(1) + 'px');
      const legs = svg('g', { class: 'legs' }, g), lw = 0.09 * U;
      svg('rect', { class: 'leg leg-l', x: -0.13 * U, y: -0.84 * U, width: lw, height: 0.84 * U, fill: '#2B3036' }, legs);
      svg('rect', { class: 'leg leg-r', x: 0.04 * U, y: -0.84 * U, width: lw, height: 0.84 * U, fill: '#2B3036' }, legs);
      const upper = svg('g', { class: 'upper' }, g), body = svg('g', { class: 'body' }, upper);
      const t = { x: -0.2, y: -0.14, z: 0.8, w: 0.4, d: 0.28, h: 0.66 };
      const face = (a) => pts(a.map((p) => L(p[0], p[1], p[2])));
      const top = col[0] === LEAD[0] ? '#4A5259' : mix(col[0], '#FFFFFF', 0.25), right = mix(col[0], '#1B1F23', 0.22);
      svg('polygon', { class: 'torso', points: face([[t.x, t.y + t.d, t.z], [t.x + t.w, t.y + t.d, t.z], [t.x + t.w, t.y + t.d, t.z + t.h], [t.x, t.y + t.d, t.z + t.h]]), fill: col[0] }, body);
      svg('polygon', { class: 'torso', points: face([[t.x + t.w, t.y, t.z], [t.x + t.w, t.y + t.d, t.z], [t.x + t.w, t.y + t.d, t.z + t.h], [t.x + t.w, t.y, t.z + t.h]]), fill: right }, body);
      svg('polygon', { class: 'torso', points: face([[t.x, t.y, t.z + t.h], [t.x + t.w, t.y, t.z + t.h], [t.x + t.w, t.y + t.d, t.z + t.h], [t.x, t.y + t.d, t.z + t.h]]), fill: top }, body);
      const sh = L(0, 0, 1.4), aw = 0.075 * U;
      svg('rect', { class: 'arm arm-l', x: sh[0] - 0.22 * U - aw / 2, y: sh[1] - 0.05 * U, width: aw, height: 0.52 * U, fill: right }, body);
      svg('rect', { class: 'arm arm-r', x: sh[0] + 0.2 * U - aw / 2, y: sh[1] + 0.02 * U, width: aw, height: 0.52 * U, fill: right }, body);
      svg('polygon', { class: 'carried', points: face([[-0.05, -0.3, 1.1], [0.27, -0.3, 1.1], [0.27, -0.06, 1.1], [-0.05, -0.06, 1.1]]) }, body);
      // after-work props, placed where the hand ends for each pose (arm length 0.52U, rotated about the shoulder)
      const al = 0.52 * U, shR = [sh[0] + 0.2 * U, sh[1] + 0.02 * U], shL = [sh[0] - 0.22 * U, sh[1] - 0.05 * U];
      const hand = (s0, deg) => { const t = (deg * Math.PI) / 180; return [s0[0] - Math.sin(t) * al, s0[1] + Math.cos(t) * al]; };
      const cupAt = hand(shR, -40), sipAt = hand(shR, -100), cw = 0.1 * U, ch = 0.13 * U;
      g.style.setProperty('--sipx', (sipAt[0] - cupAt[0]).toFixed(1) + 'px');
      g.style.setProperty('--sipy', (sipAt[1] - cupAt[1]).toFixed(1) + 'px');
      svg('rect', { class: 'cup', x: cupAt[0] - cw / 2, y: cupAt[1] - ch * 0.8, width: cw, height: ch, fill: '#FAFBF9' }, body);
      f.batR = hand(shR, -60); f.batL = hand(shL, 120);
      const br = Math.max(3, 0.085 * U);
      svg('circle', { class: 'bat bat-r', cx: f.batR[0], cy: f.batR[1], r: br, fill: '#E04E2A' }, body);
      svg('circle', { class: 'bat bat-l', cx: f.batL[0], cy: f.batL[1], r: br, fill: '#E04E2A' }, body);
      const head = svg('g', { class: 'head' }, body), hc = L(0, 0, 1.68), r = 0.17 * U;
      svg('circle', { class: 'skull', cx: hc[0], cy: hc[1], r, fill: SKIN[h % SKIN.length] }, head);
      svg('path', { class: 'hair', d: 'M' + (hc[0] - r) + ' ' + (hc[1] + 0.1 * r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (hc[0] + r) + ' ' + (hc[1] + 0.1 * r) + 'Q' + hc[0] + ' ' + (hc[1] - 0.35 * r) + ' ' + (hc[0] - r) + ' ' + (hc[1] + 0.1 * r) + 'Z', fill: HAIR[(h >> 4) % HAIR.length] }, head);
      const badge = svg('g', { class: 'badge', transform: 'translate(' + (hc[0] + r + 4).toFixed(1) + ' ' + (hc[1] - r - 6).toFixed(1) + ')' }, g);
      const s = Math.max(14, 0.32 * U);
      svg('g', { class: 'b-tick' }, badge).innerHTML = toneAll('<rect x="0" y="0" width="' + s + '" height="' + s + '" fill="#5E8C57" stroke="#1B1F23"/><path d="M' + s * 0.24 + ' ' + s * 0.52 + 'l' + s * 0.18 + ' ' + s * 0.18 + ' ' + s * 0.36 + '-' + s * 0.42 + '" fill="none" stroke="#fff" stroke-width="2"/>');
      svg('g', { class: 'b-warn' }, badge).innerHTML = toneAll('<path d="M' + s / 2 + ' 0L' + s * 1.1 + ' ' + s + 'H' + -s * 0.1 + 'Z" fill="#D89A12" stroke="#1B1F23" stroke-linejoin="round"/><path d="M' + s / 2 + ' ' + s * 0.32 + 'v' + s * 0.34 + 'M' + s / 2 + ' ' + s * 0.78 + 'v' + s * 0.06 + '" stroke="#1B1F23" stroke-width="2"/>');
      // speech bubble, drawn on the side away from the chat partner (right for the right-hand speaker, mirrored for the left)
      const bw = Math.max(26, 0.62 * U), bh = Math.max(14, 0.3 * U), bx = hc[0] + r * 0.4, by = hc[1] - r - bh - 6;
      ['r', 'l'].forEach((side) => {
        const bub = svg('g', { class: 'bubble bubble-' + side, transform: side === 'l' ? 'translate(' + (2 * hc[0]).toFixed(1) + ' 0) scale(-1 1)' : null }, g);
        svg('path', { d: 'M' + (bx + 2) + ' ' + by + 'h' + (bw - 4) + 'q2 0 2 2v' + (bh - 4) + 'q0 2 -2 2H' + (bx + 10) + 'l-5 5v-5h-3q-2 0 -2 -2v-' + (bh - 4) + 'q0 -2 2 -2z' }, bub);
        [0.3, 0.5, 0.7].forEach((k) => svg('circle', { cx: bx + bw * k, cy: by + bh / 2, r: 1.6 }, bub));
      });
      const mk = svg('g', { class: 'marker', transform: 'translate(' + (hc[0] - r - 12).toFixed(1) + ' ' + (hc[1] - r - 4).toFixed(1) + ')' }, g);
      svg('rect', { x: -9, y: -9, width: 18, height: 18, fill: '#1B1F23' }, mk);
      svg('text', { x: 0, y: 4.5, class: 'mk-n' }, mk).textContent = String(members().indexOf(f.id) + 1);
      g.addEventListener('click', (e) => { e.stopPropagation(); opts.onSelect && opts.onSelect(f.id); });
      f.g = g;
      setCls(f, f.cls || []);
    }
    function setCls(f, list) {
      f.cls = list.filter(Boolean);
      if (f.g) f.g.setAttribute('class', 'fig ' + f.cls.join(' ') + (selected === f.id ? ' on' : ''));
    }
    function placeFig(f) {
      if (!f.g) return;
      const p = P(f.x, f.y, 0);
      f.g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
      f.g._depth = f.x + f.y + 0.02;
      resortOne(f.g);
    }
    function sortThings() {
      const kids = Array.from(lay.things.childNodes);
      kids.sort((a, b) => (a._depth || 0) - (b._depth || 0)).forEach((k) => lay.things.appendChild(k));
    }
    function resortOne(el) {
      const kids = lay.things.childNodes, d = el._depth;
      let before = null;
      for (let i = 0; i < kids.length; i++) { const k = kids[i]; if (k !== el && (k._depth || 0) > d) { before = k; break; } }
      if (el.nextSibling !== before) lay.things.insertBefore(el, before);
    }

    /* ----- annotations ----- */
    function drawNotes() {
      notes.textContent = ''; list.textContent = '';
      noteEls = {};
      members().forEach((id, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'note';
        b.dataset.id = id;
        b.innerHTML = '<span class="n-name"><span class="n-k">' + (i + 1) + '</span><span class="n-t"></span></span><span class="n-say"></span><span class="n-meta"><span class="n-ico"></span><span class="n-state"></span><span class="n-num"></span></span><span class="n-bar"><i></i></span>';
        b.addEventListener('click', (e) => { e.stopPropagation(); opts.onSelect && opts.onSelect(id); });
        const l = labelPos[id];
        if (!listMode && l) {
          b.style.left = l.x + 'px'; b.style.top = l.y + 'px'; b.style.width = l.w + 'px'; b.style.height = l.h + 'px';
          b.classList.add(l.side === 'left' ? 'n-left' : 'n-right');
          notes.appendChild(b);
        } else {
          const li = document.createElement('li');
          li.appendChild(b);
          list.appendChild(li);
        }
        noteEls[id] = b;
        fillNote(id);
      });
      leaders.textContent = '';
      members().forEach(drawLeader);
    }

    function statusOf(id) {
      if (mode === 'draft') return id === 'lead' ? statuses.lead || { state: 'working' } : { state: 'draft', say: draftSay(id) };
      return statuses[id] || { state: 'idle' };
    }
    function draftSay(id) { const r = M.member(S, id); return r ? r.job || '' : ''; }
    function fillNote(id) {
      const b = noteEls[id];
      if (!b) return;
      const m = (S && M.member(S, id)) || { name: 'Lead', emoji: '' }, st = statusOf(id), t = timing[id] || {};
      const name = m.name || (id === 'lead' ? 'Lead' : id); // emoji stay in the data; the sheet speaks in one ink
      b.querySelector('.n-t').textContent = name;
      const f = figs[id], word0 = f && f.activity && WORDS[f.activity];
      b.querySelector('.n-say').textContent = st.state === 'flagged' ? st.flag || st.say || '' : st.say || (st.state === 'done' && word0) || (st.state === 'idle' ? 'In the lounge' : '');
      const busy = BUSY.includes(st.state);
      const p = st.state === 'done' ? 100 : M.clampProgress(st.progress);
      const clock = busy && t.start ? M.formatClock(Date.now() - t.start) : st.state === 'done' && t.start && t.end ? M.formatClock(t.end - t.start) : '';
      const word = st.state === 'draft' ? 'draft' : st.state;
      b.querySelector('.n-state').textContent = word;
      b.querySelector('.n-ico').innerHTML = toneAll(st.state === 'flagged' ? ICON.warn : st.state === 'done' ? ICON.tick : '');
      const bar = b.querySelector('.n-bar');
      bar.hidden = p == null || !(busy || st.state === 'done');
      bar.firstChild.style.width = (p || 0) + '%';
      b.querySelector('.n-num').textContent = [p != null && (busy || st.state === 'done') ? p + '%' : '', clock].filter(Boolean).join(' · ');
      b.dataset.state = st.state;
      b.setAttribute('aria-label', name + ', ' + word + (st.say ? ': ' + st.say : '') + '. Show details');
    }
    function drawLeader(id) {
      const l = labelPos[id];
      if (listMode || !l || !l.path) return;
      const el = svg('g', { 'data-id': id, class: 'leader' + (selected === id ? ' on' : '') }, leaders);
      svg('polyline', { points: pts(l.path) }, el);
      svg('circle', { r: 2.5, cx: l.path[0][0].toFixed(1), cy: l.path[0][1].toFixed(1) }, el);
    }

    /* ----- motion ----- */
    function goTo(f, to, then) {
      clearTimeout(f.timer);
      if (reduced() || !plan) { f.x = to.x; f.y = to.y; f.path = []; placeFig(f); if (then) then(); return; }
      f.path = M.gridRoute(plan, f, to);
      if (!f.path.length) { if (then) then(); return; }
      f.arrive = then;
      const keep = f.cls.filter((c) => ['carry', 'done', 'idle', 'away'].includes(c));
      setCls(f, ['stand', 'lean'].concat(keep));
      f.timer = setTimeout(() => { setCls(f, ['stand', 'walk', 'step-a'].concat(keep)); f.go = true; kick(); }, 160);
    }
    function tick(now) {
      const dt = Math.min(0.25, (now - (last || now)) / 1000);
      last = now;
      let moving = false;
      Object.values(figs).forEach((f) => {
        if (!f.go || !f.path.length) return;
        moving = true;
        const p = f.path[0], dx = p.x - f.x, dy = p.y - f.y, dist = Math.hypot(dx, dy), step = SPEED * dt;
        if (dist <= step) { f.x = p.x; f.y = p.y; f.path.shift(); } else { f.x += (dx / dist) * step; f.y += (dy / dist) * step; }
        f.stepT = (f.stepT || 0) + dt;
        if (f.stepT > 0.18) { f.stepT = 0; const a = f.cls.includes('step-a'); setCls(f, f.cls.filter((c) => c !== 'step-a' && c !== 'step-b').concat(a ? 'step-b' : 'step-a')); }
        placeFig(f);
        if (!f.path.length) {
          f.go = false;
          setCls(f, f.cls.filter((c) => !['walk', 'step-a', 'step-b', 'lean'].includes(c)).concat('settle'));
          const done = f.arrive; f.arrive = null;
          setTimeout(() => setCls(f, f.cls.filter((c) => c !== 'settle')), 220);
          if (done) done();
        }
      });
      if (ball.on && ball.el) { moveBall(now); moving = true; }
      raf = 0;
      if (moving) kick(); else last = 0;
    }
    // One loop, only while something moves; nothing runs while the tab is hidden or the drawing is off screen.
    let hidden = !!document.hidden, onscreen = true;
    const paused = () => hidden || !onscreen;
    function run() { cancelAnimationFrame(raf); clearTimeout(fallback); raf = 0; if (!paused()) tick(performance.now()); }
    function kick() { if (raf || paused()) return; raf = requestAnimationFrame(run); fallback = setTimeout(run, 50); }
    function setPaused() { root.classList.toggle('paused', paused()); last = 0; if (!paused()) kick(); }
    document.addEventListener('visibilitychange', () => { hidden = !!document.hidden; setPaused(); });
    if (window.IntersectionObserver) new IntersectionObserver((es) => { onscreen = es.some((e) => e.isIntersecting); setPaused(); }).observe(root);

    /* ----- after-work life (only for figures whose work is done) ----- */
    const WORDS = { coffee: 'coffee', sofa: 'on the sofa', tt: 'table tennis', chat: 'chatting', party: 'wrap party', fridge: 'getting a drink', microwave: 'heating lunch', water: 'at the water cooler', table: 'at the round table' };
    const occupied = () => { const o = {}; Object.values(figs).forEach((x) => { if (x.station) o[x.station] = x.id; }); return o; };
    const figAt = (sid) => Object.values(figs).find((x) => x.station === sid);
    const teamBusy = () => members().some((id) => { const st = statusOf(id).state; return st !== 'done' && st !== 'idle'; });
    function rngFor(f) { f.n = (f.n || 0) + 1; return M.seededRandom(f.id + ':' + (runKey || '') + ':' + f.n); }
    // 'away' marks a figure in the lounge or at the party: no head tick there (being away already means done).
    function poseFor(s, f) {
      if (s.kind === 'sofa') return ['sit', 'lounge', 'away', rngFor(f)() < 0.5 && 'cup'];
      if (s.kind === 'coffee') return ['stand', 'cup', 'away'];
      if (s.kind === 'fridge') return ['stand', 'face-r', 'away'];
      if (s.kind === 'microwave') return ['stand', 'face-r', 'away'];
      if (s.kind === 'water') return ['stand', 'face-r', 'cup', 'away'];
      if (s.kind === 'table') return ['sit', 'lounge', 'away', rngFor(f)() < 0.6 && 'cup'].filter(Boolean);
      if (s.kind === 'tt') return ['stand', 'away', s.side === 'l' ? 'tt-l' : 'tt-r'];
      if (s.kind === 'chat') return ['stand', 'chat', 'away', s.side === 'l' ? 'face-r chat-l' : 'face-l chat-r'];
      return ['stand', 'away'];
    }
    const doneCount = () => members().filter((id) => statusOf(id).state === 'done').length;
    function goStation(f, s, instant) {
      f.station = s.id; f.activity = s.kind; f.arrived = false;
      if (!f.cls.includes('away')) setCls(f, f.cls.concat('away'));
      const arrive = () => {
        setCls(f, poseFor(s, f).concat('done')); f.arrived = true; ballCheck();
        if (s.kind === 'fridge') setTimeout(() => { if (f.station === s.id) setCls(f, ['stand', 'face-r', 'cup', 'away', 'done']); }, 2500); // door open, grab a can
      };
      if (instant || reduced()) { f.x = s.x; f.y = s.y; f.path = []; placeFig(f); arrive(); return; }
      goTo(f, s, arrive);
    }
    function afterWork(f, instant, opt) {
      if (!lounge || f.state !== 'done') return;
      const s = M.pickStation(lounge, occupied(), { id: f.id, state: f.state }, Object.assign({ teamBusy: teamBusy(), current: f.station, rng: rngFor(f), doneCount: doneCount() }, opt));
      f.nextAct = reduced() ? Infinity : Date.now() + 8000 + rngFor(f)() * 8000; // one action per 8–16 s; none under reduced motion
      if (s) goStation(f, s, instant);
    }
    const ringSpot = (i) => (lounge.party.ring[i] ? Object.assign({ id: 'ring-' + i, kind: 'ring' }, lounge.party.ring[i]) : null);
    const overSpots = () => (lounge ? lounge.overflow.map((p, i) => Object.assign({ id: 'over-' + i, kind: 'over' }, p)) : []);
    // deskRest: resting (done or idle) people sit at their own desk, not typing; now and then a short lounge break, then back.
    function restAtDesk(f, instant) {
      f.station = null; f.activity = null; f.arrived = false; f.breakUntil = 0;
      atSeat(f, instant, ['sit', f.state === 'done' ? 'done' : 'idle']);
      f.nextAct = reduced() ? Infinity : Date.now() + 15000 + Math.random() * 25000;
    }
    function restTick(f, now) {
      if (f.go || !f.nextAct || now < f.nextAct || party.active) return;
      if (f.breakUntil) { restAtDesk(f, false); f.nextAct = now + 25000 + Math.random() * 35000; return; } // break over: back to the desk
      const s = lounge && Math.random() < 0.35 && M.pickStation(lounge, occupied(), { id: f.id, state: 'done' }, { teamBusy: true, rng: rngFor(f) });
      if (s) { goStation(f, s, false); f.breakUntil = f.nextAct = now + 15000 + Math.random() * 20000; return; }
      f.nextAct = now + 15000 + Math.random() * 25000;
    }
    function toIdle(f, instant) { // before a run: people rest in the lounge, without after-work props
      const spots = lounge ? lounge.stations.concat(overSpots()) : [];
      if (!spots.length) return atSeat(f, instant, ['sit', 'idle']);
      const occ = occupied(), s = spots.find((x) => !occ[x.id]) || spots[0];
      f.station = s.id; f.activity = null;
      const settle = () => setCls(f, [s.kind === 'sofa' ? 'sit' : 'stand', 'idle']);
      if (instant || reduced()) { f.x = s.x; f.y = s.y; f.path = []; placeFig(f); settle(); } else goTo(f, s, settle);
    }
    function ballCheck() {
      const a = figAt('tt-0'), b = figAt('tt-1');
      const on = !!(ball.el && a && b && a.arrived && b.arrived && !reduced());
      if (on && !ball.on) ball.t0 = performance.now();
      ball.on = on;
      if (ball.el) ball.el.style.display = on ? '' : 'none';
      if (on) kick();
    }
    function moveBall(now) { // a rally of 7 hits (1.2 s each), a pause, then a re-serve
      const a = figAt('tt-0'), b = figAt('tt-1');
      if (!a || !b || !a.batR || !b.batL) return;
      const t = ((now - ball.t0) / 1000) % 10, hit = Math.floor(t / 1.2), u = (t % 1.2) / 1.2;
      if (t > 8.4) { ball.el.style.display = 'none'; return; }
      ball.el.style.display = '';
      const t3 = lounge.furniture.find((f) => f.kind === 'tt'), ym = t3.y + t3.d / 2, z = t3.h + 0.1;
      const A = P(t3.x + 0.06, ym, z), B = P(t3.x + t3.w - 0.06, ym, z); // end to end over the table, struck by each bat
      const [from, to] = hit % 2 ? [B, A] : [A, B];
      ball.el.setAttribute('cx', (from[0] + (to[0] - from[0]) * u).toFixed(1));
      ball.el.setAttribute('cy', (from[1] + (to[1] - from[1]) * u - Math.sin(Math.PI * u) * 0.45 * U).toFixed(1));
    }
    function startParty(key) {
      party = { key, active: true };
      decorKey = key;
      drawDecor(!reduced());
      members().forEach((id, i) => {
        const f = figs[id], spot = ringSpot(i); // the ring is ordered front-first and every point clears the others
        clearTimeout(f.later); clearTimeout(f.timer);
        if (!spot) return; // more people than room at the table: this one stays put
        f.station = spot.id; f.activity = 'party'; f.arrived = false;
        if (reduced()) { f.x = spot.x; f.y = spot.y; f.path = []; placeFig(f); setCls(f, ['stand', 'done', 'away']); return; }
        setCls(f, f.cls.concat('away'));
        f.later = setTimeout(() => goTo(f, spot, () => setCls(f, ['stand', 'cheer', 'done', 'away'])), 120 * i);
      });
      ballCheck();
      clearTimeout(partyTimer);
      partyTimer = setTimeout(() => { party.active = false; disperse(reduced()); }, reduced() ? 0 : 9500);
    }
    // After the party: table tennis first, then the sofa (from three people on), a chat, coffee; extra people stand
    // where nobody overlaps them, or go back to their desk.
    function disperse(instant) {
      const ids = members(), n = doneCount();
      ids.forEach((id) => { figs[id].station = null; });
      ids.forEach((id, i) => {
        const f = figs[id];
        const go = () => {
          if (f.state !== 'done') return;
          const remaining = ids.slice(i).filter((x) => figs[x].state === 'done').length; // this one and those still to place
          const s = M.pickStation(lounge, occupied(), { id, state: 'done' }, { ordered: true, current: null, rng: rngFor(f), doneCount: n, remaining });
          f.nextAct = reduced() ? Infinity : Date.now() + 9000 + rngFor(f)() * 8000;
          if (s) return goStation(f, s, instant);
          const occ = occupied(), o = overSpots().find((x) => !occ[x.id]);
          if (o) { f.station = o.id; f.activity = null; return instant ? (f.x = o.x, f.y = o.y, placeFig(f), setCls(f, ['stand', 'done', 'away'])) : goTo(f, o, () => setCls(f, ['stand', 'done', 'away'])); }
          f.station = null; f.activity = null; atSeat(f, instant, ['sit', 'done']);
        };
        if (instant) go(); else { f.station = 'pending-' + id; f.later = setTimeout(() => { f.station = null; go(); }, 300 + i * 450); }
      });
    }
    function atSeat(f, instant, cls) {
      const s = plan.desks[f.id].seat;
      if (instant) { f.x = s.x; f.y = s.y; placeFig(f); setCls(f, cls); return; }
      goTo(f, s, () => setCls(f, cls));
    }
    // roamLead: the Lead walks to whoever is flagged first, else to whoever is working; a short stop beside their desk, then on.
    function roam(f) {
      clearTimeout(f.roamT);
      if (!plan || !plan.desks[f.id] || f.state === 'idle') return;
      const others = members().filter((id) => !plan.desks[id].roam);
      const stOf = (id) => statusOf(id).state;
      let pool = others.filter((id) => stOf(id) === 'flagged');
      if (!pool.length) pool = others.filter((id) => stOf(id) === 'working');
      if (!pool.length) pool = others;
      if (pool.length > 1) pool = pool.filter((id) => id !== f.visiting);
      const id = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
      f.visiting = id;
      const v = id && plan.desks[id].visit, to = id ? { x: v.x + 0.4, y: v.y + 0.42 } : plan.desks[f.id].seat; // front-right of their desk, clear of the chair
      goTo(f, to, () => {
        setCls(f, id ? (stOf(id) === 'flagged' ? ['stand', 'face-l', 'talk'] : ['stand', 'face-l']) : ['stand']);
        f.roamT = setTimeout(() => roam(f), (id && stOf(id) === 'flagged' ? 9000 : 5000) + Math.random() * 5000);
      });
    }
    function enter(f, st, instant) {
      clearTimeout(f.timer); clearTimeout(f.later); clearTimeout(f.roamT);
      f.station = null; f.activity = null; f.nextAct = 0; f.arrived = false;
      const d = plan.desks[f.id];
      if (d.roam && st.state !== 'idle' && st.state !== 'done') { // idle or done: the lounge, like everyone else
        if (instant) { f.x = d.seat.x; f.y = d.seat.y; placeFig(f); }
        setCls(f, st.state === 'flagged' ? ['stand', 'raise'] : ['stand']);
        f.roamT = setTimeout(() => roam(f), instant ? 400 : 1200);
        return;
      }
      switch (st.state) {
        case 'draft': f.x = d.seat.x; f.y = d.seat.y; placeFig(f); setCls(f, ['sit', 'ghost']); return;
        case 'idle': return DESK_REST && f.id !== 'lead' ? restAtDesk(f, instant) : toIdle(f, instant);
        case 'working': f.nextThink = Date.now() + 4000 + Math.random() * 6000; return atSeat(f, instant, ['sit', 'type']);
        case 'flagged': return atSeat(f, instant, ['stand', 'raise', 'flag']);
        case 'done': // lean back with a tick; then (if the party is not starting) stretch and go for coffee
          if (DESK_REST && f.id !== 'lead') return restAtDesk(f, instant);
          if (instant || reduced()) { atSeat(f, true, ['sit', 'done']); if (teamBusy()) afterWork(f, true); return; }
          atSeat(f, false, ['sit', 'done']);
          f.later = setTimeout(() => {
            if (f.state !== 'done' || party.active) return;
            setCls(f, ['stand', 'stretch', 'done']);
            f.later = setTimeout(() => { if (f.state === 'done' && !party.active) afterWork(f, false); }, 1000);
          }, 1500 + rngFor(f)() * 1000);
          return;
        case 'handoff': {
          const target = plan.desks[st.to || 'lead'];
          if (!target || instant || reduced()) { if (target && !instant) { docs[st.to || 'lead'] = (docs[st.to || 'lead'] || 0) + 1; renderStack(st.to || 'lead'); } return goStand(f, instant); }
          setCls(f, ['stand', 'carry']);
          goTo(f, target.visit, () => {
            setCls(f, ['stand', 'carry']);
            f.timer = setTimeout(() => {
              docs[st.to || 'lead'] = (docs[st.to || 'lead'] || 0) + 1;
              renderStack(st.to || 'lead');
              setCls(f, ['stand']);
              goTo(f, d.stand, () => setCls(f, ['stand']));
            }, 500);
          });
          return;
        }
        default: return goStand(f, instant);
      }
    }
    function goStand(f, instant) {
      const s = plan.desks[f.id].stand;
      if (instant) { f.x = s.x; f.y = s.y; placeFig(f); setCls(f, ['stand']); return; }
      goTo(f, s, () => setCls(f, ['stand']));
    }
    function pulse() {
      if (!plan || paused()) return;
      pulseN++;
      tickClock(); tickKitchen();
      const now = Date.now();
      Object.keys(noteEls).forEach(fillNote);
      if (reduced()) { // static after-work: one chat bubble, no rotation
        const c0 = figAt('chat-0'), c1 = figAt('chat-1');
        if (c0 && c1 && !c0.cls.includes('talk')) setCls(c0, c0.cls.concat('talk'));
        return;
      }
      Object.values(figs).forEach((f) => {
        if (f.state === 'working' && f.cls.includes('type') && !f.go && now > (f.nextThink || 0)) {
          f.nextThink = now + 8000 + Math.random() * 8000;
          setCls(f, f.cls.concat('think'));
          setTimeout(() => setCls(f, f.cls.filter((c) => c !== 'think')), 1500);
        }
      });
      if (lounge && !party.active) Object.values(figs).forEach((f) => { // one after-work action per 8–16 s
        if (DESK_REST && f.id !== 'lead') { if (f.state === 'done' || f.state === 'idle') restTick(f, now); return; }
        if (f.state === 'done' && f.nextAct && !f.go && now >= f.nextAct) afterWork(f, false);
      });
      const c0 = figAt('chat-0'), c1 = figAt('chat-1'), chatting = c0 && c1 && c0.arrived && c1.arrived;
      Object.values(figs).forEach((f) => { if (f.cls.includes('talk') && (!chatting || (f !== c0 && f !== c1))) setCls(f, f.cls.filter((c) => c !== 'talk')); });
      if (chatting && now >= talkAt) { // turns alternate every 2–4 s
        const speaker = c0.cls.includes('talk') ? c1 : c0, other = speaker === c0 ? c1 : c0;
        setCls(other, other.cls.filter((c) => c !== 'talk'));
        setCls(speaker, speaker.cls.filter((c) => c !== 'talk').concat('talk'));
        talkAt = now + 2000 + Math.random() * 2000;
      }
      if (pulseN % 2 === 0) Object.values(deskEls).forEach((de) => {
        if (de.act === 'sheet') de.inner.querySelectorAll('.sc-num').forEach((n, i) => n.setAttribute('width', 6 + ((pulseN * 7 + i * 5) % 18)));
      });
    }
    setInterval(pulse, 1000);

    /* ----- public ----- */
    function setData(a) {
      const first = !plan, prevMode = mode;
      mode = a.mode; statuses = a.statuses || {}; timing = a.timing || {}; task = a.task;
      const nextSig = JSON.stringify([a.structure, (task && task.requirements) || [], mode]);
      let entering = false;
      if (nextSig !== sig) {
        sig = nextSig;
        S = a.structure;
        plan = M.planOffice(mode === 'empty' ? null : S, { kitchen: KITCHEN, roamLead: ROAM });
        lounge = M.loungeLayout(plan, members().length);
        const keep = figs;
        figs = {};
        entering = mode === 'live' && !reduced() && ((prevMode === 'draft' && !first) || (first && a.entrance));
        members().forEach((id, i) => {
          const old = keep[id];
          figs[id] = old || { id, x: plan.door.x, y: plan.door.y, path: [], cls: [], state: null, key: null };
          if (!old || entering) { const s = entering ? plan.door : plan.desks[id].seat; figs[id].x = s.x; figs[id].y = s.y; figs[id].key = null; figs[id].state = null; }
          else { old.key = null; old.moved = true; old.station = null; } // desks were re-planned: walk to the new place, never stay on someone else's
          figs[id].enterDelay = entering ? 900 + i * 420 : 0;
        });
        Object.keys(keep).forEach((id) => { if (!figs[id] && keep[id].g) keep[id].g.remove(); });
        root.classList.toggle('draft', mode === 'draft');
        root.classList.toggle('empty', mode === 'empty');
        root.classList.remove('print');
        if (entering || printNext) { void root.offsetWidth; root.classList.add('print'); setTimeout(() => root.classList.remove('print'), 2600); }
        printNext = false;
        relayout();
      }
      const allIdle = mode === 'live' && members().every((id) => statusOf(id).state === 'idle');
      const fresh = Object.values(figs).every((f) => f.state === null); // page (or this MAS) just opened
      runKey = a.runKey == null ? null : String(a.runKey);
      members().forEach((id) => {
        const f = figs[id], st = statusOf(id);
        setScreen(id, mode === 'draft' && id !== 'lead' ? 'off' : st.state === 'flagged' ? 'alert' : st.state === 'handoff' ? 'send' : M.activityFor(st));
        fillNote(id);
        const key = M.statusKey(st);
        if (key === f.key) return;
        const instant = (first || f.state === null) && !entering && !f.enterDelay;
        const same = !f.moved && f.state === st.state && !f.go && (st.state === 'working' || st.state === 'flagged');
        f.moved = false;
        f.key = key; f.state = st.state;
        if (same) return;
        if (f.enterDelay) { const dl = f.enterDelay; f.enterDelay = 0; f.timer = setTimeout(() => enter(f, statusOf(id), false), dl); return; }
        enter(f, st, instant);
      });
      if (allIdle) Object.keys(docs).forEach((id) => { if (docs[id]) { docs[id] = 0; renderStack(id); } });
      // the wrap party: once per finished run, only when the finish was seen live; opening a finished run draws it statically
      const allDone = mode === 'live' && members().length > 0 && members().every((id) => statusOf(id).state === 'done');
      if (allDone && lounge && lounge.party && runKey != null && party.key !== runKey) {
        if (M.partyDue(party.key, runKey, allDone, !fresh)) startParty(runKey);
        else { party = { key: runKey, active: false }; decorKey = runKey; drawDecor(false); disperse(true); }
      }
      if (!allDone && decorKey && (allIdle || runKey !== decorKey)) { // a new run: the room is tidied
        decorKey = null; party.active = false; clearTimeout(partyTimer);
        lay.walls.querySelectorAll('.decor').forEach((n) => n.remove()); lay.routes.querySelectorAll('.confetti').forEach((n) => n.remove());
      }
      highlightRoutes();
    }
    function highlightRoutes() {
      lay.routes.querySelectorAll('[data-route]').forEach((r) => {
        const id = r.getAttribute('data-route');
        r.classList.toggle('active', statusOf(id).state === 'handoff');
      });
    }
    function setSelected(id) {
      selected = id;
      applySelection();
    }
    function applySelection() {
      root.classList.toggle('isolate', !!selected);
      const room = selected ? roomOf(selected) : null;
      const target = selected && S ? ((M.member(S, selected) || {}).handsTo || (selected === 'lead' ? null : 'lead')) : null;
      root.querySelectorAll('[data-id],[data-room],[data-route]').forEach((el) => {
        const on = !!selected && (el.getAttribute('data-id') === selected || (el.getAttribute('data-room') === room && !el.getAttribute('data-id')) || el.getAttribute('data-route') === selected || (target && el.getAttribute('data-id') === target && el.classList.contains('desk')));
        el.classList.toggle('on', on);
      });
      Object.values(figs).forEach((f) => setCls(f, f.cls));
      Object.keys(noteEls).forEach((id) => noteEls[id].classList.toggle('on', id === selected));
      leaders.querySelectorAll('.leader').forEach((l) => l.classList.toggle('on', l.getAttribute('data-id') === selected));
    }
    scene.addEventListener('click', () => opts.onSelect && opts.onSelect(null));
    if (window.ResizeObserver) {
      let w = 0, hgt = 0;
      new ResizeObserver(() => { const r = host.getBoundingClientRect(); if (Math.abs(r.width - w) > 1 || Math.abs(r.height - hgt) > 1) { w = r.width; hgt = r.height; relayout(); } }).observe(host);
    } else window.addEventListener('resize', relayout);
    // Another MAS is now followed: forget this one and draw the next as if the page had just opened (printing in order).
    function reset() {
      Object.values(figs).forEach((f) => { clearTimeout(f.timer); clearTimeout(f.later); });
      figs = {}; docs = {}; plan = null; sig = ''; S = null; selected = null; mode = 'live';
      lounge = null; runKey = null; party = { key: null, active: false }; decorKey = null; clearTimeout(partyTimer); ball = { el: null, t0: 0, on: false };
      Object.values(lay).forEach((g) => { g.textContent = ''; });
      leaders.textContent = ''; notes.textContent = ''; list.textContent = '';
      root.classList.remove('isolate');
      printNext = !reduced();
    }
    return { setData, setSelected, relayout, reset };
  }

  window.MASOffice = { create };
})();
