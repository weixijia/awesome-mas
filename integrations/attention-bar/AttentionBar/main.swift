// AttentionBar — menu bar face of attention_guard.py (in the folder that holds AttentionBar.app)
// Reads state.json, writes control.json, opens itself when the guard raises an alert.
import AppKit
import SwiftUI
import WebKit

let home = FileManager.default.homeDirectoryForCurrentUser.path
// The kit folder: $ATTENTIONBAR_DIR, else the folder AttentionBar.app was built into (see build.sh).
let dir = ProcessInfo.processInfo.environment["ATTENTIONBAR_DIR"]
    ?? Bundle.main.bundleURL.deletingLastPathComponent().path
let statePath = dir + "/state.json"
let controlPath = dir + "/control.json"
let rossPath = dir + "/ross.png"
let rossSVG = dir + "/ross.svg"
let rossSticker = dir + "/ross-sticker.png"
let officeDir = dir + "/office"
let agentsPath = officeDir + "/agents.js"
func rossImage() -> NSImage? { NSImage(contentsOfFile: rossSticker) ?? NSImage(contentsOfFile: rossSVG) }

// MARK: - Model

struct Item: Identifiable {
    let id: String
    let session, name, folder, title, why, prompt: String
}

final class Model: ObservableObject {
    @Published var status = "watching"      // watching | alert | paused
    @Published var headline = ""
    @Published var noticed = ""
    @Published var items: [Item] = []
    @Published var busyWork: [String] = []
    @Published var humanWork: String? = nil
    @Published var idleMin = 0
    @Published var lastWork: Double = Date().timeIntervalSince1970
    @Published var suggestedAt: Double = 0
    @Published var thinking = false
    @Published var pausedSince: Double = 0
    @Published var toast: String? = nil
    @Published var now = Date()
    @Published var guardAlive = true
    @Published var agentsWorking = 0      // Claude sessions busy right now (from agents_feed.py)
    @Published var agentsFlagged = 0      // sessions waiting on you
    @Published var agentsTotal = 0
    @Published var officeHeight: CGFloat = 420
    var sessionNames: [String: String] = [:]
    var onAlert: (() -> Void)?
    var onChange: (() -> Void)?
    private var lastAlertKey: Double = -1

    func reload() {
        now = Date()
        guard let data = FileManager.default.contents(atPath: statePath),
              let st = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
        let newStatus = st["status"] as? String ?? "watching"
        busyWork = st["busy_work"] as? [String] ?? []
        humanWork = st["human_work"] as? String
        lastWork = st["last_work"] as? Double ?? lastWork
        thinking = st["thinking"] as? Bool ?? false
        idleMin = st["idle_min"] as? Int ?? 0
        if let upd = st["updated"] as? String {
            let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            if let d = f.date(from: upd) { guardAlive = Date().timeIntervalSince(d) < 90 || newStatus == "paused" }
        }
        readAgents()
        let ctl = readControl()
        pausedSince = ctl["since"] as? Double ?? 0
        let sugAt = st["suggested_at"] as? Double ?? 0
        if let sug = st["suggestion"] as? [String: Any] {
            headline = sug["headline"] as? String ?? ""
            noticed = sug["noticed"] as? String ?? ""
            items = (sug["items"] as? [[String: Any]] ?? []).enumerated().map { i, d in
                Item(id: "\(i)-\(d["session"] as? String ?? "")",
                     session: d["session"] as? String ?? "", name: d["name"] as? String ?? "",
                     folder: d["folder"] as? String ?? "", title: d["title"] as? String ?? "",
                     why: d["why"] as? String ?? "", prompt: d["prompt"] as? String ?? "")
            }
        }
        status = (ctl["paused"] as? Bool ?? false) ? "paused" : newStatus
        // Pop open when a fresh alert lands, or when "Suggest now" results arrive.
        if sugAt != suggestedAt {
            let fresh = suggestedAt != 0 || sugAt > Date().timeIntervalSince1970 - 30
            suggestedAt = sugAt
            if fresh && sugAt != lastAlertKey && (status == "alert" || requestedRefresh) {
                lastAlertKey = sugAt; requestedRefresh = false; onAlert?()
            }
        }
        onChange?()
    }

