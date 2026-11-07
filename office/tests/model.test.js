// Run: node office/tests/model.test.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../model.js');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok  ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + e.message.split('\n').join('\n       ')); }
}
const EXAMPLES = path.join(__dirname, '..', '..', 'examples');
const S = M.DEMO_DATA.structure;
const TASK = { requirements: [{ id: 'R1', text: 'a' }, { id: 'R2', text: 'b' }, { id: 'R3', text: 'c' }, { id: 'R4', text: 'd' }] };

console.log('model.js');

test('the panel is passive: no writing helpers are exported', () => {
  ['structureToMarkdown', 'answersToMarkdown', 'appendRequest', 'addRole', 'deleteRole', 'uniqueId'].forEach((k) => assert.strictEqual(M[k], undefined, k));
});

test('say → screen activity keyword mapping', () => {
  const act = (say, state) => M.activityFor({ state: state || 'working', say });
  assert.strictEqual(act('Searching Currys…'), 'search');
  assert.strictEqual(act('Looking at eBay sellers'), 'search');
  assert.strictEqual(act('Browsing Amazon sellers…'), 'search');
  assert.strictEqual(act('Reading 3 offers…'), 'check');
  assert.strictEqual(act('Re-checking delivery times'), 'check');
  assert.strictEqual(act('Verifying shipping costs…'), 'check');
  assert.strictEqual(act('Currys: £279, free delivery'), 'sheet');
  assert.strictEqual(act('Adding up delivery costs'), 'sheet');
  assert.strictEqual(act('Calculating the total'), 'sheet');
  assert.strictEqual(act('Writing the shortlist'), 'write');
  assert.strictEqual(act('Drafting a summary'), 'write');
  assert.strictEqual(act('Combining both lists'), 'write');
  assert.strictEqual(act('Planning the run'), 'plan');
  assert.strictEqual(act('Scheduling day 2'), 'plan');
  assert.strictEqual(act('Saving 2 source cards'), 'type', 'fallback is typing');
  assert.strictEqual(act('Result ready'), 'type', '"ready" is not "read"');
  assert.strictEqual(act('搜索 Currys 黑五优惠'), 'search');
  assert.strictEqual(act('核验 HDMI 2.1'), 'check');
  assert.strictEqual(act('anything', 'waiting'), 'screensaver');
  assert.strictEqual(act('Finished', 'done'), 'done');
  assert.strictEqual(act('', 'idle'), 'off');
  assert.strictEqual(M.activityFor(null), 'off');
});

test('elapsed time formatting', () => {
  assert.deepStrictEqual([0, 999, 45000, 80000, 605000, 3725000].map(M.formatElapsed), ['0s', '0s', '45s', '1m 20s', '10m 05s', '1h 02m']);
  assert.strictEqual(M.formatElapsed(-5), '0s');
});

test('run clock formatting', () => {
  assert.deepStrictEqual([0, 7000, 84000, 723000, 3723000].map(M.formatClock), ['0:00', '0:07', '1:24', '12:03', '1:02:03']);
});

test('progress is clamped, missing progress is null', () => {
  assert.deepStrictEqual([50, 120, -3, '40', 33.6, undefined, null, 'x'].map(M.clampProgress), [50, 100, 0, 40, 34, null, null, null]);
});

test('team progress strip', () => {
  let t = M.teamProgress(S, { 'retail-finder': { state: 'working' }, 'marketplace-finder': { state: 'flagged' }, 'catch-checker': { state: 'waiting' } });
  assert.deepStrictEqual([t.done, t.total, t.text], [0, 3, 'Group A · 2 working in parallel']);
  t = M.teamProgress(S, { 'retail-finder': { state: 'done' }, 'marketplace-finder': { state: 'done' }, 'catch-checker': { state: 'working' } });
  assert.deepStrictEqual([t.done, t.text, Math.round(t.fraction * 100)], [2, 'Group B · 1 working', 67]);
  assert.strictEqual(M.teamProgress(S, { lead: { state: 'working' } }).text, 'Lead is working');
  assert.strictEqual(M.teamProgress(S, {}).text, 'Nobody is working right now');
  assert.strictEqual(M.teamProgress(null, {}).total, 0);
});

