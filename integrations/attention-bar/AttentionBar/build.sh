#!/bin/zsh
set -e
cd "$(dirname "$0")"
APP=../AttentionBar.app
mkdir -p $APP/Contents/MacOS $APP/Contents/Resources
cp AppIcon.icns $APP/Contents/Resources/
swiftc -O -swift-version 5 -o $APP/Contents/MacOS/AttentionBar main.swift 2>&1 | grep -v '^$' || true
cat > $APP/Contents/Info.plist <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleIdentifier</key><string>dev.awesome-mas.attentionbar</string>
<key>CFBundleName</key><string>AttentionBar</string>
<key>CFBundleExecutable</key><string>AttentionBar</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
<key>CFBundleIconFile</key><string>AppIcon</string>
<key>LSUIElement</key><true/>
<key>LSMinimumSystemVersion</key><string>14.0</string>
</dict></plist>
PL
codesign -s - --force $APP >/dev/null 2>&1
test -x $APP/Contents/MacOS/AttentionBar && echo built
