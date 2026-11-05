#!/usr/bin/env python3
"""Bring a Claude session to the front in whatever app hosts it.

usage: jump.py <sessionId-or-prefix>
Prints one line: the host it jumped to (orca/herdr/terminal/claude-desktop/resumed/none).
"""
import glob, json, os, subprocess, sys

HOME = os.path.expanduser("~")
sid = sys.argv[1]

def run(*a, **kw):
    return subprocess.run(a, capture_output=True, text=True, timeout=20, **kw)

def live(sid):
    for f in glob.glob(f"{HOME}/.claude/sessions/*.json"):
        try:
            pid = int(os.path.basename(f).split(".")[0]); os.kill(pid, 0)
            d = json.load(open(f))
            if d.get("sessionId", "").startswith(sid):
                return pid, d
        except Exception:
            pass
    return None, None

def ancestry(pid):
    out = []
    for _ in range(12):
        r = run("ps", "-o", "ppid=,command=", "-p", str(pid)).stdout.strip()
        if not r: break
        ppid, _, cmd = r.partition(" ")
        out.append(cmd); pid = int(ppid)
        if pid <= 1: break
    return out

def host_of(pid):
    chain = " | ".join(ancestry(pid))
    if "orca-terminal-host" in chain: return "orca"
    if "herdr-core" in chain: return "herdr"
    if "Terminal.app" in chain or "/usr/bin/login" in chain and "Orca" not in chain: return "terminal"
    if "Claude.app" in chain: return "claude-desktop"
    return "unknown"

pid, d = live(sid)
if not pid:
    # Not running anywhere: resume it in a new Herdr space.
    fs = glob.glob(f"{HOME}/.claude/projects/*/{sid}*.jsonl")
    if fs:
        full = os.path.basename(fs[0])[:-6]
        cwd = HOME
        for line in open(fs[0]):
            try: cwd = json.loads(line).get("cwd") or cwd; break
            except Exception: pass
        run("herdr-app", "do", "space.new", "--name", full[:8], "--folder", cwd,
            "--argv", json.dumps(["claude", "--resume", full]))
        run("open", "-b", "dev.herdr.app")
        print("resumed"); sys.exit()
    print("none"); sys.exit(1)

host, cwd = host_of(pid), d.get("cwd", "")
if host == "orca":
    try:
        ts = json.loads(run("orca", "terminal", "list", "--json").stdout)["result"]["terminals"]
        match = [t for t in ts if t.get("worktreePath") == cwd]
        if match:
            run("orca", "terminal", "switch", "--terminal", match[0]["handle"])
    except Exception:
        pass
    run("open", "-a", "Orca")
elif host == "herdr":
    run("open", "-b", "dev.herdr.app")
elif host == "terminal":
    tty = "/dev/" + run("ps", "-o", "tty=", "-p", str(pid)).stdout.strip()
    run("osascript", "-e", f'''tell application "Terminal"
  repeat with w in windows
    repeat with t in tabs of w
      if tty of t is "{tty}" then
        set selected of t to true
        set index of w to 1
      end if
    end repeat
  end repeat
  activate
end tell''')
elif host == "claude-desktop":
    run("open", "-b", "com.anthropic.claudefordesktop")
print(host)
