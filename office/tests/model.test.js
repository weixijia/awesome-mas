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

// The example from harness/formats.md (lead emoji set to the one shown in its Markdown heading).
const FORMATS_STRUCTURE = {
  title: 'Headphone deal finder', version: 1, locked: false, rationale: 'x',
  lead: { id: 'lead', name: 'Lead', emoji: '🧭', job: 'Combine the checked offers into a buying shortlist', serves: ['R3'] },
  groups: [{ id: 'A', label: 'Search in parallel', after: null }, { id: 'B', label: 'Check', after: 'A' }],
  roles: [
    { id: 'new-price-finder', name: 'New-price finder', emoji: '🔎', serves: ['R1'], job: 'Search major UK retailers for the lowest new price', why: 'Different source from the marketplace finder; can run at the same time', tools: ['web search'], group: 'A', handsTo: 'catch-checker' },
    { id: 'catch-checker', name: 'Catch checker', emoji: '🛡️', serves: ['R2'], job: 'Flag refurbished stock, parallel imports and hidden shipping', why: 'Independent check: R2 mistakes are costly', tools: ['web search'], group: 'B', handsTo: 'lead' }
  ]
};
const FORMATS_MD = `# 🧭 Headphone deal finder — Lead
- job: Combine the checked offers into a buying shortlist
- serves: R3
## 🔎 New-price finder
- serves: R1
- job: Search major UK retailers for the lowest new price
- why: Different source from the marketplace finder; can run at the same time
- tools: web search
- group: A
- hands to: Catch checker
## 🛡️ Catch checker
- serves: R2
- job: Flag refurbished stock, parallel imports and hidden shipping
- why: Independent check: R2 mistakes are costly
- tools: web search
- group: B
- hands to: Lead
`;
const TASK = { requirements: [{ id: 'R1', text: 'a' }, { id: 'R2', text: 'b' }, { id: 'R3', text: 'c' }] };

console.log('model.js');

test('structure → markdown matches the formats.md layout exactly', () => {
  assert.strictEqual(M.structureToMarkdown(FORMATS_STRUCTURE), FORMATS_MD);
});

test('formats.md code block is still the layout we generate', () => {
  const f = path.join(__dirname, '..', '..', 'harness', 'formats.md');
  if (!fs.existsSync(f)) return;
  const text = fs.readFileSync(f, 'utf8');
  const block = text.split('## `mas/structure.md`')[1].split('```markdown\n')[1].split('```')[0];
  assert.strictEqual(M.structureToMarkdown(FORMATS_STRUCTURE), block);
});

test('structure markdown: multi-serve, no tools, names for hands-to', () => {
  const s = M.clone(FORMATS_STRUCTURE);
  s.roles[0].serves = ['R1', 'R2']; s.roles[0].tools = [];
  const md = M.structureToMarkdown(s);
  assert.ok(md.includes('- serves: R1, R2\n'));
  assert.ok(md.includes('- tools: none\n'));
  assert.ok(md.includes('- hands to: Catch checker\n'));
});

test('structure → js is a valid data file that round-trips', () => {
  const win = M.evalDataFile(M.structureToJs(FORMATS_STRUCTURE));
  assert.deepStrictEqual(win.MAS_STRUCTURE, FORMATS_STRUCTURE);
});

test('answers.md uses the exact formats.md layout', () => {
  const md = M.answersToMarkdown(['Compare prices', 'Under £300\nUK only', 'A shortlist', 'Monthly', 'No']);
  assert.strictEqual(md, '# My answers\n1. What should your assistant help you do?\nCompare prices\n2. Your preferences and limits?\nUnder £300\nUK only\n' +
    '3. What does a good result look like? How will you judge it?\nA shortlist\n4. Will you do this again? How often?\nMonthly\n' +
    '5. Any of your own material to use? (put files in raw/)\nNo\n');
  assert.deepStrictEqual(M.parseAnswers(md), ['Compare prices', 'Under £300\nUK only', 'A shortlist', 'Monthly', 'No']);
});

test('requests.md: header created, lines appended, lock not duplicated', () => {
  let t = M.appendRequest(null, M.refineLine('Add a budget\nchecker'));
  assert.strictEqual(t, '# Requests from the panel\n- [ ] refine: Add a budget checker\n');
  t = M.appendRequest(t, M.LOCK_LINE);
  t = M.appendRequest(t, M.LOCK_LINE);
  assert.strictEqual(t, '# Requests from the panel\n- [ ] refine: Add a budget checker\n- [ ] lock\n');
  assert.strictEqual(M.appendRequest('# Requests from the panel\n- [x] lock', M.LOCK_LINE), '# Requests from the panel\n- [x] lock\n- [ ] lock\n');
});

