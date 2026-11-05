#!/bin/zsh
# Build AttentionBar and start it, the activity sampler and the attention guard at login (LaunchAgents).
# Usage: ./install.sh          (uninstall: ./install.sh --uninstall)
set -e
DIR="${0:a:h}"
PY="$(command -v python3)"
LA=~/Library/LaunchAgents
labels=(dev.awesome-mas.attentionbar dev.awesome-mas.activity-sampler dev.awesome-mas.attention-guard)

if [[ "$1" == "--uninstall" ]]; then
  for l in $labels; do launchctl bootout gui/$(id -u)/$l 2>/dev/null || true; rm -f $LA/$l.plist; done
  echo "uninstalled"; exit 0
fi

[[ -f "$DIR/config.json" ]] || { cp "$DIR/config.example.json" "$DIR/config.json"; echo "created config.json: edit work_paths / work_context, then re-run"; exit 1; }
command -v claude >/dev/null || echo "warning: the 'claude' CLI is not on PATH; the coach needs it"
"$DIR/AttentionBar/build.sh"
swiftc -O "$DIR/callcheck/main.swift" -o "$DIR/callcheck/callcheck"   # tells the guard when a call is on

plist() { # label, then program arguments
  local label=$1; shift
  { echo '<?xml version="1.0" encoding="UTF-8"?>'
    echo '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
    echo '<plist version="1.0"><dict>'
    echo "<key>Label</key><string>$label</string>"
    echo '<key>ProgramArguments</key><array>'; for a in "$@"; do echo "<string>$a</string>"; done; echo '</array>'
    echo "<key>WorkingDirectory</key><string>$DIR</string>"
    echo "<key>EnvironmentVariables</key><dict><key>PATH</key><string>$PATH</string><key>ATTENTIONBAR_DIR</key><string>$DIR</string></dict>"
    echo '<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>10</integer>'
    echo "<key>StandardOutPath</key><string>$DIR/${label##*.}.out</string><key>StandardErrorPath</key><string>$DIR/${label##*.}.err</string>"
    echo '</dict></plist>'; } > $LA/$label.plist
  launchctl bootout gui/$(id -u)/$label 2>/dev/null || true
  launchctl bootstrap gui/$(id -u) $LA/$label.plist
}
mkdir -p $LA
plist dev.awesome-mas.attentionbar "$DIR/AttentionBar.app/Contents/MacOS/AttentionBar"
plist dev.awesome-mas.activity-sampler "$PY" -I "$DIR/sample.py" 30
plist dev.awesome-mas.attention-guard "$PY" -I "$DIR/attention_guard.py"
echo "installed: look for the AttentionBar icon in the menu bar"
