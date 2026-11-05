#!/usr/bin/env python3
"""Agents feed: what each live Claude Code session is doing right now.

Writes office/agents.js (window.AGENTS = {...}) every 2 seconds for the office
drawing inside AttentionBar. Reads only local files:
  ~/.claude/sessions/*.json            live sessions (pid, name, cwd, busy/idle)
  ~/.claude/projects/*/<id>.jsonl      transcript tail -> current action
  ~/.claude/projects/*/<id>/subagents  running subagents
  state.json                           your own status from attention_guard.py

usage: agents_feed.py [--once]
"""
import glob, json, os, sys, time

HOME = os.path.expanduser("~")
DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, "office", "agents.js")
CFG = json.load(open(os.path.join(DIR, "config.json")))
RECENT_MIN = 45        # idle sessions older than this leave the office
DONE_MIN = 20          # idle less than this = "done, your turn"; after that = lounge
MAX_SESSIONS = 9
SUB_FRESH_S = 120      # unfinished subagent with no write for this long counts as gone
TAIL = 400_000

exp = lambda ps: [os.path.expanduser(p).rstrip("/") for p in ps]
IGNORE = exp(CFG.get("ignore_paths", []))
under = lambda cwd, roots: any(cwd == r or cwd.startswith(r + "/") for r in roots)


def short(s, n=60):
    s = " ".join(str(s or "").split())
    return s if len(s) <= n else s[: n - 1] + "…"


def base(p):
    return os.path.basename(str(p or "").rstrip("/")) or str(p or "")


def describe_tool(name, inp):
    inp = inp if isinstance(inp, dict) else {}
    if name == "Bash":
        return inp.get("description") or "Running a command"
    if name in ("Edit", "MultiEdit", "NotebookEdit"):
        return "Editing " + base(inp.get("file_path") or inp.get("notebook_path"))
    if name == "Write":
        return "Writing " + base(inp.get("file_path"))
    if name == "Read":
        return "Reading " + base(inp.get("file_path"))
    if name in ("Grep", "Glob", "ToolSearch"):
        return "Searching the code"
    if name in ("WebSearch", "WebFetch"):
        return "Searching the web"
    if name in ("Agent", "Task"):
        return "Starting a subagent: " + (inp.get("description") or "")
    if name == "AskUserQuestion":
        return "Asking you a question"
    if name == "Skill":
        return "Using skill " + str(inp.get("skill", ""))
    if name == "TodoWrite":
        return "Updating the plan"
    if name.startswith("mcp__"):
        parts = name.split("__")
        return "Using " + parts[1].split("_")[-1] + " · " + parts[-1].replace("_", " ")
    return "Using " + name


def tail_lines(path):
    try:
        size = os.path.getsize(path)
        with open(path, "rb") as fh:
            fh.seek(max(0, size - TAIL))
            return fh.read().decode("utf-8", "ignore").splitlines()
    except Exception:
        return []


_seen = {}
def read_transcript(path):
    """Cached by mtime: transcripts only get re-read when they change."""
    try:
        key = os.path.getmtime(path)
    except Exception:
        return "", "", "", False
    hit = _seen.get(path)
    if hit and hit[0] == key:
        return hit[1]
    res = _read_transcript(path)
    _seen[path] = (key, res)
    return res


def _read_transcript(path):
    """-> (current action, last assistant text, last human prompt, pending AskUserQuestion)."""
    action, reply, prompt, asking = "", "", "", False
    for line in tail_lines(path):
        try:
            d = json.loads(line)
        except Exception:
            continue
        t = d.get("type")
        content = (d.get("message") or {}).get("content")
        if t == "assistant" and isinstance(content, list):
            for c in content:
                if not isinstance(c, dict):
                    continue
                if c.get("type") == "tool_use":
                    action = describe_tool(c.get("name", ""), c.get("input"))
                    asking = c.get("name") == "AskUserQuestion"
                elif c.get("type") == "text" and c.get("text", "").strip():
                    reply = c["text"].strip()
                    action, asking = "Writing a reply", False
                elif c.get("type") in ("thinking", "redacted_thinking"):
                    action = "Thinking"
        elif t == "user" and not d.get("isMeta"):
            if isinstance(content, str) and content.strip() and not content.lstrip().startswith("<"):
                prompt, action, asking = content.strip(), "Reading your message", False
            elif isinstance(content, list):
                for c in content:
                    if isinstance(c, dict) and c.get("type") == "text" and not c.get("text", "").lstrip().startswith("<"):
                        prompt, action, asking = c["text"].strip(), "Reading your message", False
    return action, reply, prompt, asking


def find_transcript(sid):
    fs = glob.glob(f"{HOME}/.claude/projects/*/{sid}.jsonl")
    return fs[0] if fs else None


