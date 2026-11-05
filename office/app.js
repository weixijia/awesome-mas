/* awesome-mas · MAS Office — UI, data loading and writing. */
(function () {
  'use strict';
  const M = window.MASModel;
  const esc = M.esc;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const params = new URLSearchParams(location.search);
  let ROOT = params.get('root') || '../';
  if (!ROOT.endsWith('/')) ROOT += '/';

  const FILES = { env: 'mas/env.js', state: 'mas/state.js', task: 'me/task.js', structure: 'mas/structure.js', result: 'outputs/result.js' };
  const GLOBALS = { env: 'MAS_ENV', state: 'MAS_STATE', task: 'MAS_TASK', structure: 'MAS_STRUCTURE', result: 'MAS_RESULT' };
  const FS_OK = typeof window.showDirectoryPicker === 'function';
  const ICONS = {
    'web search': '<svg viewBox="0 0 16 16" class="ico"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1.8 8h12.4M8 1.8c-3 3.4-3 9 0 12.4M8 1.8c3 3.4 3 9 0 12.4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
    'read my files': '<svg viewBox="0 0 16 16" class="ico"><path d="M1.5 4.2c0-.8.6-1.4 1.4-1.4h3.3l1.5 1.6h5.4c.8 0 1.4.6 1.4 1.4v6.6c0 .8-.6 1.4-1.4 1.4H2.9c-.8 0-1.4-.6-1.4-1.4z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
  };

  const S = {
    demo: params.get('demo') === '1', data: {}, statuses: {}, history: {}, draft: null, writing: false,
    dir: null, stored: null, connected: false, loading: false, lastChange: 0, loadedOnce: false, warnings: {},
    view: params.get('view'), userView: !!params.get('view'), selected: null, drawer: null, sigs: {}
  };

  /* ---------- small helpers ---------- */
  function copyText(text) {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      ta.remove();
    };
    try { if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).catch(fallback); else fallback(); } catch (e) { fallback(); }
  }
  let toastTimer = 0;
  function toast(html, copy) {
    const t = $('#toast');
    t.innerHTML = '<span>' + html + '</span>' + (copy ? '<button class="btn btn-sm" data-copy="' + esc(copy) + '">Copy <code>' + esc(copy) + '</code></button>' : '') + '<button class="toast-x" aria-label="Close">×</button>';
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 7000);
  }
  const savedToast = () => toast('Saved. Now type <code>next</code> in your assistant.', 'next');
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-copy]');
    if (c) { copyText(c.dataset.copy); const old = c.innerHTML; c.innerHTML = 'Copied ✓'; setTimeout(() => { c.innerHTML = old; }, 1400); }
    if (e.target.closest('.toast-x')) $('#toast').hidden = true;
  });
  const chip = (id, task, extra) => {
    const r = ((task && task.requirements) || []).find((x) => x.id === id);
    return '<span class="chip ' + (extra || '') + '" title="' + esc(r ? r.text : 'Not in your task') + '">' + esc(id) + '</span>';
  };
  const copyBtn = (cmd) => '<button class="btn btn-sm" data-copy="' + esc(cmd) + '">Copy <code>' + esc(cmd) + '</code></button>';

  /* ---------- reading data files ---------- */
  function loadScript(path) {
    return new Promise((resolve) => {
      $$('script[data-mas="' + path + '"]').forEach((s) => s.remove());
      const s = document.createElement('script');
      s.dataset.mas = path;
      s.src = ROOT + path + '?t=' + Date.now();
      let done = false;
      const fin = (st) => { if (done) return; done = true; clearTimeout(timer); resolve(st); };
      const timer = setTimeout(() => fin('missing'), 4000);
      s.onload = () => fin('ok');
      s.onerror = () => fin('missing');
      document.head.appendChild(s);
    });
  }
  async function handleFor(path, create) {
    const parts = path.split('/');
    let dir = S.dir;
    for (const p of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(p, { create: !!create });
    return dir.getFileHandle(parts[parts.length - 1], { create: !!create });
  }
  async function readText(path) {
    try { return await (await (await handleFor(path)).getFile()).text(); } catch (e) { return null; }
  }
  async function writeText(path, text) {
    const fh = await handleFor(path, true);
    const w = await fh.createWritable();
    await w.write(text);
    await w.close();
  }
  async function readData(path, globalName, statusId) {
    if (S.connected) {
      const text = await readText(path);
      if (text == null) return { st: 'missing' };
      try {
        const win = M.evalDataFile(text);
        return { st: 'ok', value: statusId ? (win.MAS_STATUS || {})[statusId] : win[globalName] };
      } catch (e) { return { st: 'broken' }; }
    }
    if (!statusId) window[globalName] = undefined;
    const st = await loadScript(path);
    const value = statusId ? (window.MAS_STATUS || {})[statusId] : window[globalName];
    // Loaded but assigned nothing → a typo while the assistant was writing: keep the last good version.
    return { st: st === 'ok' && value === undefined ? 'broken' : st, value };
  }

  async function poll() {
    if (S.loading) return;
    S.loading = true;
    try {
      const next = {}, warnings = {};
      await Promise.all(Object.keys(FILES).map(async (k) => {
        const r = await readData(FILES[k], GLOBALS[k]);
        if (r.st === 'broken') { warnings[FILES[k]] = true; next[k] = S.data[k]; } else next[k] = M.clone(r.value);
      }));
      if (S.writing) next.structure = S.data.structure;
      let statuses = S.statuses;
      if (!S.demo) {
        statuses = {};
        const s = next.structure;
        if (s && s.locked) {
          if (!S.connected) window.MAS_STATUS = {};
          const ids = ['lead'].concat((s.roles || []).map((r) => r.id));
          await Promise.all(ids.map(async (id) => {
            const path = 'mas/status/' + id + '.js';
            const r = await readData(path, 'MAS_STATUS', id);
            if (r.st === 'broken') { warnings[path] = true; statuses[id] = S.statuses[id]; } else if (r.value) statuses[id] = M.clone(r.value);
          }));
        }
      }
      S.warnings = warnings;
      apply(next, statuses);
    } finally { S.loading = false; }
  }
  // Compare content (never file timestamps, which agents often get wrong).
  const sigOf = (v, isStatus) => JSON.stringify(isStatus ? Object.keys(v || {}).sort().map((k) => [k, v[k] && [v[k].state, v[k].say, v[k].to, v[k].flag]]) : v);
  function apply(next, statuses) {
    const changed = {};
    Object.keys(FILES).forEach((k) => { const sg = sigOf(next[k]); if (sg !== S.sigs[k]) { changed[k] = true; S.sigs[k] = sg; } });
    const ss = sigOf(statuses, true);
    if (ss !== S.sigs.statuses) { changed.statuses = true; S.sigs.statuses = ss; }
    S.data = next;
    S.statuses = statuses || {};
    if (Object.keys(changed).length) {
      if (S.loadedOnce || Object.values(next).some(Boolean)) S.lastChange = Date.now();
      Object.keys(S.statuses).forEach((id) => M.pushSay(S.history, id, S.statuses[id]));
      render(changed, !S.loadedOnce);
    }
    S.loadedOnce = true;
    renderUpdated();
  }

  /* ---------- effective data ---------- */
  function data() {
    if (S.demo && !S.data.structure) return Object.assign({}, M.DEMO_DATA, { result: S.data.result || null });
    return S.data;
  }
  const struct = () => S.draft || data().structure || null;
  const canEdit = () => { const s = struct(); return !!s && !s.locked && !S.demo; };
  const progress = () => M.deriveProgress(data());

  /* ---------- connection (File System Access API, Chrome/Edge) ---------- */
  function idb(mode, fn) {
    return new Promise((resolve, reject) => {
      let req;
      try { req = indexedDB.open('awesome-mas-office', 1); } catch (e) { reject(e); return; }
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        try {
          const tx = req.result.transaction('kv', mode), r = fn(tx.objectStore('kv'));
          tx.oncomplete = () => resolve(r && r.result);
          tx.onerror = () => reject(tx.error);
        } catch (e) { reject(e); }
      };
    });
  }
  async function useHandle(dir) {
    S.dir = dir; S.connected = true; S.stored = null; S.draft = null; S.sigs = {};
    try { await idb('readwrite', (st) => st.put(dir, 'project')); } catch (e) { /* keep working without persistence */ }
    renderConn();
    await poll();
  }
  async function connect() {
    let dir;
    try { dir = await window.showDirectoryPicker({ mode: 'readwrite', id: 'awesome-mas' }); } catch (e) {
      if (e && e.name !== 'AbortError') toast('Could not open the folder: ' + esc(e.message));
      return;
    }
    try { await dir.getFileHandle('AGENTS.md'); } catch (e) {
      toast('“' + esc(dir.name) + '” doesn’t look like your awesome-mas folder — pick the folder that contains <code>AGENTS.md</code>.');
      return;
    }
    await useHandle(dir);
    toast('Connected to “' + esc(dir.name) + '”. You can now edit here.');
  }
  async function reconnect() {
    try { if ((await S.stored.requestPermission({ mode: 'readwrite' })) === 'granted') await useHandle(S.stored); } catch (e) { toast('Could not reconnect — try “Connect project folder” again.'); S.stored = null; renderConn(); }
  }
  async function disconnect() {
    S.dir = null; S.connected = false; S.sigs = {};
    try { await idb('readwrite', (st) => st.delete('project')); } catch (e) { /* ignore */ }
    renderConn(); poll();
  }
  async function restore() {
    if (!FS_OK || params.get('root') || S.demo) return;
    try {
      const h = await idb('readonly', (st) => st.get('project'));
      if (!h) return;
      if ((await h.queryPermission({ mode: 'readwrite' })) === 'granted') await useHandle(h);
      else { S.stored = h; renderConn(); }
    } catch (e) { /* no IndexedDB on this file:// page — fine */ }
  }
  function renderConn() {
    const c = $('#conn');
    if (S.demo) { c.innerHTML = ''; return; }
    if (S.connected) {
      c.innerHTML = '<span class="pill pill-ok" title="Reading and saving files in this folder"><i></i>' + esc(S.dir.name) + '</span><button class="btn btn-sm btn-ghost" id="disconnect" title="Stop editing files">×</button>';
    } else if (S.stored) {
      c.innerHTML = '<button class="btn btn-sm" id="reconnect">Reconnect “' + esc(S.stored.name) + '”</button>';
    } else if (FS_OK) {
      c.innerHTML = '<button class="btn btn-sm" id="connect" title="Lets this page save your edits into your project folder">Connect project folder</button>';
    } else {
      c.innerHTML = '<button class="btn btn-sm" disabled title="Editing needs Chrome or Edge — or just tell your assistant what to change">Connect project folder</button><span class="conn-hint">Editing needs Chrome or Edge — or just tell your assistant what to change</span>';
    }
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('#connect')) connect();
    if (e.target.closest('#reconnect')) reconnect();
    if (e.target.closest('#disconnect')) disconnect();
  });

  /* ---------- writing ---------- */
  async function editStructure(fn) {
    if (!canEdit()) return;
    const next = M.pruneGroups(fn(M.clone(struct())));
    if (!S.connected) { S.draft = next; render({ structure: true }); return; }
    S.data.structure = next;
    S.writing = true;
    render({ structure: true });
    try {
      await writeText('mas/structure.js', M.structureToJs(next));
      await writeText('mas/structure.md', M.structureToMarkdown(next));
      S.sigs.structure = sigOf(next);
      savedToast();
    } catch (e) { toast('Could not save: ' + esc(e.message)); } finally { S.writing = false; }
  }
  async function addRequest(line) {
    if (!S.connected) return false;
    try {
      const old = await readText('mas/requests.md');
      await writeText('mas/requests.md', M.appendRequest(old, line));
      savedToast();
      return true;
    } catch (e) { toast('Could not save: ' + esc(e.message)); return false; }
  }
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- top bar ---------- */
  const STEPS = ['Describe', 'Design', 'Refine & lock', 'Run'];
  function renderTop() {
    const d = data(), p = progress();
    $('#proj-title').textContent = (struct() && struct().title) || (d.task && d.task.title) || 'Your project';
    $('#stepper').innerHTML = STEPS.map((name, i) => {
      const n = i + 1, cls = n < p.step || (p.done && n === 4) ? 'done' : n === p.step ? 'now' : '';
      return '<li class="' + cls + '"><span class="dot">' + (cls === 'done' ? '✓' : n) + '</span><span class="lbl">' + esc(name) + '</span></li>';
    }).join('');
    const hint = S.demo ? 'This is a demo replay of an example run — press Replay in the Office to watch again.' : (d.state && d.state.next) || (p.started ? 'Type next in your assistant to continue.' : 'Type next in your assistant to start.');
    $('#next').title = hint;
    $('#next').innerHTML = '<span class="next-ico">👉</span><span class="next-text">' + M.formatHint(hint) + '</span>' + copyBtn(M.hintCommand(hint));
  }
  function renderUpdated() {
    const u = $('#updated');
    const w = Object.keys(S.warnings || {});
    const any = Object.values(S.data).some(Boolean);
    u.innerHTML = (w.length ? '<span class="warn-dot" title="' + esc(w.join(', ')) + ' has a typo — showing the last good version">!</span>' : '') +
      (S.demo ? 'demo data' : any ? 'updated ' + M.timeAgo(Date.now() - S.lastChange) : 'no data yet');
    u.title = 'Checking your files every 2 seconds';
  }

  /* ---------- views ---------- */
  function setView(v, byUser) {
    if (byUser) S.userView = true;
    S.view = v;
    $$('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.view === v)));
    $$('.view').forEach((x) => { x.hidden = x.id !== 'view-' + v; });
    if (v === 'office') { office.fit(); renderOffice(); }
    if (v === 'design') renderMap(true);
  }
  $$('.tab').forEach((t) => t.addEventListener('click', () => setView(t.dataset.view, true)));

  function render(changed, first) {
    renderTop();
    if (!S.userView) {
      const v = S.demo ? 'office' : M.viewForProgress(progress(), !!data().result);
      if (v !== S.view || first) setView(v);
    } else if (first) setView(S.view);
    if (changed.task || changed.structure || changed.state || first) renderDesign();
    if (changed.result || first) renderResult();
    renderOffice();
  }

  /* ---------- design view ---------- */
  function renderDesign() {
    const d = data(), s = struct(), task = d.task, cov = M.coverage(s, task);
    // task card
    let html = '';
    if (task) {
      html = '<div class="kicker">Your task</div><h2>' + esc(task.title || 'My task') + '</h2><p class="muted">' + esc(task.summary || '') + '</p><ul class="reqs">' +
        (task.requirements || []).map((r) => {
          const who = (cov.servedBy[r.id] || []).map((id) => (M.member(s, id) || {}).emoji || '').join(' ');
          const miss = s && !(cov.servedBy[r.id] || []).length;
          return '<li class="' + (miss ? 'miss' : '') + '">' + chip(r.id, task) + '<span>' + esc(r.text) + '</span><em title="' + (miss ? 'No one serves this yet' : 'Served by') + '">' + (miss ? '⚠️' : esc(who)) + '</em></li>';
        }).join('') + '</ul>' + (task.repeat ? '<p class="small muted">Repeat: ' + esc(task.repeat) + '</p>' : '');
    } else if (S.connected) {
      html = '<div class="kicker">Step 1 · Describe your task</div><h2>Five quick questions</h2><form id="answers">' +
        M.QUESTIONS.map((q, i) => '<label>' + (i + 1) + '. ' + esc(q) + '<textarea rows="2" name="q' + i + '"></textarea></label>').join('') +
        '<button class="btn btn-primary" type="submit">Save answers</button></form>';
    } else {
      html = '<div class="kicker">Step 1 · Describe your task</div><h2>No task yet</h2><p>Type <code>next</code> in your assistant — it will ask you five short questions.</p>' + copyBtn('next') +
        (FS_OK ? '<p class="small muted">Prefer typing here? Click <b>Connect project folder</b> at the top.</p>' : '');
    }
    const tc = $('#task-card');
    if (!tc.contains(document.activeElement) || task) {
      const typed = $$('#answers textarea').map((t) => t.value); // keep unsaved answers across re-renders
      tc.innerHTML = html;
      typed.forEach((v, i) => { const t = $('#answers [name=q' + i + ']'); if (t && v) t.value = v; });
      if (!task && S.connected) prefillAnswers();
    }

    // cost
    const roles = s ? (s.roles || []).length : 0, cost = M.costInfo(roles);
    $('#cost-card').hidden = !s;
    $('#cost-card').innerHTML = '<div class="kicker">Team cost</div><div class="cost-row"><b>' + esc(cost.text) + '</b></div><div class="meter meter-' + cost.level + '"><i style="width:' + (cost.fraction * 100) + '%"></i></div>' +
      '<p class="small muted">' + esc(cost.sub) + '. More agents ≠ better. Multi-agent systems use many more tokens than a chat (Anthropic reported ~15× for its research system).</p>';
    $('#why-card').hidden = !(s && s.rationale);
    $('#why-card').innerHTML = s && s.rationale ? '<div class="kicker">Why this team</div><p>' + esc(s.rationale) + '</p>' : '';

    // lock + ask
    const lock = $('#lock-card');
    lock.hidden = !s;
    if (s && s.locked) lock.innerHTML = '<div class="lockline"><span class="badge-lock">🔒 v' + esc(s.version || 1) + '</span><b>Team locked</b></div><p class="small">Type <code>unlock</code> in your assistant to change your team.</p>' + copyBtn('unlock');
    else if (s) lock.innerHTML = '<div class="kicker">Happy with your team?</div><button class="btn btn-primary btn-block" id="lock-btn">🔒 Lock team</button><p class="small muted">Locking gives each role its own instruction file, then your team can run.</p>';
    const ask = $('#ask-card');
    ask.hidden = !s || s.locked;
    if (s && !s.locked && !ask.contains(document.activeElement)) {
      ask.innerHTML = '<div class="kicker">Ask your assistant to change…</div><textarea id="ask-text" rows="2" placeholder="e.g. Add a budget checker that keeps everything under £300"></textarea>' +
        (S.connected ? '<button class="btn btn-block" id="ask-send">Send request</button>' : '<button class="btn btn-block" id="ask-copy">Copy — then paste it in your assistant</button>');
    }
    const warn = [];
    cov.unservedReqs.forEach((r) => warn.push(chip(r, task, 'chip-warn') + ' isn’t served by anyone yet'));
    cov.rolesWithoutReq.forEach((id) => warn.push(esc(M.roleName(s, id)) + ' doesn’t serve any requirement'));
    $('#map-warn').innerHTML = warn.map((w) => '<span>⚠️ ' + w + '</span>').join('');
    $('#map-badge').innerHTML = s ? (s.locked ? '<span class="badge-lock">🔒 v' + esc(s.version || 1) + '</span>' : '<span class="badge-draft">v' + esc(s.version || 1) + ' · not locked</span>') : '';
    $('#add-role').hidden = !canEdit();
    $('#draft-bar').hidden = !S.draft;
    renderMap();
    renderEditor();
  }
  async function prefillAnswers() {
    const md = await readText('me/answers.md');
    if (!md) return;
    M.parseAnswers(md).forEach((a, i) => { const t = $('#answers [name=q' + i + ']'); if (t && !t.value) t.value = a; });
  }
  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'answers') return;
    e.preventDefault();
    const answers = M.QUESTIONS.map((_, i) => e.target.elements['q' + i].value);
    if (!answers[0].trim()) { toast('Please answer the first question — what should your assistant help you do?'); return; }
    try { await writeText('me/answers.md', M.answersToMarkdown(answers)); savedToast(); } catch (err) { toast('Could not save: ' + esc(err.message)); }
  });
  document.addEventListener('click', async (e) => {
    const id = e.target.id;
    if (id === 'lock-btn') {
      if (S.draft) { toast('Download your edited structure.md first (or discard it) — your assistant can’t see edits that only live in this page.'); return; }
      if (!(await addRequest(M.LOCK_LINE))) toast('Type <code>next</code> in your assistant — it will check with you and lock the team.', 'next');
    }
    if (id === 'ask-send' || id === 'ask-copy') {
      const text = $('#ask-text').value.trim();
      if (!text) { $('#ask-text').focus(); return; }
      if (id === 'ask-copy') { copyText(text); toast('Copied. Paste it in your assistant.'); return; }
      if (await addRequest(M.refineLine(text))) $('#ask-text').value = '';
    }
    if (id === 'draft-download') download('structure.md', M.structureToMarkdown(S.draft));
    if (id === 'draft-discard') { S.draft = null; renderDesign(); renderOffice(); }
  });

  /* ---------- mind map ---------- */
  const MAP = { k: 1, x: 0, y: 0, auto: true, L: null };
  function mapLayout(s) {
    const roles = s.roles || [], ord = M.orderGroups(s);
    const list = ord.map((g) => ({ g, members: roles.filter((r) => r.group === g.id) }));
    const orphans = roles.filter((r) => !ord.some((g) => g.id === r.group));
    if (orphans.length) list.push({ g: { id: '?', label: 'No group yet', after: null }, members: orphans });
    const LW = 236, LH = 138, GW = 196, GH = 62, RW = 256, RH = 88, GAP = 14, GGAP = 30, XG = LW + 64, XR = XG + GW + 54;
    const groups = [], nodes = [];
    let y = 0;
    list.forEach((z, i) => {
      const inner = z.members.length * (RH + GAP) - GAP, hgt = Math.max(inner, GH), color = M.GROUP_COLORS[i % M.GROUP_COLORS.length];
      z.members.forEach((r, j) => nodes.push({ r, x: XR, y: y + (hgt - inner) / 2 + j * (RH + GAP), w: RW, h: RH, color }));
      groups.push({ g: z.g, i, n: z.members.length, x: XG, y: y + hgt / 2 - GH / 2, w: GW, h: GH, cy: y + hgt / 2, top: y, bottom: y + hgt, color });
      y += hgt + GGAP;
    });
    const total = Math.max(y - GGAP, LH);
    return { lead: { x: 0, y: total / 2 - LH / 2, w: LW, h: LH }, groups, nodes, total, XR, RW };
  }
  function renderMap(fitOnly) {
    const world = $('#map-world'), s = struct(), empty = $('#map-empty');
    if (!s) {
      world.innerHTML = '';
      const t = data().task;
      empty.hidden = false;
      empty.innerHTML = '<div class="empty-art">🧭<span>🔎</span><span>🛡️</span></div><h3>' + (t ? 'Your team map will appear here' : 'Welcome to your MAS Office') + '</h3><p>' +
        (t ? 'Type <code>next</code> in your assistant and it will design a team for your task.' : S.connected ? 'Answer the five questions on the left and save — then type <code>next</code> in your assistant.' : 'Type <code>next</code> in your assistant to start.') + '</p>' + copyBtn('next');
      return;
    }
    empty.hidden = true;
    if (fitOnly && MAP.L) { if (MAP.auto) fitMap(); return; }
    const task = data().task, L = mapLayout(s), cov = M.coverage(s, task), sel = S.selected;
    MAP.L = L;
    const pos = { lead: L.lead };
    L.nodes.forEach((n) => { pos[n.r.id] = n; });
    const bottom = Math.max(L.total, L.lead.y + L.lead.h);
    let maxOff = 0;
    const paths = [];
    L.groups.forEach((g) => {
      const x1 = L.lead.w, y1 = L.lead.y + L.lead.h / 2;
      paths.push('<path class="br" stroke="' + g.color + '" stroke-width="4" d="M' + x1 + ' ' + y1 + ' C' + (x1 + 40) + ' ' + y1 + ' ' + (g.x - 40) + ' ' + g.cy + ' ' + g.x + ' ' + g.cy + '"/>');
    });
    L.nodes.forEach((n) => {
      const g = L.groups.find((x) => x.g.id === n.r.group) || L.groups[L.groups.length - 1];
      const x1 = g.x + g.w, y2 = n.y + n.h / 2;
      paths.push('<path class="br" stroke="' + n.color + '" stroke-width="2.5" d="M' + x1 + ' ' + g.cy + ' C' + (x1 + 30) + ' ' + g.cy + ' ' + (n.x - 30) + ' ' + y2 + ' ' + n.x + ' ' + y2 + '"/>');
    });
    const toLead = L.nodes.filter((n) => (n.r.handsTo || 'lead') === 'lead');
    L.nodes.forEach((n) => {
      const to = n.r.handsTo || 'lead', t = pos[to];
      if (!t || to === n.r.id) return;
      const hot = sel && (sel === n.r.id || sel === to) ? ' hot' : '';
      if (to === 'lead') {
        const k = toLead.indexOf(n), sx = n.x + 46 + k * 12, sy = n.y + n.h, ex = L.lead.x + L.lead.w * 0.55 + k * 12, ey = L.lead.y + L.lead.h, by = bottom + 34 + k * 14;
        paths.push('<path class="ho' + hot + '" d="M' + sx + ' ' + sy + ' C' + sx + ' ' + by + ' ' + ex + ' ' + by + ' ' + ex + ' ' + (ey + 4) + '" marker-end="url(#map-arrow)"/>');
      } else {
        const x = n.x + n.w, y1 = n.y + n.h / 2, y2 = t.y + t.h / 2 + (y1 < t.y ? -10 : 10), off = 34 + Math.abs(y2 - y1) * 0.2;
        maxOff = Math.max(maxOff, off);
        paths.push('<path class="ho' + hot + '" d="M' + x + ' ' + y1 + ' C' + (x + off) + ' ' + y1 + ' ' + (x + off) + ' ' + y2 + ' ' + (x + 5) + ' ' + y2 + '" marker-end="url(#map-arrow)"/>');
      }
    });
    const W = L.XR + L.RW + maxOff + 20, H = bottom + 34 + toLead.length * 14 + 24;
    MAP.box = { x: -14, y: -14, w: W + 28, h: H + 28 };
    const lead = s.lead || {};
    const leadWarn = '';
    let html = '<svg class="map-svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><defs><marker id="map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#A08E7C"/></marker></defs>' + paths.join('') + '</svg>';
    html += '<div class="node lead' + (sel === 'lead' ? ' sel' : '') + '" data-id="lead" style="left:' + L.lead.x + 'px;top:' + L.lead.y + 'px;width:' + L.lead.w + 'px;height:' + L.lead.h + 'px">' +
      '<div class="n-top"><span class="n-emoji big">' + esc(lead.emoji || '🧭') + '</span><div><div class="kicker">Lead</div><div class="n-name">' + esc(lead.name || 'Lead') + '</div></div></div>' +
      '<div class="n-job">' + esc(lead.job || '') + '</div><div class="n-meta">' + (lead.serves || []).map((r) => chip(r, task)).join('') + leadWarn + '</div></div>';
    L.groups.forEach((g) => {
      html += '<div class="node group' + (sel === 'group:' + g.g.id ? ' sel' : '') + '" data-group="' + esc(g.g.id) + '" style="left:' + g.x + 'px;top:' + g.y + 'px;width:' + g.w + 'px;height:' + g.h + 'px;--c:' + g.color + '">' +
        '<div class="n-name">' + esc(M.groupCaption(g.g, g.i)) + '</div><div class="small">' + (g.n > 1 ? g.n + ' roles at the same time' : g.g.after ? 'after group ' + esc(g.g.after) : 'starts first') + '</div></div>';
    });
    L.nodes.forEach((n) => {
      const r = n.r, warn = cov.rolesWithoutReq.includes(r.id);
      html += '<div class="node role' + (sel === r.id ? ' sel' : '') + (warn ? ' warn' : '') + '" data-id="' + esc(r.id) + '" style="left:' + n.x + 'px;top:' + n.y + 'px;width:' + n.w + 'px;height:' + n.h + 'px;--c:' + n.color + '">' +
        '<span class="n-emoji">' + esc(r.emoji || '🙂') + '</span><div class="n-body"><div class="n-name">' + esc(r.name) + '</div><div class="n-job">' + esc(r.job || 'No job yet') + '</div>' +
        '<div class="n-meta">' + (r.serves || []).map((q) => chip(q, task)).join('') + (r.tools || []).map((t) => '<span class="tool" title="' + esc(t) + '">' + (ICONS[t] || esc(t)) + '</span>').join('') +
        '<span class="n-to">→ ' + esc(M.roleName(s, r.handsTo || 'lead')) + '</span></div></div>' + (warn ? '<span class="n-warn" title="Serves no requirement">!</span>' : '') + '</div>';
    });
    world.innerHTML = html;
    if (MAP.auto) fitMap(); else applyMap();
  }
  function applyMap() { $('#map-world').style.transform = 'translate(' + MAP.x + 'px,' + MAP.y + 'px) scale(' + MAP.k + ')'; }
  function fitMap() {
    const c = $('#map').getBoundingClientRect(), b = MAP.box;
    if (!b || !c.width) return;
    MAP.k = Math.min((c.width - 40) / b.w, (c.height - 70) / b.h, 1.1);
    MAP.x = (c.width - b.w * MAP.k) / 2 - b.x * MAP.k;
    MAP.y = (c.height - b.h * MAP.k) / 2 - b.y * MAP.k + 8;
    applyMap();
  }
  function zoomAt(f, px, py) {
    const k = Math.min(2.2, Math.max(0.3, MAP.k * f));
    MAP.x = px - ((px - MAP.x) * k) / MAP.k; MAP.y = py - ((py - MAP.y) * k) / MAP.k; MAP.k = k; MAP.auto = false;
    applyMap();
  }
  (function mapEvents() {
    const c = $('#map');
    let drag = null;
    c.addEventListener('wheel', (e) => {
      if (!MAP.L) return;
      e.preventDefault();
      const r = c.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    c.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.map-tools, .map-warn, .draft-bar, .map-empty')) return;
      const node = e.target.closest('.node');
      drag = { sx: e.clientX, sy: e.clientY, x: MAP.x, y: MAP.y, node, moved: false };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      if (drag.node && drag.node.classList.contains('role') && canEdit()) {
        drag.node.classList.add('dragging');
        drag.node.style.transform = 'translate(' + dx / MAP.k + 'px,' + dy / MAP.k + 'px)';
        const g = groupAt(e);
        $$('.node.group').forEach((n) => n.classList.toggle('drop', !!g && n.dataset.group === g.g.id));
      } else if (!drag.node || !drag.node.classList.contains('role')) {
        MAP.x = drag.x + dx; MAP.y = drag.y + dy; MAP.auto = false; applyMap();
        c.classList.add('panning');
      }
    });
    c.addEventListener('pointerup', (e) => {
      if (!drag) return;
      const d = drag;
      drag = null;
      c.classList.remove('panning');
      if (!d.moved) {
        if (d.node) select(d.node.dataset.id || 'group:' + d.node.dataset.group);
        else if (S.selected) select(null);
        return;
      }
      if (d.node && d.node.classList.contains('role') && canEdit()) {
        const g = groupAt(e), id = d.node.dataset.id;
        const role = (struct().roles || []).find((r) => r.id === id);
        if (g && role && g.g.id !== role.group && g.g.id !== '?') editStructure((s) => M.updateMember(s, id, { group: g.g.id }));
        else renderMap();
      }
    });
    function groupAt(e) {
      const r = c.getBoundingClientRect(), wx = (e.clientX - r.left - MAP.x) / MAP.k, wy = (e.clientY - r.top - MAP.y) / MAP.k;
      if (!MAP.L || wx < MAP.L.lead.w) return null;
      return MAP.L.groups.find((g) => wy >= g.top - 15 && wy <= g.bottom + 15) || null;
    }
    $('#zoom-in').addEventListener('click', () => { const r = c.getBoundingClientRect(); zoomAt(1.2, r.width / 2, r.height / 2); });
    $('#zoom-out').addEventListener('click', () => { const r = c.getBoundingClientRect(); zoomAt(1 / 1.2, r.width / 2, r.height / 2); });
    $('#zoom-fit').addEventListener('click', () => { MAP.auto = true; fitMap(); });
    $('#add-role').addEventListener('click', () => select('__new'));
    window.addEventListener('resize', () => { if (MAP.auto && S.view === 'design') fitMap(); });
  })();
  function select(id) { S.selected = id; renderEditor(); renderMap(); }

  /* ---------- side editor ---------- */
  function renderEditor() {
    const ed = $('#editor'), s = struct(), task = data().task, sel = S.selected;
    if (ed.contains(document.activeElement) && document.activeElement.matches('input[type=text], textarea')) return;
    const editable = canEdit();
    const ro = editable ? '' : ' disabled';
    const lockedNote = s && s.locked ? '<p class="note">🔒 Type <code>unlock</code> in your assistant to change your team.</p>' : '';
    const offline = editable && !S.connected ? '<p class="note">' + (FS_OK ? 'Edits stay in this page until you <b>Connect project folder</b> (top right) or download them.' : 'Editing needs Chrome or Edge — or just tell your assistant what to change. You can still try edits here and download <code>structure.md</code>.') + '</p>' : '';
    const none = !s || !sel || (sel !== '__new' && sel !== 'lead' && !sel.startsWith('group:') && !M.member(s, sel));
    const grid = $('#view-design'), had = grid.classList.contains('has-editor');
    grid.classList.toggle('has-editor', !none);
    if (had === none && MAP.auto) requestAnimationFrame(() => setTimeout(fitMap, 0));
    $('#map-hint').textContent = s ? (editable ? 'Click someone to edit · drag a role onto another group' : 'Click someone for details') : '';
    if (none) {
      ed.innerHTML = '<div class="ed-empty"><div class="empty-art small">👆</div><h3>Pick someone on the map</h3><p class="muted">Click the Lead or a role to see ' + (editable ? 'and edit ' : '') + 'their job, the requirements they serve and who they hand their work to.</p>' +
        (s ? '<p class="muted small">Drag the map to move it · scroll to zoom' + (editable ? ' · drag a role onto another group to move it' : '') + '</p>' : '') + lockedNote + offline + '</div>';
      return;
    }
    if (sel === '__new') {
      ed.innerHTML = '<form id="new-role" class="ed-form"><div class="kicker">New role</div><h3>Who else do you need?</h3><label>Role name<input type="text" name="name" placeholder="e.g. Budget checker" required></label>' +
        '<label>Group<select name="group">' + M.orderGroups(s).map((g, i) => '<option value="' + esc(g.id) + '">' + esc(M.groupCaption(g, i)) + '</option>').join('') + '<option value="__new">＋ New group (runs after the others)</option></select></label>' +
        '<div class="row"><button class="btn btn-primary" type="submit">Add role</button><button class="btn btn-ghost" type="button" data-act="cancel">Cancel</button></div></form>';
      $('#new-role input').focus();
      return;
    }
    if (sel.startsWith('group:')) {
      const g = (s.groups || []).find((x) => x.id === sel.slice(6));
      if (!g) { ed.innerHTML = ''; return; }
      const members = (s.roles || []).filter((r) => r.group === g.id);
      ed.innerHTML = '<fieldset class="ed-form"' + ro + '><div class="kicker">Group ' + esc(g.id) + '</div><h3>' + esc(g.label || '') + '</h3>' +
        '<label>Label<input type="text" data-g="label" value="' + esc(g.label || '') + '"></label><p class="muted small">' +
        (members.length > 1 ? 'These roles work <b>at the same time</b>: ' : 'Role: ') + members.map((r) => esc(r.emoji + ' ' + r.name)).join(', ') + '.<br>' + (g.after ? 'Starts after group ' + esc(g.after) + ' finishes.' : 'Starts first.') + '</p></fieldset>' + lockedNote;
      return;
    }
    const isLead = sel === 'lead', m = M.member(s, sel), cov = M.coverage(s, task);
    const reqs = (task && task.requirements) || [];
    const serveBoxes = reqs.length ? reqs.map((r) => '<label class="check"><input type="checkbox" data-serve="' + esc(r.id) + '"' + ((m.serves || []).includes(r.id) ? ' checked' : '') + '>' + chip(r.id, task) + '<span>' + esc(r.text) + '</span></label>').join('') : '<p class="muted small">No requirements yet.</p>';
    let html = '<fieldset class="ed-form"' + ro + '><div class="ed-head"><input class="ed-emoji" type="text" data-f="emoji" maxlength="8" value="' + esc(m.emoji || '') + '" aria-label="Emoji"><div><div class="kicker">' + (isLead ? 'Lead' : 'Role') + '</div><input class="ed-name" type="text" data-f="name" value="' + esc(m.name || '') + '" aria-label="Name"></div></div>' +
      '<label>Job<textarea data-f="job" rows="3">' + esc(m.job || '') + '</textarea></label><div class="field"><div class="label">Serves</div>' + serveBoxes + '</div>';
    if (!isLead) {
      html += '<div class="field"><div class="label">Tools</div>' + M.TOOLS.map((t) => '<label class="check"><input type="checkbox" data-tool="' + esc(t) + '"' + ((m.tools || []).includes(t) ? ' checked' : '') + '>' + ICONS[t] + '<span>' + esc(t) + '</span></label>').join('') + '</div>' +
        '<label>Group<select data-f="group">' + M.orderGroups(s).map((g, i) => '<option value="' + esc(g.id) + '"' + (g.id === m.group ? ' selected' : '') + '>' + esc(M.groupCaption(g, i)) + '</option>').join('') + '<option value="__new">＋ New group (runs after the others)</option></select></label>' +
        '<label>Hands to<select data-f="handsTo">' + [['lead', s.lead]].concat((s.roles || []).filter((r) => r.id !== m.id).map((r) => [r.id, r])).map(([id, x]) => '<option value="' + esc(id) + '"' + ((m.handsTo || 'lead') === id ? ' selected' : '') + '>' + esc(((x && x.emoji) || '') + ' ' + ((x && x.name) || id)) + '</option>').join('') + '</select></label>' +
        (m.why ? '<p class="why"><b>Why this role:</b> ' + esc(m.why) + '</p>' : '');
      if (cov.rolesWithoutReq.includes(m.id)) html += '<p class="warnbox">⚠️ This role doesn’t serve any requirement. Tick at least one — or ask whether you need it.</p>';
      const from = M.receivesFrom(s, m.id);
      if (from.length) html += '<p class="muted small">Receives work from: ' + from.map((id) => esc(M.roleName(s, id))).join(', ') + '</p>';
      if (editable) html += '<button class="btn btn-danger btn-sm" type="button" data-act="delete">Delete role</button>';
    }
    ed.innerHTML = html + '</fieldset>' + lockedNote + offline;
  }
  const edit = (patch) => { const id = S.selected; editStructure((s) => M.updateMember(s, id, patch(M.member(s, id)))); };
  $('#editor').addEventListener('change', (e) => {
    const t = e.target, s = struct();
    if (!s || !canEdit() || t.closest('#new-role')) return;
    if (t.dataset.g) { const gid = S.selected.slice(6); editStructure((x) => { const g = x.groups.find((y) => y.id === gid); if (g) g.label = t.value.trim(); return x; }); return; }
    if (t.dataset.serve) return edit((m) => ({ serves: (m.serves || []).filter((r) => r !== t.dataset.serve).concat(t.checked ? [t.dataset.serve] : []).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) }));
    if (t.dataset.tool) return edit((m) => ({ tools: M.TOOLS.filter((x) => (x === t.dataset.tool ? t.checked : (m.tools || []).includes(x))) }));
    const f = t.dataset.f;
    if (!f) return;
    if (f === 'name' && !t.value.trim()) { renderEditor(); return; }
    if (f === 'group' && t.value === '__new') {
      const id = S.selected;
      editStructure((x) => { const r = M.addGroup(x, 'Next step'); return M.updateMember(r.structure, id, { group: r.groupId }); });
      return;
    }
    edit(() => ({ [f]: f === 'job' || f === 'name' ? M.oneLine(t.value) : t.value.trim() }));
  });
  $('#editor').addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'cancel') select(null);
    if (act.dataset.act === 'delete' && window.confirm('Delete “' + M.roleName(struct(), S.selected) + '”? Anyone who handed work to them will hand it on instead.')) {
      const id = S.selected; S.selected = null;
      editStructure((s) => M.deleteRole(s, id));
    }
  });
  $('#editor').addEventListener('submit', (e) => {
    if (e.target.id !== 'new-role') return;
    e.preventDefault();
    const name = e.target.elements.name.value.trim(), group = e.target.elements.group.value;
    if (!name) return;
    let newId = null;
    editStructure((s) => {
      let gid = group;
      if (group === '__new') { const g = M.addGroup(s, 'Next step'); s = g.structure; gid = g.groupId; }
      const r = M.addRole(s, name, gid);
      newId = r.id;
      return r.structure;
    }).then(() => { if (newId) select(newId); });
    S.selected = null;
  });

  /* ---------- office view ---------- */
  const office = window.MASOffice.create($('#office-host'), { onSelect: (id) => { S.drawer = id; office.setSelected(id); renderDrawer(); } });
  function renderOffice() {
    const s = struct(), d = data();
    $('#office-empty').hidden = !!s;
    $('#office-host').hidden = !s;
    $('#office-legend').hidden = !s;
    $('#demo-badge').hidden = $('#replay').hidden = !S.demo;
    if (!s) {
      $('#office-empty').innerHTML = '<div class="empty-art">🪴<span>🪑</span><span>☕</span></div><h3>The office is still empty</h3><p>Your team moves in once it is designed. Type <code>next</code> in your assistant.</p>' + copyBtn('next');
      $('#office-banner').hidden = true;
      return;
    }
    const preview = !s.locked && !S.demo;
    $('#office-banner').hidden = !preview;
    office.setData(s, d.task, S.statuses, preview);
    if (S.drawer) renderDrawer();
  }
  function renderDrawer() {
    const dr = $('#drawer'), s = struct(), task = data().task, id = S.drawer, m = s && M.member(s, id);
    if (!m) { dr.hidden = true; return; }
    const st = S.statuses[id] || { state: 'idle' }, hist = (S.history[id] || []).slice().reverse();
    const g = id === 'lead' ? null : (s.groups || []).find((x) => x.id === m.group);
    const row = (k, v) => (v ? '<dt>' + k + '</dt><dd>' + v + '</dd>' : '');
    dr.hidden = false;
    dr.innerHTML = '<button class="drawer-x" aria-label="Close">×</button><div class="ed-head"><span class="ed-emoji static">' + esc(m.emoji || '🙂') + '</span><div><div class="kicker">' + (id === 'lead' ? 'Lead' : 'Role') + '</div><h3>' + esc(m.name) + '</h3></div></div>' +
      '<span class="state state-' + esc(st.state) + '">' + esc(st.state) + '</span>' + (st.flag ? '<p class="warnbox">⚠️ ' + esc(st.flag) + '</p>' : '') +
      '<dl>' + row('Job', esc(m.job || '')) + row('Serves', (m.serves || []).map((r) => chip(r, task)).join(' ')) +
      (id === 'lead' ? '' : row('Tools', (m.tools || []).map((t) => esc(t)).join(', ') || 'none') + row('Group', g ? esc(M.groupCaption(g, M.orderGroups(s).indexOf(g))) : esc(m.group || '')) + row('Hands to', esc(M.roleName(s, m.handsTo || 'lead')))) +
      row('Receives from', M.receivesFrom(s, id).map((x) => esc(M.roleName(s, x))).join(', ')) + '</dl>' +
      '<div class="label">Latest messages</div>' + (hist.length ? '<ol class="hist">' + hist.map((h) => '<li><span class="state state-' + esc(h.state) + '">' + esc(h.state) + '</span>' + esc(h.say) + '<em>' + M.timeAgo(Date.now() - h.at) + '</em></li>').join('') + '</ol>' : '<p class="muted small">Nothing yet — messages appear here while the team runs.</p>') +
      (id === 'lead' ? '' : '<p class="muted small">Instructions: <code>team/' + esc(id) + '.md</code></p>');
  }
  $('#drawer').addEventListener('click', (e) => { if (e.target.closest('.drawer-x')) { S.drawer = null; office.setSelected(null); $('#drawer').hidden = true; } });

  /* ---------- result view ---------- */
  function resolveLink(u) {
    if (/^\.\.\//.test(u)) return ROOT + 'outputs/' + u; // written relative to outputs/result.md
    return ROOT + u.replace(/^\.\//, '');
  }
  function renderResult() {
    const r = data().result, s = struct(), box = $('#result');
    if (!r) {
      box.innerHTML = '<div class="empty card"><div class="empty-art">📄<span>✨</span></div><h3>No result yet</h3><p>Lock your team, then type <code>next</code> in your assistant to run it. The answer — with a source for every claim — appears here.</p>' + copyBtn('next') + '</div>';
      return;
    }
    const who = (id) => { const m = s && M.member(s, id); return '<span class="who">' + esc(m ? (m.emoji || '') + ' ' + m.name : id || 'unknown') + '</span>'; };
    const when = (() => { const t = r.updated && new Date(r.updated); return t && !isNaN(t) ? t.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''; })();
    box.innerHTML = '<article class="card result-main"><div class="kicker">Result' + (r.run ? ' · run ' + esc(r.run) : '') + (when ? ' · ' + esc(when) : '') + '</div><h1>' + esc(r.title || 'Result') + '</h1><div class="md">' + M.renderMarkdown(r.markdown || '', { resolveLink }) + '</div></article>' +
      '<aside class="result-side">' +
      '<section class="card"><div class="kicker">Sources (' + (r.sources || []).length + ')</div><ul class="sources">' + (r.sources || []).map((x) => {
        const ev = String(x.evidence || 'D').toUpperCase().slice(0, 1);
        const href = M.renderMarkdown('[x](' + (x.url || '#') + ')').match(/href="([^"]*)"/);
        return '<li><span class="ev ev-' + esc(ev) + '" title="' + esc(M.EVIDENCE[ev] || '') + '">' + esc(ev) + '</span><div><a href="' + (href ? href[1] : '#') + '" target="_blank" rel="noopener noreferrer">' + esc(x.title || x.url || x.id) + '</a>' +
          '<div class="small">found by ' + who(x.foundBy) + (x.id ? ' · <a href="' + esc(ROOT + 'sources/' + x.id + '.md') + '" target="_blank" rel="noopener">card</a>' : '') + '</div></div></li>';
      }).join('') + '</ul><p class="small muted ev-key">' + Object.keys(M.EVIDENCE).map((k) => '<span><span class="ev ev-' + k + '">' + k + '</span> ' + esc(M.EVIDENCE[k]) + '</span>').join(' ') + '</p></section>' +
      ((r.flags || []).length ? '<section class="card"><div class="kicker">Flags</div><ul class="flags">' + r.flags.map((f) => '<li>⚠️ <span>' + esc(f.text) + '</span><div class="small">by ' + who(f.by) + '</div></li>').join('') + '</ul></section>' : '') +
      '</aside>';
  }

  /* ---------- demo ---------- */
  let demoStart = 0, demoScript = null, demoSig = '';
  function demoTick() {
    const s = struct();
    if (!s) return;
    const sg = JSON.stringify(s);
    if (sg !== demoSig) { demoSig = sg; demoScript = M.buildDemoScript(s); }
    const st = M.demoStatusesAt(demoScript, (performance.now() - demoStart) / 1000);
    const ss = sigOf(st, true);
    if (ss === S.sigs.statuses) return;
    S.sigs.statuses = ss;
    S.statuses = st;
    Object.keys(st).forEach((id) => M.pushSay(S.history, id, st[id]));
    S.lastChange = Date.now();
    renderOffice();
  }
  $('#replay').addEventListener('click', () => { demoStart = performance.now(); S.history = {}; demoTick(); });

  /* ---------- start ---------- */
  renderConn();
  renderTop();
  if (!S.view) S.view = S.demo ? 'office' : 'design';
  setView(S.view);
  restore().then(poll);
  setInterval(poll, 2000);
  setInterval(renderUpdated, 1000);
  if (S.demo) { demoStart = performance.now(); setInterval(demoTick, 250); }
})();
