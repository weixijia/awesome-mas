/* awesome-mas · MAS Office — pure model functions.
   Loaded by the browser (window.MASModel) and by Node tests (module.exports).
   Everything here is side-effect free so it can be tested without a DOM. */
(function () {
  'use strict';

  const QUESTIONS = [
    'What should your assistant help you do?',
    'Your preferences and limits?',
    'What does a good result look like? How will you judge it?',
    'Will you do this again? How often?',
    'Any of your own material to use? (put files in raw/)'
  ];
  const TOOLS = ['web search', 'read my files'];
  const STATES = ['idle', 'waiting', 'working', 'handoff', 'flagged', 'done'];
  const REQUESTS_HEADER = '# Requests from the panel';
  const LOCK_LINE = '- [ ] lock';
  const ROLE_COLORS = ['#E8735A', '#2F9E8F', '#E2A23B', '#8E6BB8', '#4D8FD1', '#7AAE5B', '#D9668C', '#C2703D'];
  const GROUP_COLORS = ['#E8735A', '#2F9E8F', '#E2A23B', '#8E6BB8', '#4D8FD1', '#7AAE5B'];
  const EVIDENCE = { A: 'Can be bought or run', B: 'Study with data', C: 'Demo or marketing', D: 'Opinion' };

  const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
  const oneLine = (s) => String(s == null ? '' : s).replace(/\s*\n\s*/g, ' ').trim();

  function hash(str) {
    let h = 2166136261;
    for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const colorFor = (id) => (id === 'lead' ? '#3D5A80' : ROLE_COLORS[hash(id) % ROLE_COLORS.length]);

  /* ---------- ids ---------- */
  function slugify(name) {
    const s = String(name || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return s || 'role';
  }
  function uniqueId(name, taken) {
    const set = new Set(taken || []);
    set.add('lead');
    const base = slugify(name);
    let id = base, n = 2;
    while (set.has(id)) id = base + '-' + n++;
    return id;
  }

  /* ---------- structure helpers ---------- */
  function roleName(s, id) {
    const lead = (s && s.lead) || {};
    if (!id || id === 'lead') return lead.name || 'Lead';
    const r = ((s && s.roles) || []).find((x) => x.id === id);
    return r ? r.name : id;
  }
  function member(s, id) {
    if (!s) return null;
    if (id === 'lead') return s.lead || null;
    return (s.roles || []).find((r) => r.id === id) || null;
  }
  // Groups in run order: follow the `after` chain; unreachable groups keep array order at the end.
  function orderGroups(s) {
    const groups = (s && s.groups) || [];
    const out = [], seen = new Set();
    let frontier = groups.filter((g) => !g.after || !groups.some((x) => x.id === g.after));
    while (frontier.length) {
      frontier.forEach((g) => { if (!seen.has(g.id)) { seen.add(g.id); out.push(g); } });
      frontier = groups.filter((g) => !seen.has(g.id) && seen.has(g.after));
    }
    groups.forEach((g) => { if (!seen.has(g.id)) out.push(g); });
    return out;
  }
  function groupCaption(g, index) {
    return (index > 0 ? 'then ' : '') + g.id + ' · ' + (g.label || 'Group ' + g.id);
  }
  function zoneCaption(g, count) {
    if (g.after) return g.id + ' · after ' + g.after;
    return g.id + (count > 1 ? ' · in parallel' : ' · first');
  }
  function receivesFrom(s, id) {
    return ((s && s.roles) || []).filter((r) => (r.handsTo || 'lead') === id && r.id !== id).map((r) => r.id);
  }

  /* ---------- markdown + js serialisation (formats.md) ---------- */
  function structureToMarkdown(s) {
    const lead = s.lead || {};
    const head = (emoji, name) => (emoji ? emoji + ' ' : '') + name;
    const L = [];
    L.push('# ' + head(lead.emoji, (s.title || 'My team') + ' — ' + (lead.name || 'Lead')));
    L.push('- job: ' + oneLine(lead.job));
    L.push('- serves: ' + (lead.serves || []).join(', '));
    (s.roles || []).forEach((r) => {
      L.push('## ' + head(r.emoji, oneLine(r.name)));
      L.push('- serves: ' + (r.serves || []).join(', '));
      L.push('- job: ' + oneLine(r.job));
      if (r.why) L.push('- why: ' + oneLine(r.why));
      L.push('- tools: ' + ((r.tools || []).length ? r.tools.join(', ') : 'none'));
      L.push('- group: ' + (r.group || ''));
      L.push('- hands to: ' + roleName(s, r.handsTo || 'lead'));
    });
    return L.join('\n') + '\n';
  }
  const structureToJs = (s) => 'window.MAS_STRUCTURE = ' + JSON.stringify(s, null, 2) + ';\n';

  function answersToMarkdown(answers) {
    const L = ['# My answers'];
    QUESTIONS.forEach((q, i) => { L.push((i + 1) + '. ' + q); L.push(String((answers || [])[i] || '').trim()); });
    return L.join('\n') + '\n';
  }
  function parseAnswers(md) {
    const buf = QUESTIONS.map(() => []);
    let cur = -1;
    String(md || '').replace(/\r/g, '').split('\n').forEach((line) => {
      const m = line.match(/^(\d)\.\s+(.*)$/);
      const q = m && QUESTIONS[Number(m[1]) - 1];
      if (q && m[2].trim() === q) { cur = Number(m[1]) - 1; return; }
      if (cur >= 0 && !/^# My answers/.test(line)) buf[cur].push(line);
    });
    return buf.map((b) => b.join('\n').trim());
  }
  function appendRequest(existing, line) {
    let text = existing && existing.trim() ? existing : REQUESTS_HEADER + '\n';
    if (line === LOCK_LINE && text.split('\n').some((l) => l.trim() === LOCK_LINE)) return text;
    if (!text.endsWith('\n')) text += '\n';
    return text + line + '\n';
  }
  const refineLine = (text) => '- [ ] refine: ' + oneLine(text);

  /* ---------- editing (pure: returns a new structure) ---------- */
  function pruneGroups(s) {
    const used = new Set((s.roles || []).map((r) => r.group));
    const groups = s.groups || [];
    const byId = Object.fromEntries(groups.map((g) => [g.id, g]));
    const keep = groups.filter((g) => used.has(g.id));
    const keepIds = new Set(keep.map((g) => g.id));
    keep.forEach((g) => { // re-link `after` past removed groups
      let a = g.after;
      while (a && !keepIds.has(a)) a = byId[a] ? byId[a].after : null;
      g.after = a || null;
    });
    s.groups = keep;
    return s;
  }
  function nextGroupId(s) {
    const ids = new Set((s.groups || []).map((g) => g.id));
    for (let i = 0; i < 26; i++) { const id = String.fromCharCode(65 + i); if (!ids.has(id)) return id; }
    return 'G' + ids.size;
  }
  function addGroup(s, label) {
    const out = clone(s);
    out.groups = out.groups || [];
    const order = orderGroups(out);
    const id = nextGroupId(out);
    out.groups.push({ id, label: label || 'Next step', after: order.length ? order[order.length - 1].id : null });
    return { structure: out, groupId: id };
  }
  function addRole(s, name, groupId) {
    const out = clone(s);
    out.roles = out.roles || [];
    out.groups = out.groups || [];
    const id = uniqueId(name, out.roles.map((r) => r.id));
    let group = groupId || (orderGroups(out)[0] || {}).id;
    if (!group) { group = 'A'; out.groups.push({ id: 'A', label: 'Work', after: null }); }
    out.roles.push({ id, name: oneLine(name) || 'New role', emoji: '🙂', serves: [], job: '', tools: [], group, handsTo: 'lead', why: '' });
    return { structure: out, id };
  }
  function updateMember(s, id, patch) {
    const out = clone(s);
    const m = id === 'lead' ? out.lead : (out.roles || []).find((r) => r.id === id);
    if (m) Object.keys(patch).forEach((k) => { if (k !== 'id') m[k] = patch[k]; });
    return pruneGroups(out);
  }
  function deleteRole(s, id) {
    const out = clone(s);
    const gone = (out.roles || []).find((r) => r.id === id);
    if (!gone) return out;
    out.roles = out.roles.filter((r) => r.id !== id);
    out.roles.forEach((r) => { if (r.handsTo === id) r.handsTo = gone.handsTo && gone.handsTo !== r.id ? gone.handsTo : 'lead'; });
    return pruneGroups(out);
  }

  /* ---------- checks ---------- */
  function coverage(s, task) {
    const reqIds = ((task && task.requirements) || []).map((r) => r.id);
    const servedBy = Object.fromEntries(reqIds.map((id) => [id, []]));
    const people = s ? [s.lead || {}].concat(s.roles || []) : [];
    const rolesWithoutReq = [], unknownRefs = [];
    people.forEach((p) => {
      const valid = (p.serves || []).filter((r) => !reqIds.length || reqIds.includes(r));
      (p.serves || []).forEach((r) => {
        if (servedBy[r]) servedBy[r].push(p.id || 'lead');
        else if (reqIds.length) unknownRefs.push({ id: p.id || 'lead', req: r });
      });
      if (p.id && p.id !== 'lead' && !valid.length) rolesWithoutReq.push(p.id);
    });
    const unservedReqs = s ? reqIds.filter((id) => !servedBy[id].length) : [];
    return { servedBy, rolesWithoutReq, unservedReqs, unknownRefs };
  }
  function costInfo(roleCount) {
    const agents = Math.max(0, roleCount | 0) + 1;
    return {
      agents,
      text: agents + (agents === 1 ? ' agent' : ' agents') + ' ≈ ' + agents + '× the tokens of one assistant',
      sub: 'Lead + ' + (agents - 1) + (agents === 2 ? ' role' : ' roles'),
      level: agents <= 3 ? 'calm' : agents <= 5 ? 'warm' : 'hot',
      fraction: Math.min(agents / 10, 1)
    };
  }

  /* ---------- progress ---------- */
  function deriveProgress(d) {
    const st = (d && d.state) || {};
    const s = d && d.structure;
    const derived = !d.task ? 1 : !s ? 2 : !s.locked ? 3 : 4;
    const n = Number(st.step);
    let step = n >= 1 && n <= 4 ? Math.max(n, derived) : derived;
    if (s && !s.locked) step = Math.min(step, 3);
    if (!d.task) step = 1;
    const done = st.phase === 'done' && step === 4;
    return { step, done, started: !!(d.env || d.state || d.task) };
  }
  function viewForProgress(p, hasResult) {
    if (p.step < 4) return 'design';
    return p.done && hasResult ? 'result' : 'office';
  }
  // Wrap the command the student should type in <code>. Input is escaped first.
  function formatHint(text) {
    return esc(text || 'Type next in your assistant to start.')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/(\b[Tt]ype\s+)(run again|next|unlock|run)\b/g, '$1<code>$2</code>');
  }
  function hintCommand(text) {
    const m = String(text || '').match(/`([^`]+)`/) || String(text || '').match(/\b[Tt]ype\s+(run again|next|unlock|run)\b/);
    return m ? m[1] : 'next';
  }

  /* ---------- safe markdown ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function safeHref(url, resolve) {
    const u = String(url).trim();
    if (/^(https?:|mailto:)/i.test(u) || u.startsWith('#')) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith('//')) return null;
    return resolve ? resolve(u) : u;
  }
  function emphasis(t) {
    return t.replace(/\*\*(?=\S)(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(?=\S)(.+?)__/g, '<strong>$1</strong>')
      .replace(/(^|[^\w*])\*(?=\S)([^*]+?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/(^|[^\w])_(?=\S)([^_]+?)_(?!\w)/g, '$1<em>$2</em>');
  }
  function inlineMd(text, opts) {
    const re = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
    const out = [];
    let last = 0, m;
    while ((m = re.exec(text))) {
      out.push(emphasis(esc(text.slice(last, m.index))));
      if (m[1] != null) out.push('<code>' + esc(m[1]) + '</code>');
      else {
        const href = safeHref(m[3], opts && opts.resolveLink);
        const label = emphasis(esc(m[2]));
        out.push(href == null ? label : '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>');
      }
      last = re.lastIndex;
    }
    out.push(emphasis(esc(text.slice(last))));
    return out.join('');
  }
  function renderMarkdown(md, opts) {
    const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    const isSep = (l) => l != null && l.includes('-') && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
    const isHr = (l) => /^\s*([-*_])(\s*\1){2,}\s*$/.test(l);
    const listRe = /^\s*([-*+]|\d+[.)])\s+/;
    const startsBlock = (l, n) => /^#{1,6}\s/.test(l) || listRe.test(l) || /^>/.test(l) || isHr(l) || (l.includes('|') && isSep(n));
    const row = (l) => { let s = l.trim(); if (s.startsWith('|')) s = s.slice(1); if (s.endsWith('|')) s = s.slice(0, -1); return s.split('|').map((c) => c.trim()); };
    let i = 0, m;
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { i++; continue; }
      if ((m = l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))) {
        html.push('<h' + m[1].length + '>' + inlineMd(m[2], opts) + '</h' + m[1].length + '>'); i++; continue;
      }
      if (isHr(l)) { html.push('<hr>'); i++; continue; }
      if (l.includes('|') && isSep(lines[i + 1])) {
        const head = row(l);
        const al = row(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : ''));
        const cell = (tag, c, j) => '<' + tag + (al[j] ? ' style="text-align:' + al[j] + '"' : '') + '>' + inlineMd(c || '', opts) + '</' + tag + '>';
        const body = [];
        i += 2;
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')) body.push(row(lines[i++]));
        html.push('<div class="md-table"><table><thead><tr>' + head.map((c, j) => cell('th', c, j)).join('') + '</tr></thead><tbody>' +
          body.map((r) => '<tr>' + head.map((_, j) => cell('td', r[j], j)).join('') + '</tr>').join('') + '</tbody></table></div>');
        continue;
      }
      if (listRe.test(l)) {
        const ordered = /^\s*\d/.test(l);
        const itemRe = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
        const items = [];
        while (i < lines.length && (m = lines[i].match(itemRe))) {
          let t = m[1]; i++;
          while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !listRe.test(lines[i])) t += ' ' + lines[i++].trim();
          items.push('<li>' + inlineMd(t, opts) + '</li>');
        }
        const tag = ordered ? 'ol' : 'ul';
        html.push('<' + tag + '>' + items.join('') + '</' + tag + '>');
        continue;
      }
      if (/^>/.test(l)) {
        const q = [];
        while (i < lines.length && /^>/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
        html.push('<blockquote>' + inlineMd(q.join(' '), opts) + '</blockquote>');
        continue;
      }
      const para = [l.trim()];
      i++;
      while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], lines[i + 1])) para.push(lines[i++].trim());
      html.push('<p>' + inlineMd(para.join(' '), opts) + '</p>');
    }
    return html.join('\n');
  }

  /* ---------- data files ---------- */
  // Evaluate a data file (`window.MAS_X = {...}`) against a fresh object instead of the real window.
  function evalDataFile(text) {
    const win = {};
    new Function('window', String(text))(win); // eslint-disable-line no-new-func
    return win;
  }
  function pushSay(history, id, status, max) {
    if (!status || !status.say) return false;
    const list = history[id] || (history[id] = []);
    const last = list[list.length - 1];
    if (last && last.say === status.say && last.state === status.state) return false;
    list.push({ say: status.say, state: status.state, at: Date.now() });
    while (list.length > (max || 5)) list.shift();
    return true;
  }
  function timeAgo(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 5) return 'just now';
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    return Math.floor(s / 86400) + ' d ago';
  }

  /* ---------- demo ---------- */
  const DEMO_LINES = {
    lead: { plan: 'Planning the run', final: 'Writing the shortlist' },
    'retail-finder': { says: ['Searching Currys…', 'Currys: £279, free delivery', 'Checking John Lewis…', 'John Lewis: £289, next day', 'Saving 2 source cards'] },
    'marketplace-finder': { says: ['Searching eBay…', 'eBay seller X: £249 + £15 post', 'Checking Amazon sellers…', 'Saving a source card'] },
    'catch-checker': { says: ['Reading 3 offers…', 'Checking eBay seller X…', 'Checking delivery times…', 'Checking shipping costs…'], flag: 'eBay seller X: refurbished' }
  };
  function genericSays(r) {
    const job = oneLine(r.job);
    return [(job.length > 40 ? job.slice(0, 38) + '…' : job) || 'Getting started…', 'Looking for good sources…', 'Saving a source card', 'Checking my notes…'];
  }
  function buildDemoScript(s) {
    const roles = (s && s.roles) || [];
    const groups = orderGroups(s).filter((g) => roles.some((r) => r.group === g.id));
    const ev = [];
    const push = (t, id, state, say, extra) => ev.push({ t: Math.round(t * 100) / 100, id, status: Object.assign({ state, say: say || '', to: null, flag: null }, extra) });
    const ids = ['lead'].concat(roles.map((r) => r.id));
    const lead = DEMO_LINES.lead;
    ids.forEach((id) => push(0, id, 'idle', ''));
    push(1.5, 'lead', 'working', lead.plan);
    push(3.5, 'lead', 'working', 'Handing out the work');
    roles.forEach((r) => push(3.5, r.id, 'waiting', 'Waiting for my turn'));
    push(7, 'lead', 'waiting', 'Waiting for the team');
    const START = 7, END = 35, span = (END - START) / Math.max(groups.length, 1);
    const flagRole = roles.find((r) => DEMO_LINES[r.id] && DEMO_LINES[r.id].flag) || roles.find((r) => /check|review|verif/i.test(r.id + ' ' + r.name));
    groups.forEach((g, gi) => {
      const g0 = START + gi * span;
      roles.filter((r) => r.group === g.id).forEach((r, ri) => {
        const lines = DEMO_LINES[r.id] || {};
        const says = lines.says || genericSays(r);
        const w0 = g0 + ri * 0.6, hand = g0 + span * 0.68 + ri * 1.6;
        const fw = r === flagRole ? [g0 + span * 0.25, g0 + span * 0.5] : null;
        says.forEach((say, k) => {
          const t = w0 + ((hand - 0.8 - w0) * k) / says.length;
          if (!fw || t < fw[0] || t >= fw[1]) push(t, r.id, 'working', say);
        });
        if (fw) {
          push(fw[0], r.id, 'flagged', 'Found a problem', { flag: lines.flag || 'Something needs a second look' });
          push(fw[1], r.id, 'working', 'Noted it — carrying on');
        }
        const to = r.handsTo || 'lead';
        push(hand, r.id, 'handoff', 'Passing my notes to ' + roleName(s, to), { to });
        push(hand + 3.6, r.id, 'done', 'Finished');
      });
    });
    push(36, 'lead', 'working', lead.final);
    ids.forEach((id) => push(41, id, 'done', 'Finished'));
    ev.sort((a, b) => a.t - b.t);
    return { length: 48, events: ev };
  }
  function demoStatusesAt(script, t) {
    const tt = ((t % script.length) + script.length) % script.length;
    const out = {};
    for (const e of script.events) { if (e.t > tt) break; out[e.id] = e.status; }
    return out;
  }

  // Fallback data for ?demo=1 when no project data is found (same as office/tests/fixtures/mock-price-compare).
  const DEMO_DATA = {
    env: { tool: 'Claude Code', os: 'macOS', canWrite: true, canSearch: true, subagents: 'parallel' },
    state: { step: 4, phase: 'running', next: 'Watch your team work — then open the Result tab.', version: 1, locked: true },
    task: { title: 'Headphone deal finder', summary: 'Find the best UK deal on noise-cancelling headphones under £300.', repeat: 'Monthly',
      requirements: [{ id: 'R1', text: 'Cheapest new price in the UK' }, { id: 'R2', text: 'New only (no refurbished), delivered within 3 days' },
        { id: 'R3', text: 'Total under £300 including shipping' }, { id: 'R4', text: 'A short buying shortlist I can act on' }] },
    structure: { title: 'Headphone deal finder', version: 1, locked: true,
      rationale: 'Two finders search different kinds of shop at the same time (R1). A separate checker guards R2 and R3 because mistakes there cost money. The Lead writes the shortlist (R4).',
      lead: { id: 'lead', name: 'Lead', emoji: '🧭', job: 'Combine the checked offers into a buying shortlist', serves: ['R4'] },
      groups: [{ id: 'A', label: 'Search in parallel', after: null }, { id: 'B', label: 'Check', after: 'A' }],
      roles: [
        { id: 'retail-finder', name: 'Retail finder', emoji: '🔎', serves: ['R1'], job: 'Search major UK retailers for the lowest new price', tools: ['web search'], group: 'A', handsTo: 'catch-checker' },
        { id: 'marketplace-finder', name: 'Marketplace finder', emoji: '🛒', serves: ['R1'], job: 'Search eBay and Amazon marketplace sellers', tools: ['web search'], group: 'A', handsTo: 'catch-checker' },
        { id: 'catch-checker', name: 'Catch checker', emoji: '🛡️', serves: ['R2', 'R3'], job: 'Flag refurbished stock, parallel imports and hidden shipping', tools: ['web search'], group: 'B', handsTo: 'lead' }] },
    result: null
  };

  const api = {
    QUESTIONS, TOOLS, STATES, EVIDENCE, LOCK_LINE, REQUESTS_HEADER, GROUP_COLORS, DEMO_DATA,
    clone, oneLine, esc, hash, colorFor, slugify, uniqueId, roleName, member, orderGroups, groupCaption, zoneCaption, receivesFrom,
    structureToMarkdown, structureToJs, answersToMarkdown, parseAnswers, appendRequest, refineLine,
    pruneGroups, addGroup, addRole, updateMember, deleteRole, coverage, costInfo,
    deriveProgress, viewForProgress, formatHint, hintCommand, renderMarkdown, evalDataFile, pushSay, timeAgo,
    buildDemoScript, demoStatusesAt
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.MASModel = api;
})();