test('cost text', () => {
  assert.strictEqual(M.costInfo(3).text, '4 agents ≈ 4× the tokens of one assistant');
  assert.strictEqual(M.costInfo(0).text, '1 agent ≈ 1× the tokens of one assistant');
  assert.strictEqual(M.costInfo(1).sub, 'Lead + 1 role');
  assert.deepStrictEqual([2, 4, 6].map((n) => M.costInfo(n).level), ['calm', 'warm', 'hot']);
});

test('markdown renderer escapes HTML', () => {
  const html = M.renderMarkdown('Hi <script>alert(1)</script> **b** [x](javascript:alert(1)) <img src=x onerror=alert(1)>');
  assert.ok(!html.includes('<script'), html);
  assert.ok(!html.includes('<img'), html);
  assert.ok(!/href="javascript/i.test(html), html);
  assert.ok(html.includes('&lt;script&gt;') && html.includes('<strong>b</strong>'), html);
});

test('markdown renderer: table, headings, lists, inline', () => {
  const md = '## Shortlist\n| Shop | Total |\n|---|---:|\n| Currys | **£279** |\n| eBay "X" | `£264` |\n\n- one *it*\n- [card](../sources/a.md)\n\n1. first\n2. second';
  const html = M.renderMarkdown(md, { resolveLink: (u) => 'ROOT/' + u });
  assert.ok(html.includes('<h2>Shortlist</h2>'));
  assert.ok(html.includes('<table>') && html.includes('<th>Shop</th>') && html.includes('<th style="text-align:right">Total</th>'), html);
  assert.ok(html.includes('<td style="text-align:right"><strong>£279</strong></td>'), html);
  assert.ok(html.includes('<td>eBay &quot;X&quot;</td>') && html.includes('<code>£264</code>'), html);
  assert.ok(html.includes('<li>one <em>it</em></li>'));
  assert.ok(html.includes('href="ROOT/../sources/a.md"'), html);
  assert.ok(html.includes('<ol><li>first</li><li>second</li></ol>'));
});

test('markdown renderer renders the mock result', () => {
  const win = M.evalDataFile(fs.readFileSync(path.join(__dirname, 'fixtures', 'mock-price-compare', 'outputs', 'result.js'), 'utf8'));
  const html = M.renderMarkdown(win.MAS_RESULT.markdown);
  assert.strictEqual((html.match(/<tr>/g) || []).length, 4);
  assert.ok(html.includes('<h2>Your decision</h2>'));
});

test('requirement coverage warnings', () => {
  const s = M.clone(FORMATS_STRUCTURE);
  s.roles[1].serves = [];
  s.lead.serves = ['R9'];
  const c = M.coverage(s, TASK);
  assert.deepStrictEqual(c.rolesWithoutReq, ['catch-checker']);
  assert.deepStrictEqual(c.unservedReqs, ['R2', 'R3']);
  assert.deepStrictEqual(c.unknownRefs, [{ id: 'lead', req: 'R9' }]);
  assert.deepStrictEqual(M.coverage(FORMATS_STRUCTURE, TASK).unservedReqs, []);
});

test('id slugging is unique and never lead', () => {
  assert.strictEqual(M.slugify('  Budget Checker! '), 'budget-checker');
  assert.strictEqual(M.slugify('Café crème'), 'cafe-creme');
  assert.strictEqual(M.slugify('🧮'), 'role');
  assert.strictEqual(M.uniqueId('Lead', []), 'lead-2');
  assert.strictEqual(M.uniqueId('Catch checker', ['catch-checker']), 'catch-checker-2');
  assert.strictEqual(M.uniqueId('Catch checker', ['catch-checker', 'catch-checker-2']), 'catch-checker-3');
});

test('editing keeps ids stable and fixes references', () => {
  let s = M.updateMember(FORMATS_STRUCTURE, 'catch-checker', { name: 'Deal guard', id: 'hacked' });
  assert.strictEqual(s.roles[1].id, 'catch-checker');
  assert.strictEqual(s.roles[1].name, 'Deal guard');
  const added = M.addRole(s, 'Budget checker', 'B');
  assert.strictEqual(added.id, 'budget-checker');
  s = M.deleteRole(added.structure, 'catch-checker');
  assert.strictEqual(s.roles.find((r) => r.id === 'new-price-finder').handsTo, 'lead');
  s = M.pruneGroups(M.updateMember(s, 'budget-checker', { group: 'A' }));
  assert.deepStrictEqual(s.groups.map((g) => g.id), ['A']);
  const g = M.addGroup(s, 'Polish');
  assert.deepStrictEqual(g.structure.groups[1], { id: 'B', label: 'Polish', after: 'A' });
  assert.strictEqual(FORMATS_STRUCTURE.roles.length, 2, 'input not mutated');
});

test('pruning a middle group re-links the chain', () => {
  const s = { roles: [{ id: 'a', group: 'A' }, { id: 'c', group: 'C' }], groups: [{ id: 'A', after: null }, { id: 'B', after: 'A' }, { id: 'C', after: 'B' }] };
  assert.deepStrictEqual(M.pruneGroups(s).groups, [{ id: 'A', after: null }, { id: 'C', after: 'A' }]);
});

test('progress and default view', () => {
  assert.deepStrictEqual(M.deriveProgress({}), { step: 1, done: false, started: false });
  assert.strictEqual(M.deriveProgress({ task: {}, state: { step: 2 } }).step, 2);
  assert.strictEqual(M.deriveProgress({ task: {}, structure: { locked: false }, state: { step: 4 } }).step, 3);
  const p = M.deriveProgress({ task: {}, structure: { locked: true }, state: { step: 4, phase: 'done' } });
  assert.deepStrictEqual([p.step, p.done], [4, true]);
  assert.strictEqual(M.viewForProgress(p, true), 'result');
  assert.strictEqual(M.viewForProgress({ step: 4, done: false }, false), 'office');
  assert.strictEqual(M.viewForProgress({ step: 2 }, false), 'design');
});

test('hint formatting escapes and highlights the command', () => {
  assert.strictEqual(M.formatHint('Type next in your <b>assistant</b>.'), 'Type <code>next</code> in your &lt;b&gt;assistant&lt;/b&gt;.');
  assert.strictEqual(M.hintCommand('Done! … type run again, or type unlock'), 'run again');
  assert.strictEqual(M.hintCommand('Watch the Office tab.'), 'next');
});

test('demo script: parallel at ~8 s, flag at ~25 s, all done, loops', () => {
  const s = M.DEMO_DATA.structure;
  const sc = M.buildDemoScript(s);
  const at = (t) => M.demoStatusesAt(sc, t);
  assert.ok(Object.values(at(0.5)).every((x) => x.state === 'idle'));
  assert.strictEqual(at(3).lead.state, 'working');
  assert.strictEqual(at(3).lead.say, 'Planning the run');
  assert.strictEqual(at(6)['catch-checker'].state, 'waiting');
  assert.strictEqual(at(8)['retail-finder'].state, 'working');
  assert.strictEqual(at(8)['marketplace-finder'].state, 'working');
  assert.notStrictEqual(at(8)['retail-finder'].say, at(12)['retail-finder'].say);
  assert.strictEqual(at(17)['retail-finder'].state, 'handoff');
  assert.strictEqual(at(17)['retail-finder'].to, 'catch-checker');
  assert.strictEqual(at(25)['catch-checker'].state, 'flagged');
  assert.strictEqual(at(25)['catch-checker'].flag, 'eBay seller X: refurbished');
  assert.strictEqual(at(31)['catch-checker'].to, 'lead');
  assert.strictEqual(at(37).lead.say, 'Writing the shortlist');
  assert.ok(Object.values(at(44)).every((x) => x.state === 'done'));
  assert.ok(Object.values(at(48.5)).every((x) => x.state === 'idle'), 'loops');
});

test('demo script works for any structure (two roles handing to lead)', () => {
  const s = { lead: { id: 'lead', name: 'Lead' }, groups: [{ id: 'A', after: null }, { id: 'B', after: 'A' }],
    roles: [{ id: 'a', name: 'A', group: 'A', handsTo: 'c' }, { id: 'c', name: 'Catch checker', group: 'B', handsTo: 'lead' }, { id: 'd', name: 'Budget', job: 'Check totals', group: 'B', handsTo: 'lead' }] };
  const sc = M.buildDemoScript(s);
  const mid = M.demoStatusesAt(sc, 25);
  assert.strictEqual(mid.c.state, 'flagged');
  assert.strictEqual(mid.d.state, 'working');
  assert.strictEqual(mid.d.say.length > 0, true);
});

test('say history keeps the last 5 distinct messages', () => {
  const h = {};
  ['a', 'a', 'b', 'c', 'd', 'e', 'f'].forEach((say) => M.pushSay(h, 'x', { state: 'working', say }));
  assert.deepStrictEqual(h.x.map((e) => e.say), ['b', 'c', 'd', 'e', 'f']);
});

test('status data files evaluate against a fresh object', () => {
  const txt = fs.readFileSync(path.join(__dirname, 'fixtures', 'mock-price-compare', 'mas', 'status', 'catch-checker.js'), 'utf8');
  assert.strictEqual(M.evalDataFile(txt).MAS_STATUS['catch-checker'].state, 'done');
  assert.throws(() => M.evalDataFile('window.X = {'));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
