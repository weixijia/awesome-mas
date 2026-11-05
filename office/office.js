/* awesome-mas · MAS Office — the animated office scene.
   window.MASOffice.create(el, { onSelect }) → { setData, setSelected }
   The scene is a fixed 1200×700 stage scaled to fit; characters walk with requestAnimationFrame. */
(function () {
  'use strict';
  const M = window.MASModel;
  const W = 1200, H = 700, AISLE = 302, SPEED = 230, MAX_WALK = 2.6;
  const SKINS = ['#F6D3B8', '#EBB58F', '#D0976A', '#A8704B', '#7A4E33'];
  const HAIRS = ['#3B2A20', '#6B4226', '#1F1B1A', '#B5652E', '#D9B062', '#5A3A5E'];
  const SPOTS = [
    { x: 958, y: 292, pose: 'mug' }, { x: 1036, y: 292, pose: 'mug' }, { x: 1000, y: 606, pose: 'sofa' },
    { x: 1124, y: 606, pose: 'sofa' }, { x: 1062, y: 380, pose: 'stand' }, { x: 952, y: 440, pose: 'stand' },
    { x: 1128, y: 420, pose: 'mug' }, { x: 1040, y: 480, pose: 'stand' }, { x: 1150, y: 318, pose: 'stand' },
    { x: 962, y: 528, pose: 'stand' }, { x: 1110, y: 512, pose: 'stand' }
  ];
  const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const esc = M.esc;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };

  /* ---------- layout ---------- */
  function layout(s) {
    const roles = s.roles || [];
    const zones = [], desks = { lead: { x: 450, y: 262, big: true } };
    const list = M.orderGroups(s).map((g) => ({ g, members: roles.filter((r) => r.group === g.id) })).filter((z) => z.members.length);
    const orphans = roles.filter((r) => !list.some((z) => z.g.id === r.group));
    if (orphans.length) list.push({ g: { id: '?', label: 'No group yet', after: null }, members: orphans });
    const x0 = 28, x1 = 878, y0 = 336, y1 = 686, gap = 16, n = Math.max(list.length, 1);
    const zw = (x1 - x0 - gap * (n - 1)) / n;
    list.forEach((z, i) => {
      const zx = x0 + i * (zw + gap), k = z.members.length;
      // Prefer desks side by side: fall back to compact (120px) desks before stacking rows.
      let cols = Math.max(1, Math.min(k, Math.floor(zw / 160))), compact = false;
      if (cols < k && Math.floor(zw / 132) > cols) { cols = Math.min(k, Math.floor(zw / 132)); compact = true; }
      const rows = Math.ceil(k / cols);
      const rowH = Math.min(170, (y1 - y0 - 40) / rows), top = y0 + (y1 - y0) / 2 - ((rows - 1) * rowH) / 2 + 74;
      zones.push({ x: zx, y: y0, w: zw, h: y1 - y0, g: z.g, color: M.GROUP_COLORS[i % M.GROUP_COLORS.length], caption: M.zoneCaption(z.g, k) });
      z.members.forEach((r, j) => {
        desks[r.id] = { x: zx + (zw * ((j % cols) + 0.5)) / cols + (cols === 1 || compact ? 0 : 12), y: top + Math.floor(j / cols) * rowH, compact };
      });
    });
    return { desks, zones };
  }
  const sitSpot = (d) => ({ x: d.x, y: d.y - 56 });
  const standSpot = (d) => ({ x: d.x - (d.big ? 150 : 66), y: d.y + 6 });
  const visitSpot = (d, k) => ({ x: d.x + 14 + (k % 3) * 22 - 22, y: d.y + 30 });

  /* ---------- drawing ---------- */
  function background(s, task, L) {
    const reqs = ((task && task.requirements) || []).slice(0, 8);
    const notes = reqs.map((r, i) => {
      const col = i % 4, row = Math.floor(i / 4), x = 44 + col * 76, y = 52 + row * 50;
      const fill = ['#FFE58F', '#FFC9C2', '#C8EBD9', '#CFE0FA'][i % 4];
      const words = esc(r.text.length > 44 ? r.text.slice(0, 42) + '…' : r.text);
      return `<g transform="rotate(${(i % 3) - 1} ${x + 34} ${y + 20})"><rect x="${x}" y="${y}" width="68" height="46" rx="3" fill="${fill}"/>` +
        `<circle cx="${x + 34}" cy="${y + 3}" r="2.5" fill="#D9534F"/><text x="${x + 6}" y="${y + 15}" class="sv-note-id">${esc(r.id)}</text>` +
        `<foreignObject x="${x + 4}" y="${y + 17}" width="62" height="29"><div xmlns="http://www.w3.org/1999/xhtml" class="sv-note">${words}</div></foreignObject></g>`;
    }).join('');
    const zones = L.zones.map((z) => `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="22" fill="${shade(z.color, 0.86)}" stroke="${shade(z.color, 0.55)}" stroke-width="2" stroke-dasharray="7 7"/>`).join('');
    let planks = '';
    for (let y = 196; y < H; y += 36) planks += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
    for (let y = 178, k = 0; y < H; y += 36, k++) for (let x = (k % 2) * 90 + 40; x < W; x += 180) planks += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 18}"/>`;
    return `<svg class="sv-bg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
<rect width="${W}" height="${H}" fill="#EFDFCB"/><g stroke="#E4CFB6" stroke-width="1.5">${planks}</g>
<rect width="${W}" height="168" fill="#F8EEE2"/><rect y="150" width="${W}" height="20" fill="#EAD6C0"/><rect y="168" width="${W}" height="6" fill="#D9BFA3"/>
<rect x="28" y="20" width="324" height="140" rx="10" fill="#B9875A"/><rect x="36" y="28" width="308" height="124" rx="6" fill="#DDBA90"/>
<text x="44" y="45" class="sv-board">TASK BOARD</text>${notes || '<text x="44" y="90" class="sv-note-id">No requirements yet</text>'}
<g transform="translate(450 70)"><circle r="30" fill="#fff" stroke="#3D5A80" stroke-width="5"/><g class="sv-clock-h"><line y2="-15" stroke="#2E2A26" stroke-width="3.5" stroke-linecap="round"/></g><g class="sv-clock-m"><line y2="-22" stroke="#E8735A" stroke-width="2.5" stroke-linecap="round"/></g><circle r="3" fill="#2E2A26"/></g>
<g transform="translate(560 30)"><rect width="230" height="112" rx="8" fill="#fff"/><rect x="7" y="7" width="216" height="98" rx="4" fill="#CFE7F3"/><circle cx="178" cy="34" r="15" fill="#FFD27A"/><g fill="#fff"><ellipse cx="62" cy="48" rx="26" ry="11"/><ellipse cx="82" cy="40" rx="18" ry="12"/><ellipse cx="150" cy="78" rx="22" ry="8"/></g><path d="M7 88 q50 -26 104 -6 t112 -8 v31 h-216z" fill="#A9D3A0"/><line x1="115" y1="7" x2="115" y2="105" stroke="#fff" stroke-width="5"/></g>
<g transform="translate(940 34)"><rect width="220" height="10" rx="3" y="64" fill="#B9875A"/><rect x="14" y="30" width="16" height="34" rx="2" fill="#E8735A"/><rect x="32" y="22" width="14" height="42" rx="2" fill="#2F9E8F"/><rect x="48" y="34" width="18" height="30" rx="2" fill="#E2A23B"/><rect x="68" y="26" width="12" height="38" rx="2" fill="#8E6BB8"/><path d="M150 64 q-4 -26 14 -36 q-2 18 6 36z" fill="#7AAE5B"/><path d="M165 64 q10 -30 30 -32 q-10 14 -16 32z" fill="#5E9A47"/><rect x="146" y="56" width="34" height="10" rx="2" fill="#C2703D"/><text x="92" y="22" class="sv-lounge">LOUNGE</text></g>
${zones}
<g class="sv-divider">${[240, 330, 420, 510, 600].map((y) => `<rect x="884" y="${y}" width="22" height="44" rx="6" fill="#C98F5E"/><circle cx="895" cy="${y - 6}" r="16" fill="#7AAE5B"/><circle cx="889" cy="${y - 14}" r="10" fill="#8FC06E"/>`).join('')}</g>
<ellipse cx="1050" cy="470" rx="128" ry="120" fill="#F4E3D3" stroke="#E7CDB4" stroke-width="3"/>
<rect x="918" y="214" width="160" height="56" rx="8" fill="#C98F5E"/><rect x="918" y="210" width="160" height="12" rx="5" fill="#E0AE7E"/>
<g transform="translate(950 168)"><rect width="40" height="46" rx="6" fill="#4A5260"/><rect x="6" y="8" width="28" height="12" rx="3" fill="#8FD3C9"/><rect x="14" y="30" width="12" height="10" rx="2" fill="#fff"/><path class="sv-steam" d="M20 26 q-5 -6 0 -12 q5 -6 0 -12" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/></g>
<g fill="#fff" stroke="#E8735A" stroke-width="2"><rect x="1012" y="196" width="14" height="16" rx="3"/><rect x="1034" y="196" width="14" height="16" rx="3"/></g>
<rect x="958" y="560" width="210" height="44" rx="16" fill="#E8735A"/><rect x="950" y="588" width="226" height="44" rx="14" fill="#F08A70"/><rect x="944" y="572" width="22" height="64" rx="10" fill="#D9644C"/><rect x="1160" y="572" width="22" height="64" rx="10" fill="#D9644C"/>
<circle cx="1050" cy="520" r="0" fill="none"/>
<g transform="translate(1166 640)"><rect x="-14" y="0" width="28" height="30" rx="5" fill="#C2703D"/><path d="M0 2 q-24 -30 -8 -64 q6 30 8 64z" fill="#5E9A47"/><path d="M0 2 q22 -36 4 -70 q-10 36 -4 70z" fill="#7AAE5B"/><path d="M0 2 q-6 -40 -24 -46 q8 22 24 46z" fill="#8FC06E"/></g>
</svg>`;
  }
  function deskHtml(id, m, d, idx) {
    const big = !!d.big, w = big ? 250 : d.compact ? 120 : 150, dx = w - 150;
    const deco = big ? '<rect x="196" y="6" width="5" height="22" fill="#4A5260"/><path d="M186 8 h26 l-6 -10 h-14z" fill="#E2A23B"/>' :
      `<g transform="translate(${dx} 0)">` + (idx % 2 ? '<rect x="116" y="12" width="12" height="14" rx="3" fill="#fff" stroke="#2F9E8F" stroke-width="2"/>' : '<rect x="114" y="16" width="16" height="11" rx="2" fill="#C2703D"/><path d="M122 17 q-8 -12 -2 -20 q2 10 2 20z M122 17 q8 -12 3 -19 q-4 9 -3 19z" fill="#7AAE5B"/>') + '</g>';
    const lx = w / 2 - 24;
    return `<div class="desk-glow"></div><svg viewBox="0 0 ${w} 86" width="${w}" height="86" aria-hidden="true">${deco}
<rect x="${lx + 4}" y="9" width="40" height="21" rx="3" fill="#5C6575"/><rect x="${lx + 6}" y="11" width="36" height="17" rx="2" fill="#6B7487"/><circle class="desk-logo" cx="${w / 2}" cy="19.5" r="3.2" fill="#AAB3C2"/>
<rect x="0" y="28" width="${w}" height="12" rx="5" fill="#E0AE7E"/><rect x="6" y="38" width="${w - 12}" height="48" rx="4" fill="#C98F5E"/><rect x="6" y="38" width="${w - 12}" height="6" fill="#B87D4E"/></svg>
<div class="desk-plate">${esc(m.emoji || '')} ${esc(m.name || id)}</div><div class="desk-docs"></div>`;
  }
  function chairHtml(color) {
    return `<svg viewBox="0 0 60 50" width="60" height="50" aria-hidden="true"><rect x="4" y="0" width="52" height="50" rx="14" fill="${shade(color, -0.25)}"/><rect x="10" y="6" width="40" height="40" rx="10" fill="${shade(color, -0.1)}"/></svg>`;
  }
  function charHtml(id, m, color) {
    const h = M.hash(id), skin = SKINS[h % SKINS.length], hair = HAIRS[(h >> 3) % HAIRS.length], style = (h >> 6) % 4;
    const dark = shade(color, -0.22), pants = '#3F3B4C';
    const hairBack = style === 3 ? `<path d="M10 22 q0 -18 18 -18 q18 0 18 18 v20 q-4 4 -8 0 v-14 h-20 v14 q-4 4 -8 0z" fill="${hair}"/>` : '';
    const hairFront = [
      `<path d="M12 21 q0 -16 16 -16 q16 0 16 16 q-6 -8 -16 -8 q-10 0 -16 8z" fill="${hair}"/>`,
      `<circle cx="28" cy="5" r="7" fill="${hair}"/><path d="M12 21 q0 -16 16 -16 q16 0 16 16 q-8 -6 -16 -6 q-8 0 -16 6z" fill="${hair}"/>`,
      `<path d="M12 23 q-2 -19 17 -19 q16 0 16 17 q-6 -6 -12 -7 q-8 8 -21 9z" fill="${hair}"/>`,
      `<path d="M12 22 q0 -17 16 -17 q16 0 16 17 q-2 -6 -8 -8 q-8 4 -24 8z" fill="${hair}"/>`][style];
    const e = esc(m.emoji || '🙂');
    return `<div class="ch-bubble" hidden></div>
<svg class="ch-svg" viewBox="0 0 56 92" width="56" height="92" aria-hidden="true"><ellipse class="ch-shadow" cx="28" cy="90" rx="16" ry="3.5"/>
<g class="legs-stand"><rect class="leg leg-l" x="19" y="66" width="7.5" height="24" rx="3.5" fill="${pants}"/><rect class="leg leg-r" x="29.5" y="66" width="7.5" height="24" rx="3.5" fill="${pants}"/></g>
<g class="legs-sit"><rect x="18.5" y="72" width="7" height="18" rx="3.5" fill="${pants}"/><rect x="30.5" y="72" width="7" height="18" rx="3.5" fill="${pants}"/><rect x="13" y="62" width="30" height="14" rx="7" fill="${shade(pants, 0.12)}"/><ellipse cx="21" cy="90" rx="5.5" ry="2.6" fill="#2E2A26"/><ellipse cx="35" cy="90" rx="5.5" ry="2.6" fill="#2E2A26"/></g>
<g class="ch-upper"><rect class="arm arm-l" x="9" y="42" width="8" height="22" rx="4" fill="${dark}"/>
<g class="arm-r"><rect x="39" y="42" width="8" height="22" rx="4" fill="${dark}"/><g class="mug"><rect x="38" y="58" width="11" height="11" rx="2" fill="#fff" stroke="#E8735A" stroke-width="1.6"/><path class="sv-steam" d="M43 55 q-3 -4 0 -8" stroke="#bbb" stroke-width="1.5" fill="none"/></g></g>
<path d="M15 47 q0 -9 13 -9 q13 0 13 9 v19 q0 4 -4 4 h-18 q-4 0 -4 -4z" fill="${color}"/>
<g class="doc"><rect x="17" y="46" width="22" height="18" rx="2" fill="#fff" stroke="#C9B9A6"/><line x1="21" y1="52" x2="35" y2="52" stroke="#C9B9A6" stroke-width="1.5"/><line x1="21" y1="57" x2="31" y2="57" stroke="#C9B9A6" stroke-width="1.5"/></g>
${hairBack}<circle cx="28" cy="22" r="15" fill="${skin}"/>${hairFront}
<g class="eyes"><circle cx="22.5" cy="23" r="1.9" fill="#2E2A26"/><circle cx="33.5" cy="23" r="1.9" fill="#2E2A26"/></g>
<path d="M23.5 28.5 q4.5 3.6 9 0" stroke="#2E2A26" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<circle cx="19" cy="27.5" r="2.4" fill="#F29C8F" opacity=".6"/><circle cx="37" cy="27.5" r="2.4" fill="#F29C8F" opacity=".6"/></g></svg>
<div class="ch-badge">${e}</div><div class="ch-check" aria-hidden="true">✓</div><div class="ch-tag">${esc(m.name || id)}</div>`;
  }

  /* ---------- the scene ---------- */
  function create(host, opts) {
    const stage = el('div', 'stage');
    const bg = el('div', 'stage-bg');
    const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lines.setAttribute('class', 'stage-lines');
    lines.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const ents = el('div', 'stage-ents');
    stage.append(bg, lines, ents);
    host.appendChild(stage);
    let L = null, sig = '', chars = {}, desks = {}, selected = null, hover = null, preview = false, raf = 0, last = 0;

    function fit() {
      const r = host.getBoundingClientRect();
      if (!r.width) return;
      const k = Math.min(r.width / W, r.height / H);
      stage.style.transform = `translate(${(r.width - W * k) / 2}px, ${(r.height - H * k) / 2}px) scale(${k})`;
    }
    window.addEventListener('resize', fit);

    function build(s, task) {
      const old = chars;
      L = layout(s);
      bg.innerHTML = background(s, task, L);
      const now = new Date(), hr = bg.querySelector('.sv-clock-h'), mn = bg.querySelector('.sv-clock-m');
      hr.setAttribute('transform', 'rotate(' + ((now.getHours() % 12) * 30 + now.getMinutes() / 2) + ')');
      mn.setAttribute('transform', 'rotate(' + now.getMinutes() * 6 + ')');
      ents.innerHTML = '';
      chars = {}; desks = {};
      L.zones.forEach((z) => {
        const lab = el('div', 'zone-label', `<b>${esc(z.caption)}</b><span>${esc(z.g.label || '')}</span>`);
        lab.style.cssText = `left:${z.x + 14}px;top:${z.y + 12}px;--zc:${z.color}`;
        ents.appendChild(lab);
      });
      const members = [['lead', s.lead || { name: 'Lead', emoji: '🧭' }]].concat((s.roles || []).map((r) => [r.id, r]));
      members.forEach(([id, m], i) => {
        const d = L.desks[id];
        if (!d) return;
        const color = M.colorFor(id);
        const desk = el('div', 'desk' + (d.big ? ' desk-big' : ''), deskHtml(id, m, d, i));
        desk.style.cssText = `left:${d.x}px;top:${d.y}px;z-index:${Math.round(d.y)}`;
        const chair = el('div', 'chair', chairHtml(color));
        chair.style.cssText = `left:${d.x}px;top:${d.y - 58}px;z-index:${Math.round(d.y - 60)}`;
        ents.append(chair, desk);
        desks[id] = { d, el: desk, docs: 0 };
        const c = el('button', 'ch');
        c.type = 'button';
        c.dataset.id = id;
        c.setAttribute('aria-label', (m.name || id) + ' — show details');
        c.innerHTML = charHtml(id, m, color);
        c.addEventListener('click', () => opts.onSelect && opts.onSelect(id));
        c.addEventListener('mouseenter', () => { hover = id; drawLines(); });
        c.addEventListener('mouseleave', () => { hover = null; drawLines(); });
        ents.appendChild(c);
        const prev = old[id];
        chars[id] = { id, el: c, x: prev ? prev.x : SPOTS[i % SPOTS.length].x, y: prev ? prev.y : SPOTS[i % SPOTS.length].y, path: [], state: null, to: null, timer: 0, spot: -1, cls: '' };
        place(chars[id]);
      });
      Object.values(old).forEach((c) => clearTimeout(c.timer));
      drawLines();
      fit();
    }

    function drawLines() {
      if (!L) return;
      const ids = Object.keys(chars);
      const focus = selected || hover;
      lines.innerHTML = '<defs><marker id="ofc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#A08E7C"/></marker></defs>' +
        ids.filter((id) => id !== 'lead').map((id) => {
          const r = M.member(currentS, id); if (!r) return '';
          const to = r.handsTo || 'lead', a = L.desks[id], b = L.desks[to];
          if (!a || !b) return '';
          const x1 = a.x, y1 = a.y + 14, x2 = b.x + (to === 'lead' ? (x1 - b.x) * 0.3 : 0), y2 = b.y + 14;
          const mx = (x1 + x2) / 2, my = Math.abs(y1 - y2) < 30 ? Math.max(y1, y2) + 46 : (y1 + y2) / 2 + 30;
          const hot = focus && (focus === id || focus === to) || (chars[id] && chars[id].state === 'handoff');
          return `<path class="${hot ? 'hot' : ''}" d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" marker-end="url(#ofc-arrow)" stroke="${M.colorFor(id)}"/>`;
        }).join('');
    }

    function place(c) {
      c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
      c.el.style.zIndex = Math.round(c.y) + 6;
    }
    function setCls(c, list) {
      const next = list.filter(Boolean).join(' ');
      if (next === c.cls) return;
      c.cls = next;
      c.el.className = 'ch ' + next + (selected === c.id ? ' sel' : '');
    }
    function bubble(c, text, kind) {
      const b = c.el.querySelector('.ch-bubble');
      if (!text) { b.hidden = true; return; }
      b.hidden = false;
      b.className = 'ch-bubble' + (kind ? ' ' + kind : '');
      b.textContent = text;
    }
    function route(c, p) {
      const pts = [];
      const inLounge = (q) => q.x > 905;
      if (!(inLounge(c) && inLounge(p)) && Math.abs(c.y - p.y) > 110 && Math.abs(c.x - p.x) > 100) {
        const ay = AISLE + ((M.hash(c.id) % 5) - 2) * 6;
        pts.push({ x: c.x, y: ay }, { x: p.x, y: ay });
      }
      pts.push(p);
      return pts;
    }
    function goTo(c, p, then, carry) {
      clearTimeout(c.timer);
      if (reduced() || !document.body.contains(c.el)) { c.x = p.x; c.y = p.y; c.path = []; place(c); if (then) then(); return; }
      c.path = route(c, p);
      let len = 0, q = c;
      c.path.forEach((pt) => { len += Math.hypot(pt.x - q.x, pt.y - q.y); q = pt; });
      c.speed = Math.max(SPEED, len / MAX_WALK); // proportional to distance, but never a long wait
      c.arrive = then;
      c.carry = !!carry;
      kick();
    }
    function freeSpot(c) {
      const taken = new Set(Object.values(chars).filter((o) => o !== c && o.state === 'idle').map((o) => o.spot));
      const free = SPOTS.map((_, i) => i).filter((i) => !taken.has(i) && i !== c.spot);
      return free.length ? free[Math.floor(Math.random() * free.length)] : (c.spot + 1) % SPOTS.length;
    }
    function idle(c, instant) {
      c.spot = instant && c.spot < 0 ? Object.keys(chars).indexOf(c.id) % SPOTS.length : freeSpot(c);
      const s = SPOTS[c.spot];
      setCls(c, ['idle', 'walking']);
      bubble(c, '');
      const arrive = () => {
        setCls(c, ['idle', s.pose === 'sofa' && 'sofa', s.pose === 'mug' && 'has-mug']);
        if (!reduced()) c.timer = setTimeout(() => { if (c.state === 'idle') idle(c); }, 5000 + Math.random() * 7000);
      };
      if (instant) { c.x = s.x; c.y = s.y; place(c); arrive(); } else goTo(c, s, arrive);
    }
    function enter(c, st, instant) {
      const d = L.desks[c.id], desk = desks[c.id];
      const state = st.state;
      clearTimeout(c.timer);
      desk.el.classList.toggle('on', false);
      if (state === 'idle') return idle(c, instant);
      const atDesk = (cls, text, kind) => {
        const go = () => {
          setCls(c, ['sitting'].concat(cls));
          bubble(c, text, kind);
          desk.el.classList.toggle('on', state === 'working' || state === 'flagged');
        };
        setCls(c, ['walking']);
        bubble(c, '');
        if (instant) { Object.assign(c, sitSpot(d)); place(c); go(); } else goTo(c, sitSpot(d), go);
      };
      if (state === 'working') return atDesk(['typing'], st.say || 'Working…');
      if (state === 'flagged') return atDesk(['flagged'], '⚠️ ' + (st.flag || st.say || 'Something needs checking'), 'warn');
      if (state === 'done') return atDesk(['done'], '');
      const stand = (text) => {
        const go = () => { setCls(c, ['waiting']); bubble(c, text, 'soft'); };
        if (instant) { Object.assign(c, standSpot(d)); place(c); go(); } else { setCls(c, ['walking']); bubble(c, ''); goTo(c, standSpot(d), go); }
      };
      if (state === 'waiting') return stand(st.say && st.say !== 'Waiting for my turn' ? st.say : '…');
      if (state === 'handoff') {
        const target = desks[st.to] ? st.to : null;
        if (!target || instant) return stand('→ ' + M.roleName(currentS, st.to || 'lead'));
        setCls(c, ['walking', 'carry']);
        bubble(c, '→ ' + M.roleName(currentS, target), 'soft');
        const td = desks[target];
        goTo(c, visitSpot(td.d, td.docs), () => {
          setCls(c, ['carry']);
          c.timer = setTimeout(() => {
            td.docs++;
            renderDocs(td);
            setCls(c, ['walking']);
            goTo(c, standSpot(d), () => { setCls(c, ['waiting']); bubble(c, 'Handed over ✓', 'soft'); });
          }, 700);
        }, true);
        return;
      }
      stand(st.say || '');
    }
    function renderDocs(td) {
      const n = td.docs, box = td.el.querySelector('.desk-docs');
      box.innerHTML = n ? '<span class="doc-ico"></span>'.repeat(Math.min(n, 3)) + (n > 3 ? `<em>×${n}</em>` : '') : '';
      box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
    }

    function tick(now) {
      const dt = Math.min(0.25, (now - (last || now)) / 1000);
      last = now;
      let moving = false;
      Object.values(chars).forEach((c) => {
        if (!c.path.length) return;
        moving = true;
        const p = c.path[0], dx = p.x - c.x, dy = p.y - c.y, dist = Math.hypot(dx, dy), step = (c.speed || SPEED) * dt;
        if (dist <= step) { c.x = p.x; c.y = p.y; c.path.shift(); } else { c.x += (dx / dist) * step; c.y += (dy / dist) * step; }
        c.el.classList.toggle('face-left', dx < -1);
        place(c);
        if (!c.path.length && c.arrive) { const f = c.arrive; c.arrive = null; f(); }
      });
      raf = 0;
      if (moving) kick(); else last = 0;
    }
    // rAF when the page is painting; a timer fallback keeps people walking where rAF is throttled.
    let fallback = 0;
    function run() { cancelAnimationFrame(raf); clearTimeout(fallback); raf = 0; tick(performance.now()); }
    function kick() { if (raf) return; raf = requestAnimationFrame(run); fallback = setTimeout(run, 50); }

    let currentS = null;
    function setData(s, task, statuses, isPreview) {
      const nextSig = JSON.stringify([s, (task && task.requirements) || []]);
      const first = !L;
      if (nextSig !== sig) { sig = nextSig; currentS = s; build(s, task); }
      preview = !!isPreview;
      const allIdle = Object.keys(chars).every((id) => { const st = !preview && statuses[id]; return !st || st.state === 'idle'; });
      Object.values(chars).forEach((c) => {
        const st = (!preview && statuses[c.id]) || { state: 'idle' };
        const key = [st.state, st.say, st.to, st.flag].join('|');
        if (key === c.key) return;
        const instant = first || c.state === null;
        const sameState = c.state === st.state && st.state !== 'handoff' && !c.path.length;
        c.key = key; c.state = st.state; c.to = st.to;
        if (sameState && st.state === 'working') return bubble(c, st.say || 'Working…');
        if (sameState && st.state === 'flagged') return bubble(c, '⚠️ ' + (st.flag || st.say), 'warn');
        enter(c, st, instant);
      });
      if (allIdle) Object.values(desks).forEach((td) => { if (td.docs) { td.docs = 0; renderDocs(td); } });
      drawLines();
    }
    function setSelected(id) {
      selected = id;
      Object.values(chars).forEach((c) => c.el.classList.toggle('sel', c.id === id));
      drawLines();
    }
    return { setData, setSelected, fit };
  }

  window.MASOffice = { create, layout };
})();
