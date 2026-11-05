#!/usr/bin/env python3
"""Attention guard: alert when no agent has worked on a WORK task for window_minutes.

Every POLL seconds it looks at busy Claude sessions and classifies each as work/personal:
  1. by cwd against config.json path lists (work_paths / personal_paths / ignore_paths)
  2. otherwise by asking a small model about the session's recent prompts (cached)
If no work session was busy for a whole window, it asks Claude for concrete
suggestions (from your idle work sessions + what's been on screen), writes them to
suggestions.md, and sends a notification that opens that file. It repeats once per window
until work resumes.

usage: attention_guard.py [window_minutes]   (overrides config.json)
"""
import glob, json, os, subprocess, sys, time, urllib.parse

HOME = os.path.expanduser("~")
DIR = os.path.dirname(os.path.abspath(__file__))
CFG = json.load(open(os.path.join(DIR, "config.json")))
WINDOW = float(sys.argv[1]) if len(sys.argv) > 1 else CFG["window_minutes"]
POLL = 20
LOG = os.path.join(DIR, "log.jsonl")
SUGG = os.path.join(DIR, "suggestions.md")
exp = lambda ps: [os.path.expanduser(p).rstrip("/") for p in ps]
WORK, PERSONAL, IGNORE = exp(CFG["work_paths"]), exp(CFG["personal_paths"]), exp(CFG["ignore_paths"])

def log(kind, **kw):
    kw.update(t=time.strftime("%Y-%m-%dT%H:%M:%S"), kind=kind)
    with open(LOG, "a") as f:
        f.write(json.dumps(kw, ensure_ascii=False) + "\n")

def under(cwd, roots):
    return any(cwd == r or cwd.startswith(r + "/") for r in roots)

def ask(prompt, model="haiku", timeout=120):
    try:
        r = subprocess.run(["claude", "-p", "--model", model, "--no-session-persistence", "--tools", ""],
                           input=prompt, capture_output=True, text=True, timeout=timeout, cwd=DIR)
        return r.stdout.strip()
    except Exception as e:
        log("error", msg=f"claude -p failed: {e!r}"[:200])
        return ""

def live_sessions():
    out = []
    for f in glob.glob(f"{HOME}/.claude/sessions/*.json"):
        try:
            os.kill(int(os.path.basename(f).split(".")[0]), 0)
            d = json.load(open(f))
        except Exception:
            continue
        sid, cwd = d.get("sessionId", ""), d.get("cwd", "")
        if under(cwd, IGNORE) or any(sid.startswith(x) for x in CFG["ignore_session_ids"]):
            continue
        out.append(dict(id=sid, name=d.get("name") or sid[:8], cwd=cwd, status=d.get("status"),
                        mtime=os.path.getmtime(f)))
    return out

def text_of(c):
    if isinstance(c, list):
        c = " ".join(x.get("text", "") for x in c if isinstance(x, dict) and x.get("type") == "text")
    return (c or "").strip()

def recent(sid, n=3):
    """Last n human prompts and the last assistant reply for a session."""
    fs = glob.glob(f"{HOME}/.claude/projects/*/{sid}.jsonl")
    if not fs:
        return [], ""
    prompts, reply = [], ""
    with open(fs[0], "rb") as fh:  # tail only; transcripts can be huge
        fh.seek(max(0, os.path.getsize(fs[0]) - 2_000_000))
        lines = fh.read().decode("utf-8", "ignore").splitlines()
    for line in lines:
        try: d = json.loads(line)
        except Exception: continue
        if d.get("type") == "user" and not d.get("isMeta"):
            t = text_of(d.get("message", {}).get("content"))
            if t and not t.startswith("<"):
                prompts.append(t[:300])
        elif d.get("type") == "assistant":
            t = text_of(d.get("message", {}).get("content"))
            if t:
                reply = t[-400:]
    return prompts[-n:], reply