test('status line follows MAS_STATE.phase, else the files', () => {
  assert.strictEqual(M.phaseLine({ state: { phase: 'refine' } }), 'Your team design is ready. Refine it by chatting with your assistant.');
  assert.strictEqual(M.phaseLine({ state: { phase: 'running' } }), 'Your team is working.');
  assert.strictEqual(M.phaseLine({}), 'Waiting for your assistant. Say hi to it to start.');
  assert.strictEqual(M.phaseLine({ task: {}, structure: { locked: true } }), 'Team locked. Ready to run.');
  assert.strictEqual(M.phaseLine({ task: {}, structure: { locked: true }, result: {} }), 'Result ready.');
});

test('status changes are compared by content, not timestamps', () => {
  assert.strictEqual(M.statusKey({ state: 'working', say: 'a', t: '1' }), M.statusKey({ state: 'working', say: 'a', t: '2' }));
  assert.notStrictEqual(M.statusKey({ state: 'working', say: 'a' }), M.statusKey({ state: 'working', say: 'b' }));
});

test('cost text', () => {
  assert.strictEqual(M.costInfo(3).text, '4 agents ≈ 4× the tokens of one assistant');
  assert.strictEqual(M.costInfo(0).text, '1 agent ≈ 1× the tokens of one assistant');
  assert.deepStrictEqual([2, 4, 6].map((n) => M.costInfo(n).level), ['calm', 'warm', 'hot']);
});

