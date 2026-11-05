#!/usr/bin/env python3
"""Activity sampler: every INTERVAL seconds, append changes to log.jsonl.

Records (only on change):
  focus   - frontmost app + its front window title
  session - Claude session status flips (idle/busy) per live session
  prompt  - new human prompts typed into any Claude Code / Codex session
"""
import glob, json, os, subprocess, sys, time

HOME = os.path.expanduser("~")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "log.jsonl")
INTERVAL = int(sys.argv[1]) if len(sys.argv) > 1 else 30
SELF_PID = os.getppid()  # not used for filtering; monitor session prompts are logged too

def emit(kind, **kw):
    kw.update(t=time.strftime("%Y-%m-%dT%H:%M:%S"), kind=kind)
    with open(OUT, "a") as f:
        f.write(json.dumps(kw, ensure_ascii=False) + "\n")

def focus():
    script = ('tell application "System Events"\n'
              'set p to first application process whose frontmost is true\n'
              'set n to name of p\n'
              'try\nset w to name of front window of p\non error\nset w to ""\nend try\n'
              'return n & "\t" & w\nend tell')
    try:
        r = subprocess.run(["osascript", "-e", script], capture_output=True, text=True, timeout=10)
        app, _, win = r.stdout.strip().partition("\t")
        return app, win
    except Exception:
        return None, None

def sessions():
    out = {}
    for f in glob.glob(f"{HOME}/.claude/sessions/*.json"):
        try:
            pid = int(os.path.basename(f).split(".")[0]); os.kill(pid, 0)
            d = json.load(open(f))
            out[d["sessionId"]] = (d.get("status"), d.get("name"), d.get("cwd", "").replace(HOME, "~"))
        except Exception:
            pass
    return out

def text_of(c):
    if isinstance(c, list):
        c = " ".join(x.get("text", "") for x in c if isinstance(x, dict) and x.get("type") == "text")
    return (c or "").strip()

offsets = {}
def new_prompts(since):
    files = [f for f in glob.glob(f"{HOME}/.claude/projects/*/*.jsonl")
             + glob.glob(f"{HOME}/.codex/sessions/*/*/*/*.jsonl")
             if os.path.getmtime(f) >= since]
    for f in files:
        size = os.path.getsize(f)
        start = offsets.get(f, 0)  # files absent at startup are new: read from 0
        if size <= start:
            offsets[f] = size; continue
        with open(f, "rb") as fh:
            fh.seek(start); chunk = fh.read()
        offsets[f] = size
        for line in chunk.decode("utf-8", "ignore").splitlines():
            try: d = json.loads(line)
            except Exception: continue
            src, txt = None, ""
            if d.get("type") == "user" and not d.get("isMeta") and d.get("userType", "external") == "external":
                txt = text_of(d.get("message", {}).get("content")); src = "claude"
            elif d.get("type") == "response_item" and d.get("payload", {}).get("role") == "user":
                txt = " ".join(x.get("text", "") for x in d["payload"].get("content", []) if isinstance(x, dict)); src = "codex"
            if not src or not txt or txt.startswith("<") or "activity-monitor" in d.get("cwd", ""):
                continue
            emit("prompt", src=src, session=os.path.basename(f)[:8] if src == "claude" else os.path.basename(f)[-44:-36],
                 cwd=d.get("cwd", "").replace(HOME, "~"), text=txt[:400])

T0 = time.time()
for f in glob.glob(f"{HOME}/.claude/projects/*/*.jsonl") + glob.glob(f"{HOME}/.codex/sessions/*/*/*/*.jsonl"):
    offsets[f] = os.path.getsize(f)  # ignore history before monitoring began
last_focus, last_sess, last_scan = None, {}, T0
emit("start", interval=INTERVAL)
while True:
    try:
        fx = focus()
        if fx != last_focus and fx[0]:
            emit("focus", app=fx[0], window=fx[1]); last_focus = fx
        cur = sessions()
        for sid, (st, name, cwd) in cur.items():
            if last_sess.get(sid, (None,))[0] != st:
                emit("session", id=sid[:8], status=st, name=name, cwd=cwd)
        for sid in set(last_sess) - set(cur):
            emit("session", id=sid[:8], status="exited", name=last_sess[sid][1], cwd=last_sess[sid][2])
        last_sess = cur
        now = time.time(); new_prompts(last_scan - 5); last_scan = now
    except Exception as e:
        emit("error", msg=repr(e)[:200])
    time.sleep(INTERVAL)