_cache = {}
def classify(s):
    if under(s["cwd"], WORK): return "work"
    if under(s["cwd"], PERSONAL): return "personal"
    prompts, _ = recent(s["id"])
    key = (s["id"], prompts[-1] if prompts else "")
    if key not in _cache:
        if not prompts:
            _cache[key] = "personal"
        else:
            ans = ask(f"{CFG['work_context']}\n\nA coding agent session in {s['cwd']} was given these recent "
                      f"requests:\n" + "\n".join(f"- {p}" for p in prompts) +
                      "\n\nIs this the user's work (as described above)? Answer with one word: work or personal.").lower()
            _cache[key] = "work" if "work" in ans and "personal" not in ans else "personal"
            log("classify", session=s["id"][:8], name=s["name"], verdict=_cache[key])
    return _cache[key]

def input_idle():
    """Seconds since the last keyboard/mouse event (no permission needed)."""
    try:
        out = subprocess.run(["ioreg", "-c", "IOHIDSystem"], capture_output=True, text=True, timeout=5).stdout
        for line in out.splitlines():
            if "HIDIdleTime" in line:
                return int(line.split("=")[-1].strip()) / 1e9
    except Exception:
        pass
    return 1e9

def frontmost_app():
    try:
        return subprocess.run(["osascript", "-e", 'tell application "System Events" to get name of first '
                               'application process whose frontmost is true'],
                              capture_output=True, text=True, timeout=5).stdout.strip()
    except Exception:
        return ""

def on_call():
    """'camera' or 'mic' if any app is using one (a video/voice call), else None."""
    try:
        out = subprocess.run([os.path.join(DIR, "callcheck", "callcheck")],
                             capture_output=True, text=True, timeout=5).stdout.strip()
        return out or None
    except Exception:
        return None

def human_work():
    """The work app the user is actively typing/mousing in, a call, or None."""
    call = on_call()
    if call:
        return f"Call ({call})"
    if input_idle() > CFG.get("input_idle_seconds", 30):
        return None
    app = frontmost_app()
    return app if app in CFG.get("work_apps", []) else None

def focus_timeline(minutes=30):
    cutoff = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(time.time() - minutes * 60))
    rows = []
    try:
        for line in open(LOG):
            d = json.loads(line)
            if d.get("kind") == "focus" and d["t"] >= cutoff:
                rows.append(f"{d['t'][11:16]} {d['app']} — {d.get('window','')[:80]}")
    except Exception:
        pass
    return rows[-25:]

STATE = os.path.join(DIR, "state.json")
CONTROL = os.path.join(DIR, "control.json")

def read_json(p, default):
    try: return json.load(open(p))
    except Exception: return default

def write_state(**kw):
    st = read_json(STATE, {})
    st.update(kw, updated=time.strftime("%Y-%m-%dT%H:%M:%S"))
    tmp = STATE + ".tmp"
    json.dump(st, open(tmp, "w"), ensure_ascii=False, indent=1)
    os.replace(tmp, STATE)

def parse_json(text):
    a, b = text.find("{"), text.rfind("}")
    try: return json.loads(text[a:b + 1])
    except Exception: return None

