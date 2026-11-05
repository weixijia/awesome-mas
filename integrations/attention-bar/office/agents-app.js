/* AttentionBar · Agents at work
   Turns agents.js (written by agents_feed.py) into the awesome-mas office:
   you = the Lead, each live Claude Code session = a role, its running subagents = roles beside it,
   one room per area (Work, Personal, code, …). Clicking a person jumps to that session. */
(function () {
  'use strict';
  const M = window.MASModel;
  const $ = (s) => document.querySelector(s);
  const BUSY = ['working', 'flagged', 'handoff'];
  const MAX_ROOMS = 6;
  const office = window.MASOffice.create($('#drawing-host'), { onSelect: select, maxUnit: 26 });
  const timing = {}, prev = {};
  let lastSig = '', sessionOf = {}, since = {};

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

  function build(feed) {
    const sessions = (feed && feed.sessions) || [];
    const areas = [];
    sessions.forEach((x) => { if (!areas.includes(x.area)) areas.push(x.area); });
    const roomOf = (a) => { const i = areas.indexOf(a); return i < MAX_ROOMS - 1 || areas.length <= MAX_ROOMS ? 'g' + i : 'g' + (MAX_ROOMS - 1); };
    const groups = areas.slice(0, MAX_ROOMS).map((a, i) => ({
      id: 'g' + i, label: i === MAX_ROOMS - 1 && areas.length > MAX_ROOMS ? 'Other' : a, after: null
    }));
    groups.forEach((g) => { const n = sessions.filter((x) => roomOf(x.area) === g.id).length; g.room = g.label + ' · ' + n; });
    const roles = [], statuses = {};
    since = {};
    sessionOf = {};
    const you = (feed && feed.you) || { state: 'working', say: 'Watching the team' };
    statuses.lead = { state: you.state, say: you.say, flag: you.flag || null };
    sessions.forEach((x) => {
      const id = 's-' + x.id.slice(0, 8);
      sessionOf[id] = x.id;
      roles.push({ id, name: x.name, group: roomOf(x.area), handsTo: 'lead', tools: [],
        job: x.prompt || 'No prompt yet', why: x.cwd, serves: [] });
      since[id] = x.since * 1000;
      statuses[id] = { state: x.state, say: x.subagents.length && x.state === 'working' ? x.say + ' · ' + x.subagents.length + ' helping' : x.say, flag: x.flag };
      x.subagents.forEach((a) => {
        const aid = 'a-' + a.id.slice(0, 10);
        sessionOf[aid] = x.id;
        roles.push({ id: aid, name: '↳ ' + a.name, group: roomOf(x.area), handsTo: id, tools: [], job: a.type ? a.type + ' subagent' : 'Subagent', serves: [] });
        statuses[aid] = { state: 'working', say: a.say };
      });
    });
    const structure = { title: 'Agents at work', version: 1, locked: true,
      lead: { id: 'lead', name: 'You', job: 'You' }, groups, roles };
    return { structure, statuses, sessions };
  }

  // The panel's own clocks: when each person started their current stretch of work.
  function track(statuses) {
    const now = Date.now();
    Object.keys(statuses).forEach((id) => {
      const cur = statuses[id], key = M.statusKey(cur), was = prev[id];
      if (was === key) return;
      prev[id] = key;
      const t = timing[id] || (timing[id] = {});
      if (BUSY.includes(cur.state) && (!t.start || t.end)) { t.start = since[id] || now; t.end = 0; }
      if (cur.state === 'done' && t.start && !t.end) t.end = now;
      if (cur.state === 'idle') delete timing[id];
    });
    Object.keys(prev).forEach((id) => { if (!statuses[id]) { delete prev[id]; delete timing[id]; } });
  }

  function header(b) {
    const n = b.sessions.length;
    const count = (st) => b.sessions.filter((x) => x.state === st).length;
    const subs = b.sessions.reduce((k, x) => k + x.subagents.length, 0);
    const parts = [];
    if (count('working')) parts.push('<b>' + count('working') + '</b> working');
    if (subs) parts.push('<b>' + subs + '</b> subagent' + (subs > 1 ? 's' : ''));
    if (count('flagged')) parts.push('<b>' + count('flagged') + '</b> need you');
    if (count('done')) parts.push('<b>' + count('done') + '</b> done');
    $('#title').textContent = n ? n + ' agent' + (n > 1 ? 's' : '') + ' in the office' : 'No agents right now';
    $('#sub').innerHTML = parts.join(' · ');
  }

  async function poll() {
    const feed = await load();
    if (!feed) return;
    const b = build(feed);
    track(b.statuses);
    const sig = JSON.stringify([b.structure, b.statuses]);
    header(b);
    renderUpNext(feed.upnext);
    if (sig === lastSig) return;
    lastSig = sig;
    office.setData({ mode: 'live', structure: b.structure, statuses: b.statuses, timing, task: null, entrance: false, runKey: null });
  }

  // Up next: the same card as each person in the list above (number, title, line, mono meta).
  const esc = M.esc;
  let upSig = '';
  function renderUpNext(u) {
    const el = $('#upnext');
    const sig = JSON.stringify(u || null);
    if (sig === upSig) return;
    upSig = sig;
    if (!u || u.status === 'paused') { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    const alert = u.status === 'alert';
    const items = u.items || [];
    el.innerHTML = '<h2>' + (alert ? 'Things to work on' : 'Up next') + '</h2>' +
      (alert && u.headline ? '<p class="alert">' + esc(u.headline) + '</p>' : '') +
      (items.length ? '<ol class="notes-list">' + items.map((it, i) =>
        '<li><button class="note" type="button" data-go="' + esc(it.session) + '" title="' + esc(it.prompt ? 'Copies: ' + it.prompt : 'Open this session') + '">' +
        '<span class="n-name"><span class="n-k">' + (i + 1) + '</span><span class="n-t">' + esc(it.title) + '</span></span>' +
        '<span class="n-say">' + esc(it.why) + '</span>' +
        '<span class="n-meta"><span class="sess">' + esc(it.name) + '</span>' + (it.prompt ? '<span class="copy">copies prompt</span>' : '') + '</span>' +
        '</button></li>').join('') + '</ol>' : '<p class="quiet">No suggestions yet.</p>');
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    const h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.go;
    if (h) h.postMessage(b.dataset.go);
  });
  // Light/dark follows macOS: the drawing picks its colours when built, so rebuild on a switch.
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => location.reload());

  function select(id) {
    office.setSelected(null);
    const sid = id && sessionOf[id];
    if (!sid) return;
    const h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jump;
    if (h) h.postMessage(sid);
  }

  // Tell AttentionBar how tall the sheet is, so the popover can fit it.
  // Measure the content itself (scrollHeight never drops below the current view, so the sheet could only grow).
  const contentHeight = () => Math.ceil(Math.max(...['.topline', '#drawing-host', '#upnext'].map((q) => {
    const el = document.querySelector(q);
    if (!el || el.hidden) return 0;
    return el.getBoundingClientRect().bottom + window.scrollY + (parseFloat(getComputedStyle(el).marginBottom) || 0);
  })));
  let told = 0;
  const tell = () => {
    const h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.height, v = contentHeight();
    if (h && v !== told) { told = v; h.postMessage(v); }
  };
  if (window.ResizeObserver) { const ro = new ResizeObserver(tell); ['#drawing-host', '#upnext'].forEach((q) => ro.observe(document.querySelector(q))); }
  setInterval(tell, 1000);
  window.addEventListener('resize', () => office.relayout && office.relayout());
  poll();
  setInterval(poll, 2000);
  // keep the clocks under each person ticking
  setInterval(() => { if (lastSig) office.setData({ mode: 'live', structure: JSON.parse(lastSig)[0], statuses: JSON.parse(lastSig)[1], timing, task: null, entrance: false, runKey: null }); }, 1000);
})();