def subagents(transcript):
    if not transcript:
        return []
    out, now = [], time.time()
    for meta in glob.glob(transcript[:-6] + "/subagents/*.meta.json"):
        log = meta[:-10] + ".jsonl"
        try:
            m = json.load(open(meta))
            age = now - os.path.getmtime(log if os.path.exists(log) else meta)
        except Exception:
            continue
        if m.get("finished") or age > SUB_FRESH_S:
            continue
        action, _, _, _ = read_transcript(log) if os.path.exists(log) else ("", "", "", False)
        aid = base(meta)[: -len(".meta.json")].replace("agent-", "")
        out.append(dict(id=aid, name=m.get("description") or m.get("agentType") or "Subagent",
                        type=m.get("agentType") or "", say=short(action or "Working", 60)))
    return out


def area_of(cwd):
    """Group sessions by where they live: ~/orca/workspaces/Work/X -> Work, ~/code/x -> code."""
    rel = cwd[len(HOME) + 1:] if cwd.startswith(HOME + "/") else cwd.strip("/")
    parts = [p for p in rel.split("/") if p]
    if not parts:
        return "home"
    if parts[0] == "orca" and len(parts) > 2:
        return parts[2] if parts[1] in ("workspaces", "projects") else parts[1]
    if parts[0] in ("orca", "code", "Desktop", "Documents") and len(parts) > 1:
        return parts[0]
    return parts[0].lstrip(".") or "home"


def question(text):
    t = text.strip().rstrip("*`_ \n")
    return t.endswith("?") or t.endswith("？")


def sessions():
    now = time.time()
    out = []
    for f in glob.glob(f"{HOME}/.claude/sessions/*.json"):
        try:
            d = json.load(open(f))
            os.kill(int(d.get("pid") or base(f).split(".")[0]), 0)
        except Exception:
            continue
        sid, cwd = d.get("sessionId", ""), d.get("cwd", "")
        if not sid or under(cwd, IGNORE) or any(sid.startswith(x) for x in CFG.get("ignore_session_ids", [])):
            continue
        status = d.get("status") or "idle"
        since = (d.get("statusUpdatedAt") or d.get("updatedAt") or os.path.getmtime(f) * 1000) / 1000
        idle_min = (now - since) / 60
        if status == "idle" and idle_min > RECENT_MIN:
            continue
        tr = find_transcript(sid)
        action, reply, prompt, asking = read_transcript(tr) if tr else ("", "", "", False)
        subs = subagents(tr)
        if status == "busy" or subs:
            state, say, flag = "working", action or "Working", None
        elif status != "idle" or asking:
            state, say, flag = "flagged", "Needs you", "Waiting for your answer" if asking else "Needs your approval"
        elif question(reply):
            state, say, flag = "flagged", "Asked you a question", short(reply.strip().splitlines()[-1], 80)
        elif idle_min < DONE_MIN:
            state, say, flag = "done", "Finished · your turn", None
        else:
            state, say, flag = "idle", "In the lounge", None
        out.append(dict(id=sid, name=d.get("name") or sid[:8], cwd=cwd.replace(HOME, "~"), area=area_of(cwd),
                        kind=d.get("kind") or "", status=status, state=state, say=short(say), flag=flag,
                        since=since, prompt=short(prompt, 140), reply=short(reply, 220), subagents=subs))
    rank = {"working": 0, "flagged": 1, "done": 2, "idle": 3}
    out.sort(key=lambda s: (rank[s["state"]], -s["since"]))
    return out[:MAX_SESSIONS]


def you():
    try:
        st = json.load(open(os.path.join(DIR, "state.json")))
    except Exception:
        st = {}
    try:
        ctl = json.load(open(os.path.join(DIR, "control.json")))
    except Exception:
        ctl = {}
    if ctl.get("paused"):
        return dict(state="idle", say="On a break")
    if st.get("status") == "alert":
        return dict(state="flagged", say="Back to work?", flag="No work for a while")
    if st.get("human_work"):
        return dict(state="working", say=short(st["human_work"]))
    return dict(state="working", say="Watching the team")


def upnext():
    """The guard's suggestions (state.json), shown as cards under the office."""
    try:
        st = json.load(open(os.path.join(DIR, "state.json")))
    except Exception:
        return dict(status="watching", headline="", items=[])
    sug = st.get("suggestion") or {}
    items = [dict(session=i.get("session", ""), name=i.get("name", ""), title=i.get("title", ""),
                  why=i.get("why", ""), prompt=i.get("prompt", "")) for i in sug.get("items", [])]
    return dict(status=st.get("status", "watching"), headline=sug.get("headline", ""), items=items)


def write():
    data = dict(t=time.time(), you=you(), sessions=sessions(), upnext=upnext())
    tmp = OUT + ".tmp"
    with open(tmp, "w") as fh:
        fh.write("window.AGENTS = " + json.dumps(data, ensure_ascii=False) + ";\n")
    os.replace(tmp, OUT)


if __name__ == "__main__":
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    parent = os.getppid()
    while True:
        if "--once" not in sys.argv and os.getppid() != parent:
            break  # AttentionBar quit: stop with it
        try:
            write()
        except Exception as e:
            sys.stderr.write(f"agents_feed: {e!r}\n")
        if "--once" in sys.argv:
            break
        time.sleep(2)