test('markdown renderer escapes HTML', () => {
  const html = M.renderMarkdown('Hi <script>alert(1)</script> **b** [x](javascript:alert(1)) <img src=x onerror=alert(1)>');
  assert.ok(!html.includes('<script') && !html.includes('<img') && !/href="javascript/i.test(html), html);
  assert.ok(html.includes('&lt;script&gt;') && html.includes('<strong>b</strong>'), html);
});

test('markdown renderer: table, headings, lists, links', () => {
  const md = '## Shortlist\n| Shop | Total |\n|---|---:|\n| Currys | **£279** |\n| eBay "X" | `£264` |\n\n- one *it*\n- [card](../sources/a.md)\n\n1. first\n2. second';
  const html = M.renderMarkdown(md, { resolveLink: (u) => 'ROOT/' + u });
  assert.ok(html.includes('<h2>Shortlist</h2>'));
  assert.ok(html.includes('<th style="text-align:right">Total</th>') && html.includes('<td style="text-align:right"><strong>£279</strong></td>'), html);
  assert.ok(html.includes('<td>eBay &quot;X&quot;</td>') && html.includes('<code>£264</code>'), html);
  assert.ok(html.includes('<li>one <em>it</em></li>') && html.includes('href="ROOT/../sources/a.md"'), html);
  assert.ok(html.includes('<ol><li>first</li><li>second</li></ol>'));
});

test('renders the example results', () => {
  ['price-compare', 'trip-planning'].forEach((ex) => {
    const f = path.join(EXAMPLES, ex, 'outputs', 'result.js');
    if (!fs.existsSync(f)) return;
    const r = M.evalDataFile(fs.readFileSync(f, 'utf8')).MAS_RESULT;
    assert.ok(M.renderMarkdown(r.markdown).length > 100, ex);
  });
});

test('requirement coverage', () => {
  const s = M.clone(S);
  s.roles[2].serves = [];
  const c = M.coverage(s, TASK);
  assert.deepStrictEqual(c.rolesWithoutReq, ['catch-checker']);
  assert.deepStrictEqual(c.unservedReqs, ['R2', 'R3']);
  assert.deepStrictEqual(M.coverage(S, TASK).servedBy.R1, ['retail-finder', 'marketplace-finder']);
});

test('progress steps', () => {
  assert.deepStrictEqual(M.deriveProgress({}), { step: 1, done: false, started: false });
  assert.strictEqual(M.deriveProgress({ task: {}, structure: { locked: false }, state: { step: 4 } }).step, 3);
  const p = M.deriveProgress({ task: {}, structure: { locked: true }, state: { step: 4, phase: 'done' } });
  assert.deepStrictEqual([p.step, p.done], [4, true]);
});

test('demo script: parallel at ~8 s with progress, flag at ~25 s, all done, loops', () => {
  const sc = M.buildDemoScript(S);
  const at = (t) => M.demoStatusesAt(sc, t);
  assert.ok(Object.values(at(0.5)).every((x) => x.state === 'idle'));
  assert.strictEqual(at(3).lead.say, 'Planning the run');
  assert.strictEqual(at(6)['catch-checker'].state, 'waiting');
  assert.strictEqual(at(8)['retail-finder'].state, 'working');
  assert.strictEqual(at(8)['marketplace-finder'].state, 'working');
  assert.ok(at(12)['retail-finder'].progress > at(8)['retail-finder'].progress, 'progress grows');
  assert.notStrictEqual(M.activityFor(at(8)['retail-finder']), 'type');
  assert.strictEqual(at(17)['retail-finder'].state, 'handoff');
  assert.strictEqual(at(17)['retail-finder'].to, 'catch-checker');
  assert.strictEqual(at(25)['catch-checker'].state, 'flagged');
  assert.strictEqual(at(25)['catch-checker'].flag, 'eBay seller X: refurbished');
  assert.strictEqual(at(37).lead.say, 'Writing the shortlist');
  assert.strictEqual(M.activityFor(at(37).lead), 'write');
  assert.ok(Object.values(at(44)).every((x) => x.state === 'done' && x.progress === 100));
  assert.ok(Object.values(at(60)).every((x) => x.state === 'done'), 'after-work tail before the loop');
  assert.ok(Object.values(at(74.5)).every((x) => x.state === 'idle'), 'loops');
});

test('demo work summaries cover every member, generic for unknown roles', () => {
  const s = { lead: { id: 'lead', name: 'Lead' }, groups: [{ id: 'A' }], roles: [{ id: 'x', name: 'X', job: 'Find flights', group: 'A', handsTo: 'lead' }] };
  const w = M.demoWork(s);
  assert.deepStrictEqual(w.map((e) => e.by), ['lead', 'x']);
  assert.ok(w[1].summary.includes('Find flights') && w[1].summary.includes('Lead'));
  assert.ok(M.demoWork(S).find((e) => e.by === 'catch-checker').summary.includes('refurbished'));
});

test('demo script works with three groups and two roles handing to lead', () => {
  const f = path.join(EXAMPLES, 'trip-planning', 'mas', 'structure.js');
  if (!fs.existsSync(f)) return;
  const s = M.evalDataFile(fs.readFileSync(f, 'utf8')).MAS_STRUCTURE;
  const sc = M.buildDemoScript(s);
  const states = (t) => M.demoStatusesAt(sc, t);
  assert.strictEqual(states(9)['sights-finder'].state, 'working');
  assert.strictEqual(states(9)['travel-finder'].state, 'working');
  assert.strictEqual(states(23)['day-planner'].state, 'handoff');
  assert.strictEqual(states(27)['day-planner'].state, 'done');
  assert.ok(['working', 'flagged'].includes(states(30)['budget-clash-checker'].state));
});

test('say history keeps the last 5 distinct messages', () => {
  const h = {};
  ['a', 'a', 'b', 'c', 'd', 'e', 'f'].forEach((say) => M.pushSay(h, 'x', { state: 'working', say }));
  assert.deepStrictEqual(h.x.map((e) => e.say), ['b', 'c', 'd', 'e', 'f']);
});

test('data files evaluate against a fresh object', () => {
  const f = path.join(EXAMPLES, 'price-compare', 'mas', 'status', 'catch-checker.js');
  if (fs.existsSync(f)) assert.ok(M.evalDataFile(fs.readFileSync(f, 'utf8')).MAS_STATUS['catch-checker'].state);
  assert.throws(() => M.evalDataFile('window.X = {'));
});

test('result.work accepts an array or an object map', () => {
  assert.deepStrictEqual(M.normalizeWork([{ by: 'a', summary: '- x' }, { nope: 1 }]), [{ by: 'a', summary: '- x' }]);
  assert.deepStrictEqual(M.normalizeWork({ a: '- x', b: { summary: '- y' } }), [{ by: 'a', summary: '- x' }, { by: 'b', summary: '- y' }]);
  assert.deepStrictEqual(M.normalizeWork(undefined), []);
  assert.deepStrictEqual(M.normalizeWork('text'), []);
});

test('headline: one status sentence per moment', () => {
  const d = { structure: S, task: TASK, state: { phase: 'running' } };
  const w = (say) => ({ state: 'working', say });
  assert.strictEqual(M.headline(d, { 'retail-finder': w('Searching Currys'), 'marketplace-finder': w('Searching eBay') }), 'Retail finder and Marketplace finder are searching at the same time.');
  assert.strictEqual(M.headline(d, { 'catch-checker': { state: 'flagged', flag: 'x' } }), 'Catch checker flagged a problem.');
  assert.strictEqual(M.headline(d, { 'catch-checker': { state: 'handoff', to: 'lead' } }), 'Catch checker is handing work to the Lead.');
  assert.strictEqual(M.headline(d, { lead: w('Writing the shortlist') }), 'The Lead is writing.');
  assert.strictEqual(M.headline(Object.assign({}, d, { result: {} }), { lead: { state: 'done' } }), 'The result is ready.');
  assert.strictEqual(M.headline({ structure: Object.assign({}, S, { locked: false }) }, {}), 'Your team is drafted. Refine it in the chat.');
  assert.strictEqual(M.headline({ task: TASK }, {}), 'Your task is on the board.');
  assert.strictEqual(M.headline({}, {}), 'Say hi to your assistant to begin.');
});

function teamOf(n, groups) {
  const gs = Array.from({ length: groups }, (_, i) => ({ id: String.fromCharCode(65 + i), label: 'G' + i, after: i ? String.fromCharCode(64 + i) : null }));
  return { lead: { id: 'lead', name: 'Lead' }, groups: gs, roles: Array.from({ length: n }, (_, i) => ({ id: 'r' + i, name: 'Role ' + i, group: gs[i % groups].id, handsTo: 'lead' })) };
}
test('plan: desks never overlap and stay inside their rooms (1–8 roles, 1–4 groups)', () => {
  for (let n = 1; n <= 8; n++) for (let g = 1; g <= Math.min(4, n); g++) {
    const plan = M.planOffice(teamOf(n, g));
    const boxes = Object.keys(plan.desks).map((id) => Object.assign({ id }, plan.desks[id].desk));
    boxes.forEach((a, i) => boxes.slice(i + 1).forEach((b) => assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.d <= b.y || b.y + b.d <= a.y, n + '/' + g + ' ' + a.id + '×' + b.id)));
    Object.keys(plan.desks).forEach((id) => {
      const d = plan.desks[id], room = plan.rooms.find((r) => r.id === d.room);
      assert.ok(d.desk.x >= room.x0 && d.desk.x + d.desk.w <= room.x1 && d.desk.y >= room.y0 && d.stand.y <= room.y1 + 0.01, n + '/' + g + ' ' + id);
    });
    assert.ok(plan.W <= 12.5, 'rooms wrap into rows');
  }
});

