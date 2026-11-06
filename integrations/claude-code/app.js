/* Claude Code live office: the awesome-mas office drawing, fed by feed.py (agents.js).
   You are the Lead and walk between the desks. Each live Claude Code session is a team with its own room;
   its running subagents sit in that room. Tabs: All (every team) or one team.
   In All, clicking a person or card opens their team; inside a team it copies `claude --resume <id>`. */
(function () {
  'use strict';
  const M = window.MASModel;
  const $ = (s) => document.querySelector(s);
  const esc = M.esc;
  const BUSY = ['working', 'flagged', 'handoff'];
  const office = window.MASOffice.create($('#drawing-host'), { onSelect: select, roamLead: true, deskRest: true, kitchen: true });
  const timing = {}, prev = {};
  let lastSig = '', sessionOf = {}, since = {}, lastFeed = null, loadedOnce = false;
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* no storage */ } } };
  let view = new URLSearchParams(location.search).get('view') || store.get('cc-office-view') || 'all'; // 'all' or a session id

  // agents.js is a script, so this works from file:// with no server.
  function load() {
    return new Promise((resolve) => {
      document.querySelectorAll('script[data-feed]').forEach((s) => s.remove());
      const s = document.createElement('script');
      s.dataset.feed = '1';
      s.src = 'agents.js?t=' + Date.now();
      s.onload = () => resolve(window.AGENTS);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }

  // Each session keeps the order it first appeared in, so desks don't reshuffle when states change.
  const firstSeen = {};
  let seenN = 0;
  function build(feed) {
    const sessions = ((feed && feed.sessions) || []).slice();
    sessions.forEach((x) => { if (firstSeen[x.id] == null) firstSeen[x.id] = seenN++; });
    sessions.sort((a, b) => firstSeen[a.id] - firstSeen[b.id]);
    if (view !== 'all' && !sessions.some((x) => x.id === view)) setView('all', true); // that session has ended
    // One room per session: the session and its subagents. A room keeps its colour in every view.
    const shown = view === 'all' ? sessions : sessions.filter((x) => x.id === view);
    const cut = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);
    const groups = shown.map((x) => ({ id: 'g-' + x.id.slice(0, 8), label: x.name, after: null, colorIndex: sessions.indexOf(x),
      room: cut(x.name, 22) + (x.subagents.length ? ' · ' + (x.subagents.length + 1) : '') }));
    const roles = [], statuses = {};
    since = {};
    sessionOf = {};
    const you = (feed && feed.you) || { state: 'working', say: 'Watching the team' };
    statuses.lead = { state: you.state, say: you.say, flag: you.flag || null };
    shown.forEach((x) => {
      const id = 's-' + x.id.slice(0, 8), room = 'g-' + x.id.slice(0, 8);
      sessionOf[id] = x.id;
      roles.push({ id, name: x.name, group: room, handsTo: 'lead', tools: [], job: x.prompt || 'No prompt yet', why: x.cwd, serves: [] });
      since[id] = x.since * 1000;
      statuses[id] = { state: x.state, say: x.subagents.length && x.state === 'working' ? x.say + ' · ' + x.subagents.length + ' helping' : x.say, flag: x.flag };
      x.subagents.forEach((a) => {
        const aid = 'a-' + a.id.slice(0, 10);
        sessionOf[aid] = x.id;
        roles.push({ id: aid, name: '↳ ' + a.name, group: room, handsTo: id, tools: [], job: a.type ? a.type + ' subagent' : 'Subagent', serves: [] });
        statuses[aid] = { state: 'working', say: a.say };
      });
    });
    const structure = { title: 'Claude Code', version: 1, locked: true, lead: { id: 'lead', name: 'You', job: 'You' }, groups, roles };
    return { structure, statuses, sessions };
  }

  // The page's own clocks: when each person started their current stretch of work.
  function track(statuses) {
    const now = Date.now();
    Object.keys(statuses).forEach((id) => {
      const cur = statuses[id], key = M.statusKey(cur);
      if (prev[id] === key) return;
      prev[id] = key;
      const t = timing[id] || (timing[id] = {});
      if (BUSY.includes(cur.state) && (!t.start || t.end)) { t.start = since[id] || now; t.end = 0; }
      if (cur.state === 'done' && t.start && !t.end) t.end = now;
      if (cur.state === 'idle') delete timing[id];
    });
    Object.keys(prev).forEach((id) => { if (!statuses[id]) { delete prev[id]; delete timing[id]; } });
  }

  // Tabs: All, then one per team (state square, name, +subagents). Rebuilt only when something on them changes.
  let tabSig = '';
  function tabs(b) {
    const sig = JSON.stringify([view, b.sessions.map((x) => [x.id, x.name, x.state, x.subagents.length])]);
    if (sig === tabSig) return;
    tabSig = sig;
    const t = (id, label, st, extra, title) => '<button class="tab' + (view === id ? ' on' : '') + '" type="button" data-tab="' + esc(id) + '" title="' + esc(title) + '">' +
      (st ? '<i class="dot st-' + esc(st) + '"></i>' : '') + '<span class="tl">' + esc(label) + '</span>' + (extra ? '<span class="tx">' + esc(extra) + '</span>' : '') + '</button>';
    $('#tabs').innerHTML = t('all', 'All', null, String(b.sessions.length), 'Every team') +
      b.sessions.map((x) => t(x.id, x.name, x.state, x.subagents.length ? '+' + x.subagents.length : '', x.cwd + ' · ' + x.state)).join('');
    const on = $('#tabs .tab.on');
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function header(b) {
    tabs(b);
    if (view !== 'all') {
      const x = b.sessions.find((y) => y.id === view);
      if (x) {
        const subs = x.subagents.length, path = x.cwd.split('/').filter(Boolean).slice(-2).join('/');
        $('#title').textContent = x.name;
        $('#sub').innerHTML = '<b>' + esc(x.state) + '</b>' + (subs ? ' · <b>' + subs + '</b> subagent' + (subs > 1 ? 's' : '') : '') +
          ' · <span class="path" title="' + esc(x.cwd) + '">' + esc(path) + '</span>' +
          ' <button class="open" type="button" data-resume="' + esc(x.id) + '">Copy resume command</button>';
        return;
      }
    }
    const n = b.sessions.length, count = (st) => b.sessions.filter((x) => x.state === st).length;
    const subs = b.sessions.reduce((k, x) => k + x.subagents.length, 0), parts = [];
    if (count('working')) parts.push('<b>' + count('working') + '</b> working');
    if (subs) parts.push('<b>' + subs + '</b> subagent' + (subs > 1 ? 's' : ''));
    if (count('flagged')) parts.push('<b>' + count('flagged') + '</b> need you');
    if (count('done')) parts.push('<b>' + count('done') + '</b> done');
    $('#title').textContent = n ? n + ' team' + (n > 1 ? 's' : '') + ' in the office' : 'No Claude Code sessions right now';
    $('#sub').innerHTML = parts.join(' · ');
  }

  async function poll() {
    const feed = await load();
    if (!feed) { if (!loadedOnce) $('#sub').innerHTML = 'Waiting for <code>agents.js</code>: run <code>python3 feed.py</code> in this folder.'; return; }
    loadedOnce = true;
    lastFeed = feed;
    render();
  }
  function render() {
    if (!lastFeed) return;
    const b = build(lastFeed);
    track(b.statuses);
    const sig = JSON.stringify([b.structure, b.statuses]);
    header(b);
    if (sig === lastSig) return;
    lastSig = sig;
    office.setData({ mode: 'live', structure: b.structure, statuses: b.statuses, timing, task: null, entrance: false, runKey: null });
  }
  function setView(v, quiet) {
    view = v;
    store.set('cc-office-view', v);
    if (!quiet) { tabSig = ''; render(); }
  }

  // Inside the menu bar app (macos/), the app opens the session itself and sizes its popover to the page.
  const native = (name) => window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers[name];
  function openSession(sid, btn) { const h = native('jump'); if (h) h.postMessage(sid); else copyResume(sid, btn); }
  function copyResume(sid, btn) {
    const cmd = 'claude --resume ' + sid;
    const done = () => { if (btn) { const t = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = t; }, 1500); } };
    if (navigator.clipboard) navigator.clipboard.writeText(cmd).then(done, () => window.prompt('Copy this command:', cmd));
    else window.prompt('Copy this command:', cmd);
  }
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { setView(tab.dataset.tab); return; }
    const r = e.target.closest('[data-resume]');
    if (r) openSession(r.dataset.resume, r);
  });
  // All: a person (or their card) opens their team. Inside a team: copy the command that resumes that session.
  function select(id) {
    office.setSelected(null);
    const sid = id && sessionOf[id];
    if (!sid) return;
    if (view === 'all') setView(sid); else openSession(sid, $('#sub .open'));
  }
  // Light/dark follows the system: the drawing picks its colours when built, so rebuild on a switch.
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => location.reload());

  let told = 0;
  const tell = () => { // measure the content (scrollHeight never drops below the window, so it could only grow)
    const h = native('height');
    if (!h) return;
    const v = Math.ceil(Math.max(...['.tabs', '.topline', '#drawing-host'].map((q) => { const el = $(q); return el ? el.getBoundingClientRect().bottom + window.scrollY : 0; })));
    if (v !== told) { told = v; h.postMessage(v); }
  };
  if (window.ResizeObserver) new ResizeObserver(tell).observe($('#drawing-host'));
  setInterval(tell, 1000);
  window.addEventListener('resize', () => office.relayout && office.relayout());
  poll();
  setInterval(poll, 2000);
  // keep the clocks under each person ticking
  setInterval(() => { if (lastSig) { const [structure, statuses] = JSON.parse(lastSig); office.setData({ mode: 'live', structure, statuses, timing, task: null, entrance: false, runKey: null }); } }, 1000);
})();