    var requestedRefresh = false

    func readAgents() {
        guard let d = FileManager.default.contents(atPath: agentsPath),
              var txt = String(data: d, encoding: .utf8) else { return }
        if let a = txt.firstIndex(of: "{"), let b = txt.lastIndex(of: "}") { txt = String(txt[a...b]) } else { return }
        guard let o = try? JSONSerialization.jsonObject(with: Data(txt.utf8)) as? [String: Any],
              let ss = o["sessions"] as? [[String: Any]] else { return }
        agentsTotal = ss.count
        agentsWorking = ss.filter { $0["state"] as? String == "working" }.count
        agentsFlagged = ss.filter { $0["state"] as? String == "flagged" }.count
        for x in ss { if let id = x["id"] as? String { sessionNames[id] = x["name"] as? String ?? id } }
    }

    func readControl() -> [String: Any] {
        guard let d = FileManager.default.contents(atPath: controlPath),
              let o = try? JSONSerialization.jsonObject(with: d) as? [String: Any] else { return [:] }
        return o
    }
    func writeControl(_ patch: [String: Any]) {
        var c = readControl()
        for (k, v) in patch { c[k] = v }
        if let d = try? JSONSerialization.data(withJSONObject: c) {
            try? d.write(to: URL(fileURLWithPath: controlPath), options: .atomic)
        }
        reload()
    }

    func takeBreak() { writeControl(["paused": true, "since": Date().timeIntervalSince1970]) }
    func endBreak() { writeControl(["paused": false]) }
    func suggestNow() { requestedRefresh = true; writeControl(["refresh_at": Date().timeIntervalSince1970]); thinking = true }

    func go(_ item: Item) {
        if !item.prompt.isEmpty {
            NSPasteboard.general.clearContents()
            NSPasteboard.general.setString(item.prompt, forType: .string)
        }
        flash(item.prompt.isEmpty ? "Opening \(item.name)…" : "Prompt copied — paste it in \(item.name)")
        jump(session: item.session, name: item.name)
    }

    func jump(session: String, name: String? = nil) {
        let name = name ?? sessionNames[session] ?? "the session"
        DispatchQueue.global().async {
            let p = Process()
            p.executableURL = URL(fileURLWithPath: "/usr/bin/env")
            p.arguments = ["python3", "-I", dir + "/jump.py", session]
            let pipe = Pipe(); p.standardOutput = pipe
            try? p.run(); p.waitUntilExit()
            let host = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8)?
                .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            if host == "none" { DispatchQueue.main.async { self.flash("Couldn't find \(name)") } }
        }
    }

    func flash(_ s: String) {
        toast = s
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { if self.toast == s { self.toast = nil } }
    }

    func mins(since t: Double) -> Int { max(0, Int((now.timeIntervalSince1970 - t) / 60)) }
}

// MARK: - Views

struct RossFace: View {
    var size: CGFloat
    var body: some View {
        if let img = NSImage(contentsOfFile: rossSticker) {   // die-cut sticker made from his photo
            Image(nsImage: img).resizable().interpolation(.high).scaledToFit().frame(width: size, height: size)
        } else if let img = NSImage(contentsOfFile: rossPath) {
            Image(nsImage: img).resizable().scaledToFill()
                .frame(width: size, height: size).clipShape(Circle())
                .overlay(Circle().strokeBorder(Color.white, lineWidth: max(2, size / 20)))
                .shadow(color: .black.opacity(0.2), radius: 2, y: 1)
        } else if let img = NSImage(contentsOfFile: rossSVG) { // die-cut sticker, no clipping
            Image(nsImage: img).resizable().scaledToFit().frame(width: size, height: size)
        } else {
            Text("🦕").font(.system(size: size * 0.7)).frame(width: size, height: size)
        }
    }
}