// Same projection and anchors as office.js: leaders start at the desk's front-left / back-right top corner.
function sheetFor(n, groups, U, width, height) {
  const C = Math.cos(Math.PI / 6), plan = M.planOffice(teamOf(n, groups));
  const O = [(width - (plan.W + plan.D) * C * U) / 2 + plan.D * C * U, 12 + 2.15 * U];
  const P = (x, y, z) => [O[0] + (x - y) * C * U, O[1] + (x + y) * 0.5 * U - z * U];
  const poly = M.convexHull([[0, 0], [plan.W, 0], [plan.W, plan.D], [0, plan.D]].flatMap(([x, y]) => [P(x, y, -0.3), P(x, y, 1.25)]));
  const items = Object.keys(plan.desks).map((id) => {
    const d = plan.desks[id].desk, c = P(d.x + d.w / 2, d.y + d.d / 2, d.h);
    return { id, ax: c[0], ay: c[1], left: P(d.x, d.y + d.d, d.h), right: P(d.x + d.w, d.y, d.h) };
  });
  return { plan, poly, items };
}
function fitLabels(n, groups, width, height) {
  for (let U = 70; U >= 20; U *= 0.94) {
    const sh = sheetFor(n, groups, U, width, height);
    const res = M.layoutLabels(sh.items, { width, height, poly: sh.poly, lw: 214, lh: 92 });
    if (res.ok) return Object.assign({ U }, sh, res);
  }
  return null;
}
test('labels: collision-free beside the drawing for 1–8 roles at 1440×900', () => {
  const width = 920, height = 640;
  for (let n = 1; n <= 8; n++) {
    const r = fitLabels(n, Math.min(3, n), width, height);
    assert.ok(r, 'a layout exists for n=' + n);
    const L = r.labels;
    assert.strictEqual(L.length, n + 1);
    L.forEach((a, i) => {
      assert.ok(a.x >= 0 && a.x + a.w <= width && a.y >= 0 && a.y + a.h <= height, 'inside the area');
      L.slice(i + 1).forEach((b) => assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y, 'labels overlap at n=' + n));
      for (let y = a.y; y <= a.y + a.h; y += 4) { const q = M.polyXRange(r.poly, y); if (q) assert.ok(a.x + a.w <= q[0] || a.x >= q[1], 'label over the drawing at n=' + n); }
    });
    assert.ok(r.U >= 26 || n > 6, 'figures stay large for small teams (U=' + r.U.toFixed(1) + ', n=' + n + ')');
  }
});

