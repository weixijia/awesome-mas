// Agent Office: a menu bar app showing your live Claude Code sessions in the awesome-mas office.
// The page (../index.html), the drawing (office/) and the feed (../feed.py) are bundled in the app by build.sh.
// At launch they are copied to ~/Library/Application Support/Agent Office/web, the feed runs from there and
// writes agents.js beside the page. Nothing leaves this Mac.
import AppKit
import ServiceManagement
import WebKit

let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
    .appendingPathComponent("Agent Office", isDirectory: true)
let web = support.appendingPathComponent("web", isDirectory: true)
let page = web.appendingPathComponent("integrations/claude-code/index.html")
let feedScript = web.appendingPathComponent("integrations/claude-code/feed.py")
let agentsFile = web.appendingPathComponent("integrations/claude-code/agents.js")

// MARK: - Sessions (read from agents.js for the menu bar count and for opening a session)

struct Session { let id, name, state: String }

func readSessions() -> [Session] {
    guard let d = try? Data(contentsOf: agentsFile), var t = String(data: d, encoding: .utf8),
          let a = t.firstIndex(of: "{"), let b = t.lastIndex(of: "}") else { return [] }
    t = String(t[a...b])
    guard let o = try? JSONSerialization.jsonObject(with: Data(t.utf8)) as? [String: Any],
          let ss = o["sessions"] as? [[String: Any]] else { return [] }
    return ss.map { Session(id: $0["id"] as? String ?? "", name: $0["name"] as? String ?? "", state: $0["state"] as? String ?? "") }
}

// MARK: - Opening a session: bring the app that runs it to the front