struct ItemRow: View {
    let item: Item
    let rank: Int
    let action: () -> Void
    @State private var hover = false
    var body: some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                Text("\(rank)")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(rank == 1 ? Color.white : Color.secondary)
                    .frame(width: 22, height: 22)
                    .background(Circle().fill(rank == 1 ? Color.accentColor : Color.primary.opacity(0.08)))
                VStack(alignment: .leading, spacing: 3) {
                    Text(item.title)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.primary)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(item.why)
                        .font(.system(size: 12))
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                    HStack(spacing: 4) {
                        Image(systemName: "terminal").font(.system(size: 9, weight: .semibold))
                        Text(item.name).font(.system(size: 11, weight: .medium))
                    }
                    .foregroundStyle(.tertiary)
                    .padding(.top, 1)
                }
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 12).padding(.vertical, 10)
            .background(RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(hover ? Color.primary.opacity(0.06) : Color.clear))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .onHover { hover = $0 }
        .help(item.prompt.isEmpty ? "Open this session" : "Copies: \(item.prompt)")
    }
}

struct RefreshButton: View {
    @ObservedObject var m: Model
    @State private var hover = false
    var body: some View {
        Button { m.suggestNow() } label: {
            ZStack {
                if m.thinking { ProgressView().controlSize(.small) }
                else { Image(systemName: "arrow.clockwise").font(.system(size: 13, weight: .semibold)) }
            }
            .frame(width: 28, height: 28)
            .foregroundStyle(hover ? Color.primary : Color.secondary)
            .background(Circle().fill(Color.primary.opacity(hover ? 0.1 : 0)))
            .contentShape(Circle())
        }
        .buttonStyle(.plain)
        .disabled(m.thinking)
        .onHover { hover = $0 }
        .help("New suggestions")
    }
}