test('leaders: one elbow each, from the desk, and no two leaders cross (1–8 roles)', () => {
  for (let n = 1; n <= 8; n++) for (let g = 1; g <= Math.min(3, n); g++) {
    const r = fitLabels(n, g, 920, 640);
    assert.ok(r, 'layout for n=' + n + '/' + g);
    r.labels.forEach((l) => {
      const it = r.items.find((x) => x.id === l.id);
      assert.deepStrictEqual(l.path[0], it[l.side], 'anchored at the desk corner on its side');
      assert.strictEqual(l.path.length, 3, 'anchor → elbow → label');
      assert.strictEqual(l.path[1][1], l.path[2][1], 'last leg is horizontal');
      assert.ok(l.side === 'left' ? l.x + l.w < l.path[0][0] : l.x > l.path[0][0], 'label sits outside its own anchor, so the leader never strikes through it');
      assert.strictEqual(l.side === 'left' ? it.ax < Math.max(...r.poly.map((p) => p[0])) : true, true);
    });
    for (let i = 0; i < r.labels.length; i++) for (let j = i + 1; j < r.labels.length; j++)
      assert.ok(!M.pathsCross(r.labels[i].path, r.labels[j].path), 'leaders cross at n=' + n + '/' + g + ': ' + r.labels[i].id + ' × ' + r.labels[j].id);
  }
});

test('leaders steer around other roles: crossings never increase vs. the plain layout (1–8 roles)', () => {
  const width = 920, height = 640, lines = [];
  let before = 0, after = 0;
  for (let n = 1; n <= 8; n++) for (let g = 1; g <= Math.min(3, n); g++) {
    for (let U = 70; U >= 20; U *= 0.94) {
      const sh = sheetFor(n, g, U, width, height);
      const ids = sh.items.map((it) => it.id);
      const P = (() => { const C = Math.cos(Math.PI / 6), O = [(width - (sh.plan.W + sh.plan.D) * C * U) / 2 + sh.plan.D * C * U, 12 + 2.15 * U]; return (x, y, z) => [O[0] + (x - y) * C * U, O[1] + (x + y) * 0.5 * U - z * U]; })();
      const boxes = M.roleBoxes(sh.plan, ids, P, U);
      const opt = { width, height, poly: sh.poly, lw: 214, lh: 92, boxes };
      const plain = M.layoutLabels(sh.items, Object.assign({ avoid: false }, opt));
      const smart = M.layoutLabels(sh.items, opt);
      if (!plain.ok || !smart.ok) continue;
      const a = M.leaderCrossings(plain.labels, boxes), b = M.leaderCrossings(smart.labels, boxes);
      assert.ok(b <= a, 'more crossings at n=' + n + '/' + g + ': ' + a + ' → ' + b);
      for (let i = 0; i < smart.labels.length; i++) for (let j = i + 1; j < smart.labels.length; j++) assert.ok(!M.pathsCross(smart.labels[i].path, smart.labels[j].path), 'leaders cross');
      before += a; after += b; lines.push(n + '/' + g + ':' + a + '→' + b);
      break;
    }
  }
  console.log('       desk/figure crossings, plain → steered: ' + before + ' → ' + after + '  (' + lines.join(' ') + ')');
});

