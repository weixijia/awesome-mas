#!/bin/sh
# Build Agent Office.app and install it (default: ~/Applications).
#   sh integrations/claude-code/macos/build.sh            → ~/Applications/Agent Office.app
#   sh integrations/claude-code/macos/build.sh ./dist     → ./dist/Agent Office.app
# Needs the Xcode Command Line Tools (xcode-select --install) and macOS 13 or later.
# Built on your own Mac and signed ad hoc, so Gatekeeper does not quarantine it.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../../.." && pwd)
DEST=${1:-"$HOME/Applications"}
mkdir -p "$DEST"
APP="$(cd "$DEST" && pwd)/Agent Office.app"
WEB="$APP/Contents/Resources/web"

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$WEB/office" "$WEB/integrations/claude-code"
swiftc -O -swift-version 5 -target "$(uname -m)-apple-macos13" -o "$APP/Contents/MacOS/AgentOffice" "$HERE/main.swift"

# the page, the drawing and the feed (no tests, no live data)
for f in model.js office.js style.css; do cp "$ROOT/office/$f" "$WEB/office/"; done
cp -R "$ROOT/office/fonts" "$WEB/office/"
for f in index.html app.js feed.py; do cp "$HERE/../$f" "$WEB/integrations/claude-code/"; done

cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleIdentifier</key><string>io.github.awesome-mas.agent-office</string>
  <key>CFBundleName</key><string>Agent Office</string>
  <key>CFBundleDisplayName</key><string>Agent Office</string>
  <key>CFBundleExecutable</key><string>AgentOffice</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSUIElement</key><true/>
  <key>LSMinimumSystemVersion</key><string>13.0</string>
  <key>NSAppleEventsUsageDescription</key><string>To bring the Terminal tab of a Claude Code session to the front when you click it.</string>
</dict></plist>
PLIST

codesign -s - --force --deep "$APP" >/dev/null 2>&1
echo "Built: $APP"
echo "Open it from Finder or run: open \"$APP\""