struct Header: View {
    @ObservedObject var m: Model
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            switch m.status {
            case "alert":
                Text("GO BACK TO WORK")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                    .tracking(0.5)
                    .foregroundStyle(LinearGradient(colors: [Color(red: 0.95, green: 0.27, blue: 0.20), Color(red: 0.98, green: 0.55, blue: 0.15)],
                                                    startPoint: .leading, endPoint: .trailing))
                Text("No work for \(m.mins(since: m.lastWork)) min")
                    .font(.system(size: 12, weight: .medium)).foregroundStyle(.secondary)
            case "paused":
                Text("On a break").font(.system(size: 22, weight: .heavy, design: .rounded))
                Text("\(m.mins(since: m.pausedSince)) min")
                    .font(.system(size: 12, weight: .medium)).foregroundStyle(.secondary)
            default:
                let on = !m.busyWork.isEmpty || m.humanWork != nil
                HStack(spacing: 8) {
                    Circle().fill(on ? Color.green : Color.orange).frame(width: 8, height: 8)
                    Text(on ? "On track" : "Watching")
                        .font(.system(size: 20, weight: .heavy, design: .rounded))
                }
                if !on {
                    Text("No work for \(m.mins(since: m.lastWork)) min")
                        .font(.system(size: 12, weight: .medium)).foregroundStyle(.secondary)
                }
            }
            if !m.guardAlive {
                Label("The guard isn't running", systemImage: "exclamationmark.triangle.fill")
                    .font(.system(size: 11, weight: .semibold)).foregroundStyle(.orange)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// Same paper as the office sheet (office/agents.html --sheet), so the popover reads as one surface.
let sheetColor = Color(nsColor: NSColor(name: nil) { a in
    a.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
        ? NSColor(srgbRed: 0x1C / 255.0, green: 0x1F / 255.0, blue: 0x22 / 255.0, alpha: 1)
        : NSColor(srgbRed: 0xF3 / 255.0, green: 0xF4 / 255.0, blue: 0xF1 / 255.0, alpha: 1)
})

// The awesome-mas office drawing (office/agents.html), fed by agents_feed.py.
struct AgentsOffice: NSViewRepresentable {
    @ObservedObject var m: Model

    final class Coordinator: NSObject, WKScriptMessageHandler {
        let m: Model
        init(_ m: Model) { self.m = m }
        func userContentController(_ c: WKUserContentController, didReceive msg: WKScriptMessage) {
            switch msg.name {
            case "jump":
                if let sid = msg.body as? String { m.flash("Opening \(m.sessionNames[sid] ?? "session")…"); m.jump(session: sid) }
            case "go":
                if let sid = msg.body as? String, let it = m.items.first(where: { $0.session == sid }) { m.go(it) }
            case "height":
                if let h = msg.body as? Double { DispatchQueue.main.async { self.m.officeHeight = CGFloat(h) } }
            default: break
            }
        }
    }
    func makeCoordinator() -> Coordinator { Coordinator(m) }

    func makeNSView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        cfg.userContentController.add(context.coordinator, name: "jump")
        cfg.userContentController.add(context.coordinator, name: "height")
        cfg.userContentController.add(context.coordinator, name: "go")
        let web = WKWebView(frame: .zero, configuration: cfg)
        web.setValue(false, forKey: "drawsBackground")
        let page = URL(fileURLWithPath: officeDir + "/agents.html")
        web.loadFileURL(page, allowingReadAccessTo: URL(fileURLWithPath: officeDir, isDirectory: true))
        return web
    }
    func updateNSView(_ web: WKWebView, context: Context) {}
}

struct AgentsSection: View {
    @ObservedObject var m: Model
    var body: some View {
        VStack(spacing: 0) {
            Divider()
            AgentsOffice(m: m)
                .frame(height: min(max(m.officeHeight, 240), 700))
        }
    }
}

struct PanelView: View {
    @ObservedObject var m: Model
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 8) {
                Header(m: m)
                if m.status != "paused" { RefreshButton(m: m) }
            }
            .padding(.leading, 18).padding(.trailing, 12).padding(.top, 14).padding(.bottom, 12)

            AgentsSection(m: m)
            if m.status == "paused" {
                // Compact break bar: one row, so the office above keeps the popover a sensible height.
                HStack(spacing: 14) {
                    RossFace(size: 64)
                    VStack(alignment: .leading, spacing: 8) {
                        Text("“WE WERE ON A BREAK!”")
                            .font(.system(size: 13, weight: .bold, design: .rounded)).foregroundStyle(.secondary)
                        Button(action: m.endBreak) {
                            Text("I'm back — resume watching")
                                .font(.system(size: 13, weight: .semibold))
                                .frame(maxWidth: .infinity).padding(.vertical, 4)
                        }
                        .buttonStyle(.borderedProminent).controlSize(.large)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 18).padding(.top, 12).padding(.bottom, 14)
                .overlay(alignment: .top) { Divider() }
            } else {
                if let t = m.toast {
                    Label(t, systemImage: "doc.on.clipboard")
                        .font(.system(size: 11, weight: .medium)).foregroundStyle(Color.accentColor)
                        .padding(.horizontal, 18).padding(.top, 8)
                }

                Divider().padding(.top, m.toast == nil ? 0 : 8)
                HStack(spacing: 10) {
                    Button(action: m.takeBreak) {
                        HStack(spacing: 10) {
                            RossFace(size: 36)
                            VStack(alignment: .leading, spacing: 0) {
                                Text("I'm on a break!!").font(.system(size: 13, weight: .semibold))
                                Text("Pause monitoring").font(.system(size: 10)).foregroundStyle(.secondary)
                            }
                        }
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .help("WE WERE ON A BREAK!")
                    Spacer()
                    Menu {
                        Button("Open suggestions.md") { NSWorkspace.shared.open(URL(fileURLWithPath: dir + "/suggestions.md")) }
                        Button("Open activity log") { NSWorkspace.shared.open(URL(fileURLWithPath: dir + "/log.jsonl")) }
                        Button("Edit work rules…") { NSWorkspace.shared.open(URL(fileURLWithPath: dir + "/config.json")) }
                        Divider()
                        Button("Quit AttentionBar") { NSApp.terminate(nil) }
                    } label: { Image(systemName: "ellipsis.circle") }
                    .menuStyle(.borderlessButton).menuIndicator(.hidden).fixedSize()
                }
                .padding(.horizontal, 18).padding(.vertical, 12)
            }
        }
        .frame(width: 600)
        .background(sheetColor)
    }
}