test('real run (pi-deals: 2 roles in A/B + lead) at a 650px drawing: both margins, clear of room names', () => {
  const s = { lead: { id: 'lead', name: 'Lead' }, groups: [{ id: 'A', label: 'Find offers', after: null }, { id: 'B', label: 'Check prices', after: 'A' }],
    roles: [{ id: 'reseller-finder', name: 'Reseller finder', group: 'A', handsTo: 'price-checker', serves: ['R1'] }, { id: 'price-checker', name: 'Price checker', group: 'B', handsTo: 'lead', serves: ['R3'] }] };
  const C = Math.cos(Math.PI / 6), width = 650, height = 640, plan = M.planOffice(s);
  let r = null;
  for (let U = 70; U >= 20 && !r; U *= 0.94) {
    const O = [(width - (plan.W + plan.D) * C * U) / 2 + plan.D * C * U, 12 + 2.15 * U];
    const P = (x, y, z) => [O[0] + (x - y) * C * U, O[1] + (x + y) * 0.5 * U - z * U];
    const poly = M.convexHull([[0, 0], [plan.W, 0], [plan.W, plan.D], [0, plan.D]].flatMap(([x, y]) => [P(x, y, -0.3), P(x, y, 1.25)]));
    const items = Object.keys(plan.desks).map((id) => { const d = plan.desks[id].desk, c = P(d.x + d.w / 2, d.y + d.d / 2, d.h); return { id, ax: c[0], ay: c[1], left: P(d.x, d.y + d.d, d.h), right: P(d.x + d.w, d.y, d.h) }; });
    const rooms = M.letterRooms(plan, P, U);
    const res = M.layoutLabels(items, { width, height, poly, lw: 190, lh: 92, boxes: M.roleBoxes(plan, Object.keys(plan.desks), P, U), obstacles: rooms.map((x) => x.poly) });
    if (res.ok) r = Object.assign({ rooms }, res);
  }
  assert.ok(r, 'a layout exists');
  assert.ok(r.labels.some((l) => l.side === 'left') && r.labels.some((l) => l.side === 'right'), 'both margins are used: ' + r.labels.map((l) => l.id + ':' + l.side).join(' '));
  r.labels.forEach((l) => r.rooms.forEach((q) => assert.ok(!M.polysOverlap([[l.x, l.y], [l.x + l.w, l.y], [l.x + l.w, l.y + l.h], [l.x, l.y + l.h]], q.poly), l.id + ' covers ' + q.text)));
  for (let i = 0; i < r.labels.length; i++) for (let j = i + 1; j < r.labels.length; j++) assert.ok(!M.pathsCross(r.labels[i].path, r.labels[j].path));
});

test('grid routes walk along the plan axes only', () => {
  const plan = M.planOffice(S);
  const a = plan.desks['retail-finder'].stand, b = plan.desks.lead.visit;
  let prev = a;
  M.gridRoute(plan, a, b).forEach((p) => { assert.ok(Math.abs(p.x - prev.x) < 1e-9 || Math.abs(p.y - prev.y) < 1e-9, 'axis-aligned leg'); prev = p; });
  assert.deepStrictEqual(prev, { x: b.x, y: b.y });
});

test('home/projects.js: several MAS in one folder', () => {
  assert.strictEqual(M.normalizeHome(undefined), null, 'no home file → legacy single-project layout');
  const h = M.normalizeHome({
    current: 'headphone-deals',
    projects: [
      { folder: 'headphone-deals', title: 'Headphone deal finder', step: 4, phase: 'done', agents: 4, runs: 1 },
      { folder: 'lisbon-trip' },
      { folder: 'headphone-deals', title: 'Duplicate — ignored' },
      { folder: '../escape' }, { folder: 'Upper-Case' }, { folder: '-dash-first' }, { folder: 'a'.repeat(65) }, { title: 'no folder' }, null,
      { folder: 'odd-fields', step: 9, agents: -2, runs: 'x', title: '  ' }
    ]
  });
  assert.deepStrictEqual(h.projects.map((p) => p.folder), ['headphone-deals', 'lisbon-trip', 'odd-fields']);
  assert.strictEqual(h.projects[0].title, 'Headphone deal finder', 'first entry for a folder wins');
  assert.deepStrictEqual(h.projects[1], { folder: 'lisbon-trip', title: 'lisbon-trip', step: null, phase: null, agents: null, runs: null });
  assert.deepStrictEqual([h.projects[2].step, h.projects[2].agents, h.projects[2].runs, h.projects[2].title], [null, null, null, 'odd-fields']);
  assert.strictEqual(h.current, 'headphone-deals');
  assert.strictEqual(M.normalizeHome({ current: 'not-listed-yet', projects: [] }).current, 'not-listed-yet', 'a valid current is kept before its entry exists');
  assert.strictEqual(M.normalizeHome({ current: '../etc', projects: [] }).current, null, 'an invalid current means "choosing"');
  assert.strictEqual(M.normalizeHome({ current: null }).current, null);
  assert.deepStrictEqual(M.normalizeHome({}).projects, []);
});