func run(_ args: [String]) -> String {
    let p = Process(), out = Pipe()
    p.executableURL = URL(fileURLWithPath: "/usr/bin/env")
    p.arguments = args
    p.standardOutput = out
    p.standardError = FileHandle.nullDevice
    try? p.run(); p.waitUntilExit()
    return String(data: out.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
}

/// The live Claude Code process for a session id, from ~/.claude/sessions/<pid>.json.
func pidOf(session id: String) -> pid_t? {
    let dir = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".claude/sessions")
    for f in (try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? [] where f.pathExtension == "json" {
        guard let d = try? Data(contentsOf: f), let o = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
              (o["sessionId"] as? String) == id, let pid = o["pid"] as? Int, kill(pid_t(pid), 0) == 0 else { continue }
        return pid_t(pid)
    }
    return nil
}

/// Walk up the parent processes to the first one that is an app (Terminal, iTerm2, VS Code, Claude, …).
func owningApp(of pid: pid_t) -> NSRunningApplication? {
    var p = pid
    for _ in 0..<20 {
        if let app = NSRunningApplication(processIdentifier: p), app.activationPolicy == .regular { return app }
        guard let ppid = pid_t(run(["ps", "-o", "ppid=", "-p", String(p)])), ppid > 1 else { return nil }
        p = ppid
    }
    return nil
}

func openSession(_ id: String, flash: @escaping (String) -> Void) {
    DispatchQueue.global().async {
        guard let pid = pidOf(session: id), let app = owningApp(of: pid) else {
            DispatchQueue.main.async {
                NSPasteboard.general.clearContents()
                NSPasteboard.general.setString("claude --resume " + id, forType: .string)
                flash("Not running. Copied: claude --resume …")
            }
            return
        }
        // Terminal: also pick the tab running the session (macOS asks once for permission to control Terminal).
        if app.bundleIdentifier == "com.apple.Terminal" {
            let tty = run(["ps", "-o", "tty=", "-p", String(pid)])
            if !tty.isEmpty && tty != "??" {
                _ = run(["osascript", "-e", "tell application \"Terminal\" to repeat with w in windows\nrepeat with t in tabs of w\nif tty of t is \"/dev/\(tty)\" then\nset selected of t to true\nset index of w to 1\nend if\nend repeat\nend repeat"])
            }
        }
        DispatchQueue.main.async { app.activate() }
    }
}

// MARK: - App

final class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandler {
    var item: NSStatusItem!
    let popover = NSPopover()
    var webView: WKWebView!
    var feed: Process?
    var timer: Timer?

    func applicationDidFinishLaunching(_ n: Notification) {
        installWeb()
        startFeed()

        let cfg = WKWebViewConfiguration()
        cfg.userContentController.add(self, name: "jump")
        cfg.userContentController.add(self, name: "height")
        webView = WKWebView(frame: NSRect(x: 0, y: 0, width: 600, height: 420), configuration: cfg)
        webView.loadFileURL(page, allowingReadAccessTo: web)
        let vc = NSViewController()
        vc.view = webView
        vc.preferredContentSize = NSSize(width: 600, height: 420)
        popover.contentViewController = vc
        popover.behavior = .transient

        item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        item.button?.target = self
        item.button?.action = #selector(clicked)
        item.button?.sendAction(on: [.leftMouseUp, .rightMouseUp])
        updateIcon()
        timer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in self?.updateIcon() }
    }

    /// Copy the bundled page, drawing and feed out of the app, fresh on every launch (agents.js is kept).
    func installWeb() {
        guard let src = Bundle.main.resourceURL?.appendingPathComponent("web") else { return }
        let fm = FileManager.default
        try? fm.createDirectory(at: support, withIntermediateDirectories: true)
        for sub in ["office", "integrations/claude-code"] {
            let from = src.appendingPathComponent(sub), to = web.appendingPathComponent(sub)
            try? fm.createDirectory(at: to, withIntermediateDirectories: true)
            for f in (try? fm.contentsOfDirectory(at: from, includingPropertiesForKeys: nil)) ?? [] {
                let dest = to.appendingPathComponent(f.lastPathComponent)
                try? fm.removeItem(at: dest)
                try? fm.copyItem(at: f, to: dest)
            }
        }
    }

    func startFeed() {
        let p = Process()
        p.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        p.arguments = ["python3", "-I", feedScript.path, "--parent-pid", String(ProcessInfo.processInfo.processIdentifier)]
        p.standardOutput = FileHandle.nullDevice
        p.standardError = FileHandle.nullDevice
        p.terminationHandler = { [weak self] _ in
            DispatchQueue.main.asyncAfter(deadline: .now() + 5) { self?.startFeed() } // restart if it ever crashes
        }
        try? p.run()
        feed = p
    }

    func applicationWillTerminate(_ n: Notification) {
        feed?.terminationHandler = nil
        feed?.terminate()
    }

    /// Menu bar: the number of working sessions; orange hand when a session needs you.
    func updateIcon() {
        guard let b = item.button else { return }
        let ss = readSessions()
        let working = ss.filter { $0.state == "working" }.count, flagged = ss.filter { $0.state == "flagged" }.count
        let sym = flagged > 0 ? "hand.raised.circle.fill" : "person.3.sequence.fill"
        let img = NSImage(systemSymbolName: sym, accessibilityDescription: "Agent Office")
        img?.isTemplate = flagged == 0
        b.image = img
        b.contentTintColor = flagged > 0 ? .systemOrange : nil
        b.imagePosition = .imageLeading
        b.title = working > 0 ? " \(working)" : ""
        b.toolTip = ss.isEmpty ? "No Claude Code sessions" : "\(working) working · \(flagged) need you · \(ss.count) sessions"
    }

    @objc func clicked() {
        if NSApp.currentEvent?.type == .rightMouseUp { showMenu(); return }
        if popover.isShown { popover.performClose(nil); return }
        guard let b = item.button else { return }
        NSApp.activate(ignoringOtherApps: true)
        popover.show(relativeTo: b.bounds, of: b, preferredEdge: .minY)
    }

    func showMenu() {
        let m = NSMenu()
        let login = NSMenuItem(title: "Launch at Login", action: #selector(toggleLogin), keyEquivalent: "")
        login.state = SMAppService.mainApp.status == .enabled ? .on : .off
        m.addItem(login)
        m.addItem(NSMenuItem(title: "Open in Browser", action: #selector(openInBrowser), keyEquivalent: ""))
        m.addItem(.separator())
        m.addItem(NSMenuItem(title: "Quit Agent Office", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        m.items.forEach { if $0.action != #selector(NSApplication.terminate(_:)) { $0.target = self } }
        item.menu = m
        item.button?.performClick(nil)
        item.menu = nil // left click opens the popover again
    }

    @objc func toggleLogin() {
        do {
            if SMAppService.mainApp.status == .enabled { try SMAppService.mainApp.unregister() } else { try SMAppService.mainApp.register() }
        } catch { flash("Launch at login: \(error.localizedDescription)") }
    }

    @objc func openInBrowser() { NSWorkspace.shared.open(page) }

    func flash(_ s: String) {
        item.button?.toolTip = s
        let a = NSAlert(); a.messageText = s; a.alertStyle = .informational
        if s.hasPrefix("Not running") { a.informativeText = "The resume command is on the clipboard. Paste it in a terminal." }
        a.runModal()
    }

    func userContentController(_ c: WKUserContentController, didReceive msg: WKScriptMessage) {
        switch msg.name {
        case "jump":
            if let id = msg.body as? String { popover.performClose(nil); openSession(id) { [weak self] s in self?.flash(s) } }
        case "height":
            if let h = msg.body as? Double {
                let size = NSSize(width: 600, height: min(max(CGFloat(h), 240), 720))
                popover.contentViewController?.preferredContentSize = size
                popover.contentSize = size
            }
        default: break
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