// MARK: - App

final class AppDelegate: NSObject, NSApplicationDelegate {
    let model = Model()
    var item: NSStatusItem!
    let popover = NSPopover()
    var timer: Timer?
    var feed: Process?

    // agents_feed.py writes office/agents.js every 2 s; it exits when this app does.
    func startFeed() {
        let p = Process()
        p.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        p.arguments = ["python3", "-I", dir + "/agents_feed.py"]
        p.standardOutput = FileHandle.nullDevice
        p.standardError = FileHandle(forWritingAtPath: dir + "/feed.err") ?? FileHandle.nullDevice
        p.terminationHandler = { [weak self] _ in
            DispatchQueue.main.asyncAfter(deadline: .now() + 5) { self?.startFeed() }  // restart if it crashes
        }
        try? p.run()
        feed = p
    }

    func applicationWillTerminate(_ n: Notification) {
        feed?.terminationHandler = nil
        feed?.terminate()
    }

    func applicationDidFinishLaunching(_ n: Notification) {
        item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        item.button?.target = self
        item.button?.action = #selector(toggle)
        popover.behavior = .transient
        popover.animates = true
        let host = NSHostingController(rootView: PanelView(m: model))
        host.sizingOptions = [.preferredContentSize]
        popover.contentViewController = host
        model.onAlert = { [weak self] in self?.show() }
        model.onChange = { [weak self] in self?.updateIcon() }
        FileManager.default.createFile(atPath: dir + "/feed.err", contents: nil)
        startFeed()
        model.reload()
        timer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in self?.model.reload() }
    }

    func updateIcon() {
        guard let b = item.button else { return }
        let (sym, tint, title): (String, NSColor?, String) = {
            switch model.status {
            case "alert": return ("exclamationmark.circle.fill", .systemRed, " \(model.mins(since: model.lastWork))m")
            case "paused": return ("cup.and.saucer.fill", nil, " \(model.mins(since: model.pausedSince))m")
            default:
                let sym = model.busyWork.isEmpty && model.humanWork == nil ? "scope" : "bolt.circle.fill"
                if model.agentsFlagged > 0 { return ("hand.raised.circle.fill", .systemOrange, " \(model.agentsWorking)") }
                return (sym, nil, model.agentsWorking > 0 ? " \(model.agentsWorking)" : "")
            }
        }()
        var img = NSImage(systemSymbolName: sym, accessibilityDescription: "Attention")
        img?.isTemplate = tint == nil
        if model.status == "paused", let r = rossImage() {
            r.size = NSSize(width: 18, height: 18); r.isTemplate = false; img = r
        }
        b.image = img
        b.contentTintColor = tint
        b.imagePosition = .imageLeading
        b.title = title
    }

    @objc func toggle() { popover.isShown ? popover.performClose(nil) : show() }

    func show() {
        guard let b = item.button else { return }
        model.reload()
        NSApp.activate(ignoringOtherApps: true)
        popover.show(relativeTo: b.bounds, of: b, preferredEdge: .minY)
        popover.contentViewController?.view.window?.makeKey()
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