test('fixture: mock-home is a valid multi-MAS folder', () => {
  const base = path.join(__dirname, 'fixtures', 'mock-home');
  if (!fs.existsSync(base)) return;
  const h = M.normalizeHome(M.evalDataFile(fs.readFileSync(path.join(base, 'home', 'projects.js'), 'utf8')).MAS_HOME);
  assert.ok(h.projects.length >= 2);
  h.projects.forEach((p) => assert.ok(fs.existsSync(path.join(base, p.folder, 'me', 'task.js')), p.folder + ' has a task'));
  assert.ok(M.evalDataFile(fs.readFileSync(path.join(base, 'home', 'env.js'), 'utf8')).MAS_ENV.subagents);
});

test('after-work: lounge spots fit, never touch furniture, and no two figures overlap on screen (1–8 roles)', () => {
  const pose = (st) => (st.kind === 'sofa' ? 'sit' : st.kind === 'chat' ? 'chat-' + st.side : 'stand');
  for (let n = 1; n <= 8; n++) for (let g = 1; g <= Math.min(3, n); g++) {
    const plan = M.planOffice(teamOf(n, g)), need = n + 1, L = M.loungeLayout(plan, need);
    const all = L.stations.concat(L.party.ring, L.overflow);
    all.forEach((p) => {
      assert.ok(p.x > plan.lounge.x0 && p.x < plan.lounge.x1 && p.y > 0 && p.y < M.PLAN.BACK, 'inside the lounge');
      L.furniture.forEach((f) => assert.ok(!(p.x > f.x - 0.12 && p.x < f.x + f.w + 0.12 && p.y > f.y - 0.12 && p.y < f.y + f.d + 0.12), 'clear of ' + f.kind));
    });
    // after-work: every station and every overflow spot can be occupied at once
    const work = L.stations.map((st) => [st.id, M.figBox(st, pose(st))]).concat(L.overflow.map((p, i) => ['over-' + i, M.figBox(p, 'stand')]));
    // the party: everyone on the ring at once
    const party = L.party.ring.map((p, i) => ['ring-' + i, M.figBox(p, 'stand')]);
    [work, party].forEach((set) => set.forEach(([ia, a], i) => set.slice(i + 1).forEach(([ib, b]) => assert.ok(!M.boxesOverlap(a, b, 0), 'figures overlap at n=' + n + '/' + g + ': ' + ia + ' × ' + ib))));
    assert.ok(L.party.ring.length >= need, 'everyone fits round the party table at n=' + n);
    assert.ok(L.stations.length + L.overflow.length >= Math.min(need, 6), 'after-work room for the team at n=' + n);
    L.stations.filter((st) => st.pair).forEach((st) => assert.ok(L.stations.some((o) => o.id === st.pair), 'pairs are kept whole'));
    const cof = L.stations.filter((st) => st.kind === 'coffee');
    if (cof.length === 2) assert.ok(Math.hypot(cof[0].x - cof[1].x, cof[0].y - cof[1].y) >= 1.2 - 1e-9, 'coffee queue spaced along the counter');
  }
});