def suggest(sessions, idle_min):
    work = [s for s in sessions if classify(s) == "work"]
    work.sort(key=lambda s: -s["mtime"])
    blocks = []
    for s in work[:8]:
        prompts, reply = recent(s["id"])
        age = int((time.time() - s["mtime"]) / 60)
        blocks.append(f"### session id={s['id'][:8]} name='{s['name']}' folder={s['cwd'].replace(HOME,'~')}, last active {age} min ago\n"
                      f"recent requests:\n" + "\n".join(f"- {p}" for p in prompts) +
                      f"\nagent's last reply (tail): {reply}")
    prompt = f"""{CFG['work_context']}

You are the user's attention coach. For {idle_min} minutes no agent has worked on a work task and the user hasn't been typing or mousing in a work app ({', '.join(CFG['work_apps'])}); they have likely drifted.

What was on their screen recently (time, app — window):
{chr(10).join(focus_timeline()) or '(no data)'}

Their open work agent sessions:
{chr(10).join(blocks) or '(none open)'}

Reply with ONLY a JSON object, no code fence:
{{"headline": "<under 60 chars: the single best next step>",
  "items": [{{"session": "<8-char session id from above>",
             "title": "<imperative, under 45 chars>",
             "why": "<state fact, under 60 chars>",
             "prompt": "<the exact next prompt they could paste into that session>"}}]}}
2-3 items, best first; prefer sessions blocked on the user.
Copy rules for headline/title/why: plain, blunt, like a terse teammate. No "you"/"your", no "the agent", no filler
("nothing confirms", "worth", "just", "quick win"), no em dashes, no restating the title in the why.
Good why: "Waiting on 5 decisions before the design page." Bad why: "Doc is committed locally; agent waits on your decisions".
Use the language the user uses in that session for the prompt."""
    out = parse_json(ask(prompt, model="sonnet", timeout=180)) or {}
    items = []
    byid = {s["id"][:8]: s for s in work}
    for it in out.get("items", []):
        s = byid.get(str(it.get("session", ""))[:8])
        if s:
            items.append(dict(session=s["id"], name=s["name"], folder=s["cwd"].replace(HOME, "~"),
                              title=it.get("title", ""), why=it.get("why", ""), prompt=it.get("prompt", "")))
    if not items:
        items = [dict(session=s["id"], name=s["name"], folder=s["cwd"].replace(HOME, "~"),
                      title=f"Pick up {s['name']}", why="Open work session", prompt="") for s in work[:3]]
    return dict(headline=out.get("headline") or f"No work for {idle_min} min",
                items=items, noticed="")

def notify(headline):
    subprocess.run(["osascript", "-e",
                    f'display notification {json.dumps(headline[:200])} with title "Go back to work" sound name "Glass"'])

def alert(sessions, idle_min, reason):
    write_state(status="alert" if reason == "idle" else read_json(STATE, {}).get("status", "watching"),
                thinking=True)
    sug = suggest(sessions, idle_min)
    with open(SUGG, "w") as f:
        f.write(f"# {time.strftime('%H:%M')} — {sug['headline']}\n\n" +
                "\n".join(f"- **{i['name']}**: {i['title']} — {i['why']}\n  > {i['prompt']}" for i in sug["items"]) +
                f"\n\n{sug['noticed']}\n")
    write_state(thinking=False, suggestion=sug, idle_min=idle_min, suggested_at=time.time())
    return sug

start = time.time()
last_work, last_alert, handled_refresh = start, 0.0, time.time()
log("guard_start", window=WINDOW)
write_state(status="watching", window=WINDOW, thinking=False, busy_work=[])
while True:
    try:
        now = time.time()
        ctl = read_json(CONTROL, {})
        if ctl.get("paused"):
            last_work = now  # the clock restarts when the break ends
            if read_json(STATE, {}).get("status") != "paused":
                log("break_start"); write_state(status="paused", paused_since=ctl.get("since", now))
            time.sleep(5); continue
        if read_json(STATE, {}).get("status") == "paused":
            log("break_end"); write_state(status="watching")
        sessions = live_sessions()
        busy_work = [s["name"] for s in sessions if s["status"] == "busy" and classify(s) == "work"]
        you = human_work()
        if busy_work or you:
            last_work = now
            if read_json(STATE, {}).get("status") != "watching":
                write_state(status="watching")
        write_state(busy_work=busy_work, human_work=you, last_work=last_work)
        if ctl.get("refresh_at", 0) > handled_refresh:
            handled_refresh = ctl["refresh_at"]
            alert(sessions, int((now - last_work) / 60), "manual")
        elif not busy_work and not you and now - last_work >= WINDOW * 60 and now - last_alert >= WINDOW * 60:
            idle_min = int((now - last_work) / 60)
            sug = alert(sessions, idle_min, "idle")
            notify(sug["headline"])
            log("nudge", idle_min=idle_min, text=sug["headline"])
            last_alert = time.time()
    except Exception as e:
        log("error", msg=repr(e)[:200])
    time.sleep(POLL)
