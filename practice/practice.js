/* awesome-mas · practice mode — walk through a real example run without an AI (no tokens).
   The student types what they would type in their assistant; every reply is built from the example's
   real files (examples/<x>/) and the kit's standard wording. The panel on the right is the real panel,
   shown as the example looked at each step (office/index.html?stage=…). */
(function () {
  'use strict';
  const M = window.MASModel;
  const $ = (sel) => document.querySelector(sel);
  const EXAMPLES = [
    { id: 'price-compare', label: 'Headphone deal finder · Claude Code' },
    { id: 'trip-planning', label: 'Weekend in Lisbon · Codex' },
    { id: 'thesis-feasibility', label: 'Thesis feasibility check · Antigravity' }
  ];
  const params = new URLSearchParams(location.search);
  const EX = EXAMPLES.some((e) => e.id === params.get('example')) ? params.get('example') : EXAMPLES[0].id;
  const BASE = '../examples/' + EX + '/';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HINTS = { 0: 'start describing your task', 6: 'design your team', 7: 'lock your team', 8: 'run your team' };

  const log = $('#log'), form = $('#form'), msg = $('#msg'), send = $('#send'), chips = $('#chips'), panel = $('#panel');
  let script = null, idx = 0, busy = false, finished = false, noted = false, stage = null, timers = [];

  /* ---------- loading the example's data files (script tags work on file://) ---------- */
  function load(path) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = BASE + path;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  /* ---------- chat rows ---------- */
  const md = (text) => M.renderMarkdown(text, { resolveLink: (u) => BASE + 'outputs/' + u.replace(/^\.\//, '') });
  function block(b) {
    if (typeof b === 'object') {
      return '<div class="file"><span class="file-name">' + M.esc(b.file) + '</span><div class="file-body">' + md(b.md || '') + '</div></div>';
    }
    if (/^MAS: /.test(b)) return '<p class="mas">' + M.esc(b) + '</p>';
    return md(b);
  }
  function row(who, html) {
    const r = document.createElement('div');
    r.className = 'row ' + (who === 'You' ? 'you' : 'ai');
    r.innerHTML = '<span class="who">' + who + '</span><div class="said">' + html + '</div>';
    log.appendChild(r);
    log.scrollTop = log.scrollHeight;
    return r;
  }
  const you = (text) => row('You', M.esc(text));
  // Assistant reply, after a short "typing" pause so it reads like a conversation.
  function say(blocks, then) {
    const list = [].concat(blocks).filter(Boolean);
    busy = true; setComposer();
    const r = row('Assistant', '<span class="typing">…</span>');
    const done = () => {
      r.querySelector('.said').innerHTML = list.map(block).join('');
      // a long reply is read from its start; a short one just appears at the bottom
      log.scrollTop = r.offsetHeight > log.clientHeight ? r.offsetTop : log.scrollHeight;
      busy = false; setComposer(); if (then) then();
    };
    if (reduce) done(); else timers.push(setTimeout(done, 450 + Math.min(list.length, 4) * 120));
  }

  /* ---------- composer ---------- */
  function setComposer() {
    const turn = script && script.turns[idx];
    const running = stage === 'run' && !finished;
    msg.disabled = send.disabled = busy || running;
    $('#hint').textContent = running ? 'Your team is working. Watch the office on the right.'
      : finished ? 'Done. Start over, or pick another example at the top.'
      : turn && turn.expect === 'answer' ? "Filled in from the real run's answer. Press Enter to send, or write your own."
      : 'Type next to go on' + (chips.children.length ? ', or tap a button above.' : '.');
  }
  function setChips(list) {
    chips.innerHTML = '';
    timers.push(setTimeout(setComposer, 0)); // the hint mentions the buttons only when there are some
    (list || []).forEach((t) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = t;
      b.addEventListener('click', () => { if (!busy) submit(t, true); });
      chips.appendChild(b);
    });
  }
  function prefill() {
    const turn = script.turns[idx];
    msg.value = turn ? turn.prefill : '';
    if (!busy) { msg.focus({ preventScroll: true }); msg.setSelectionRange(msg.value.length, msg.value.length); }
  }

  /* ---------- the panel ---------- */
  function setStage(next) {
    if (next === stage) return;
    stage = next;
    panel.src = '../office/index.html?root=' + encodeURIComponent(BASE) + '&stage=' + next;
  }

  /* ---------- one student message ---------- */
  function submit(raw, fromChip) {
    const text = String(raw || '').trim();
    if (!text || busy || !script) return;
    you(text);
    if (!fromChip) msg.value = ''; // a tapped button keeps what is in the box
    if (finished) {
      if (/again|start over|restart/i.test(text)) return restart();
      if (/another|example/i.test(text)) return nextExample();
      return say('This practice run is finished. Tap *Practice again* or *Try another example*.');
    }
    const turn = script.turns[idx];
    if (turn.expect === 'answer') {
      const same = text.replace(/\s+/g, ' ') === String(turn.prefill).replace(/\s+/g, ' ');
      const note = !same && !noted ? "*Practice mode keeps the real run's answer, so what follows comes from: “" + turn.prefill.replace(/\s+/g, ' ') + '”*' : null;
      if (note) noted = true;
      return advance(turn, note);
    }
    if (/^next$/i.test(text)) return advance(turn);
    const file = text.match(/^open team\/([a-z0-9-]+)\.md$/i);
    if (file && script.teamFile(file[1])) return say({ file: 'team/' + file[1] + '.md', md: script.teamFile(file[1]) }, restore);
    if (turn.why && /\bwhy\b|为什么/i.test(text)) return say(script.why(text), restore);
    const hint = 'Type `next` to ' + (HINTS[idx] || 'go on') + '.';
    if (/run again|unlock|\badd\b|remove|merge|change|rename|delete|\bnew\b/i.test(text)) {
      return say(["In practice mode the task and the team can't change: that needs a real AI. With your own assistant, you'd just say it in plain words, and the panel would show the new team.", hint], restore);
    }
    return say(['This is practice mode, so I can only replay the real run.', hint], restore);
  }
  // After a reply that doesn't move on: put the expected words back (unless the student is mid-draft) and refocus.
  function restore() { if (!msg.value.trim()) prefill(); else msg.focus({ preventScroll: true }); }
  function advance(turn, note) {
    idx++;
    if (turn.stage) setStage(turn.stage);
    say([note].concat(turn.reply), () => {
      setChips(turn.chips);
      prefill();
      if (turn.timed) playRun(turn.timed);
    });
  }
  // The run: the panel replays the run once; the chat reports at the same moments.
  function playRun(events) {
    busy = false; setComposer(); setChips([]);
    const t0 = performance.now();
    events.forEach((e) => {
      const wait = Math.max(0, e.at * 1000 - (performance.now() - t0)); // reduced motion skips the typing pause, not the panel's timeline
      timers.push(setTimeout(() => {
        say(e.md, e.done ? () => { finished = true; setChips(['Practice again', 'Try another example']); msg.value = ''; setComposer(); } : null);
      }, wait));
    });
  }
  function restart() { location.search = '?example=' + EX; }
  function nextExample() {
    const i = EXAMPLES.findIndex((e) => e.id === EX);
    location.search = '?example=' + EXAMPLES[(i + 1) % EXAMPLES.length].id;
  }

  /* ---------- start ---------- */
  const sel = $('#example');
  sel.innerHTML = EXAMPLES.map((e) => '<option value="' + e.id + '"' + (e.id === EX ? ' selected' : '') + '>' + M.esc(e.label) + '</option>').join('');
  sel.addEventListener('change', () => { location.search = '?example=' + sel.value; });
  $('#restart').addEventListener('click', restart);
  form.addEventListener('submit', (e) => { e.preventDefault(); submit(msg.value); });
  msg.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229 && !e.repeat) { e.preventDefault(); submit(msg.value); } });

  Promise.all(['mas/env.js', 'me/task.js', 'mas/structure.js', 'outputs/result.js', 'replay.js'].map(load)).then((ok) => {
    if (!ok.every(Boolean) || !window.MAS_STRUCTURE || !window.MAS_REPLAY) {
      row('Assistant', '<p>This example could not be loaded. Open this page from inside the awesome-mas folder (<code>practice/index.html</code>).</p>');
      msg.disabled = send.disabled = true;
      return;
    }
    script = M.practiceScript({ env: window.MAS_ENV, task: window.MAS_TASK, structure: window.MAS_STRUCTURE, result: window.MAS_RESULT }, window.MAS_REPLAY);
    document.title = 'Practice · ' + script.title + ' · awesome-mas';
    $('#banner').textContent = 'No tokens needed. This replays a real run made with ' + script.tool + ': you type what a student types, the answers come from that run.';
    setStage('describe');
    say(['**Practice mode.** This is a real run of *' + script.title + '*, made with **' + script.tool + "**. You type what a student types: `next` to move on, and an answer to each question. The box below is filled in from that run, so you can just press Enter. Your words can't change the outcome here: that needs a real AI.",
      'Setup is already done. Type `next` to start your first MAS.'], prefill);
  });
})();