test('after-work scheduler: never double-books, only done figures, quiet while the team works', () => {
  const lounge = M.loungeLayout(M.planOffice(teamOf(8, 3)));
  for (let n = 1; n <= 8; n++) {
    const rng = M.seededRandom('sim-' + n), figs = Array.from({ length: n }, (_, i) => ({ id: 'f' + i, state: 'done', at: null }));
    for (let step = 0; step < 300; step++) {
      const f = figs[Math.floor(rng() * n)];
      const occupied = {};
      figs.forEach((x) => { if (x.at) occupied[x.at] = x.id; });
      const teamBusy = step < 60;
      const s = M.pickStation(lounge, occupied, f, { teamBusy, current: f.at, rng });
      if (s) {
        assert.ok(!occupied[s.id] || occupied[s.id] === f.id, 'double-booked ' + s.id);
        if (teamBusy) assert.ok(['coffee', 'sofa'].includes(s.kind), 'early finishers stay quiet: ' + s.kind);
        f.at = s.id;
      }
      const seen = figs.filter((x) => x.at).map((x) => x.at);
      assert.strictEqual(new Set(seen).size, seen.length, 'one figure per station');
    }
  }
  ['working', 'waiting', 'flagged', 'handoff', 'idle'].forEach((state) => assert.strictEqual(M.pickStation(lounge, {}, { id: 'x', state }, {}), null, state + ' never plays'));
  assert.strictEqual(M.pickStation(lounge, {}, { id: 'x', state: 'done' }, { teamBusy: true }).kind, 'coffee', 'an early finisher goes for coffee first');
  const disperse = (k) => { const occ = {}, out = []; for (let i = 0; i < k; i++) { const s = M.pickStation(lounge, occ, { id: 'p' + i, state: 'done' }, { ordered: true, doneCount: k, remaining: k - i }); if (s) { occ[s.id] = 'p' + i; out.push(s.kind); } } return out; };
  assert.deepStrictEqual(disperse(2), ['tt', 'tt'], 'two people: a game of table tennis');
  assert.deepStrictEqual(disperse(4), ['tt', 'tt', 'sofa', 'sofa'], 'three or more: the sofa fills before standing spots');
  assert.deepStrictEqual(disperse(3), ['tt', 'tt', 'sofa']);
  assert.ok(!disperse(5).slice(4).includes('chat') || disperse(5).filter((k) => k === 'chat').length !== 1, 'a pair is never opened for one person');
  const seat = M.pickStation(lounge, {}, { id: 'q', state: 'done' }, { doneCount: 3, rng: () => 0.99 });
  assert.strictEqual(seat.kind, 'sofa', 'the scheduler prefers a free seat once three are done');
  assert.strictEqual(M.pickStation(lounge, {}, { id: 'q', state: 'done' }, { doneCount: 3, current: 'sofa-0' }), null, 'a seated figure stays seated');
  const a = M.seededRandom('fig-a:run-1'), b = M.seededRandom('fig-a:run-1');
  assert.strictEqual(a(), b(), 'seeded per figure: stable across re-renders');
});

test('wrap party: once per run, only when the finish is seen live', () => {
  assert.strictEqual(M.partyDue(null, 'run-1', true, true), true);
  assert.strictEqual(M.partyDue('run-1', 'run-1', true, true), false, 'not again for the same run (re-render, poll, resize)');
  assert.strictEqual(M.partyDue('run-1', 'run-2', true, true), true, 'a new run (or a demo replay) parties again');
  assert.strictEqual(M.partyDue(null, 'run-1', false, true), false, 'not while anyone still works');
  assert.strictEqual(M.partyDue(null, 'run-1', true, false), false, 'not when the page opens on an already finished run');
  assert.strictEqual(M.partyDue(null, null, true, true), false, 'needs a result');
});

test('status updates and ready results cannot resize the office viewport', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const statusRules = Array.from(css.matchAll(/(?:^|\n)\s*\.status\s*\{([^}]+)\}/g), (m) => m[1]);
  assert.ok(statusRules.length >= 2, 'desktop and narrow status bands are explicit');
  statusRules.forEach((rule) => assert.match(rule, /(?:^|;)\s*height\s*:/, 'status text gets a fixed, responsive band'));
  assert.match(statusRules[0], /overflow-y:\s*auto/, 'long custom names remain accessible');
  assert.doesNotMatch(css, /body\.wide-side/, 'results keep the same sidebar width');
  assert.doesNotMatch(app, /classList\.toggle\('wide-side'/, 'a ready result does not resize the drawing');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
