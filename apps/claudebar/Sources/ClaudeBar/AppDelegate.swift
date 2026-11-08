import AppKit
import ClaudeBarCore
import ServiceManagement

final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private let mascotView = MascotBarView(frame: NSRect(x: 0, y: 0, width: MascotBarView.barWidth, height: 30))
    private lazy var touchBar = TouchBarController(mascotView: mascotView)
    private var statusItem: NSStatusItem!
    private let menu = NSMenu()

    private let scanner = UsageScanner()
    private let usageQueue = DispatchQueue(label: "claudebar.usage", qos: .utility)
    private var scanning = false
    private var summary: UsageSummary?
    private var aggregate = AggregateState(state: .idle, activeSessions: 0, lastUpdate: nil)
    private var timers: [Timer] = []

    func applicationDidFinishLaunching(_ notification: Notification) {
        SessionStore.collectGarbage()

        touchBar.setup()
        mascotView.onStatsTap = { [weak self] in self?.refreshUsage() }
        mascotView.start()

        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.image = Sprite.icon(pixel: 1.25)
        menu.delegate = self
        statusItem.menu = menu

        refreshUsage()
        pollSessions()
        schedule(every: 30) { [weak self] in self?.refreshUsage() }
        schedule(every: 1) { [weak self] in self?.pollSessions() }

        if !HookInstaller.isInstalled() {
            NSLog("ClaudeBar: els hooks no estan instal·lats; la mascota no sabrà què fa Claude Code")
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        timers.forEach { $0.invalidate() }
        mascotView.stop()
        touchBar.teardown()
    }

    private func schedule(every seconds: TimeInterval, _ block: @escaping () -> Void) {
        let t = Timer(timeInterval: seconds, repeats: true) { _ in block() }
        RunLoop.main.add(t, forMode: .common)
        timers.append(t)
    }

    // MARK: - Dades

    private func refreshUsage() {
        guard !scanning else { return }
        scanning = true
        let scanner = self.scanner
        usageQueue.async { [weak self] in
            let s = scanner.refresh()
            DispatchQueue.main.async {
                guard let self else { return }
                self.scanning = false
                self.summary = s
                self.mascotView.summary = s
            }
        }
    }

    private func pollSessions() {
        let agg = SessionStore.aggregate(SessionStore.load())
        let changed = agg.state != aggregate.state
        aggregate = agg
        mascotView.agent = agg.state
        mascotView.activeSessions = agg.activeSessions
        // Quan Claude acaba o t'espera, hi ha tokens nous: refresquem sense esperar els 30 s.
        if changed && (agg.state == .done || agg.state == .waiting) { refreshUsage() }
    }

    // MARK: - Menú de la barra de menús

    func menuNeedsUpdate(_ menu: NSMenu) {
        menu.removeAllItems()

        let (l1, l2) = Format.touchBarLines(summary)
        menu.addItem(disabled(l1))
        menu.addItem(disabled(l2))
        menu.addItem(disabled("Claude Code: \(label(for: aggregate.state))"
            + (aggregate.activeSessions > 1 ? " (\(aggregate.activeSessions) sessions)" : "")))
        if let s = summary, s.week.unpricedTokens > 0 {
            menu.addItem(disabled("⚠︎ \(Format.tokens(s.week.unpricedTokens)) tokens de models sense preu"))
        }
        menu.addItem(.separator())

        menu.addItem(item("Refresca consums", #selector(menuRefresh)))
        if HookInstaller.isInstalled() {
            menu.addItem(item("Reinstal·la els hooks de Claude Code", #selector(menuInstallHooks)))
            menu.addItem(item("Desinstal·la els hooks", #selector(menuUninstallHooks)))
        } else {
            menu.addItem(item("Instal·la els hooks de Claude Code…", #selector(menuInstallHooks)))
        }
        menu.addItem(.separator())

        menu.addItem(toggle("Sempre a sobre de la barra de l'app", touchBar.alwaysOnTop, #selector(menuToggleOnTop)))
        menu.addItem(toggle("Amaga la Control Strip", touchBar.hideControlStrip, #selector(menuToggleStrip)))
        menu.addItem(toggle("Obre en iniciar sessió", SMAppService.mainApp.status == .enabled, #selector(menuToggleLogin)))
        menu.addItem(.separator())
        menu.addItem(item("Surt", #selector(menuQuit), key: "q"))
    }

    private func label(for s: AgentState) -> String {
        switch s {
        case .idle: return "en repòs"
        case .working: return "treballant"
        case .waiting: return "t'està esperant!"
        case .done: return "ha acabat"
        case .error: return "ha petat"
        }
    }

    private func disabled(_ title: String) -> NSMenuItem {
        let i = NSMenuItem(title: title, action: nil, keyEquivalent: "")
        i.isEnabled = false
        return i
    }

    private func item(_ title: String, _ action: Selector, key: String = "") -> NSMenuItem {
        let i = NSMenuItem(title: title, action: action, keyEquivalent: key)
        i.target = self
        return i
    }

    private func toggle(_ title: String, _ on: Bool, _ action: Selector) -> NSMenuItem {
        let i = item(title, action)
        i.state = on ? .on : .off
        return i
    }

    @objc private func menuRefresh() { refreshUsage() }

    @objc private func menuInstallHooks() {
        guard let exe = Bundle.main.executablePath else { return }
        let settings = HookInstaller.settingsURL()
        let alert = NSAlert()
        alert.messageText = "Instal·lar hooks a \(settings.path)?"
        alert.informativeText = """
        S'afegiran hooks a SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, \
        Notification, Stop i SessionEnd que criden:

        \(HookInstaller.command(forExecutable: exe))

        Els teus hooks es queden com estan i abans es fa una còpia del fitxer. \
        Si després mous l'app, torna a instal·lar-los.
        """
        alert.addButton(withTitle: "Instal·la")
        alert.addButton(withTitle: "Cancel·la")
        NSApp.activate(ignoringOtherApps: true)
        guard alert.runModal() == .alertFirstButtonReturn else { return }
        do {
            let backup = try HookInstaller.install(executable: exe, settings: settings)
            info("Hooks instal·lats", backup.map { "Còpia de seguretat: \($0.path)" } ?? "")
        } catch {
            info("No s'han pogut instal·lar", "\(error)")
        }
    }

    @objc private func menuUninstallHooks() {
        do {
            let backup = try HookInstaller.uninstall()
            info("Hooks desinstal·lats", backup.map { "Còpia de seguretat: \($0.path)" } ?? "")
        } catch {
            info("No s'han pogut desinstal·lar", "\(error)")
        }
    }

    @objc private func menuToggleOnTop() { touchBar.alwaysOnTop.toggle() }
    @objc private func menuToggleStrip() { touchBar.hideControlStrip.toggle() }

    @objc private func menuToggleLogin() {
        do {
            if SMAppService.mainApp.status == .enabled {
                try SMAppService.mainApp.unregister()
            } else {
                try SMAppService.mainApp.register()
            }
        } catch {
            info("No s'ha pogut canviar", "\(error)\n\nPot ser que hagis d'aprovar-ho a Configuració del Sistema > General > Ítems d'inici.")
        }
    }

    @objc private func menuQuit() { NSApp.terminate(nil) }

    private func info(_ title: String, _ text: String) {
        let a = NSAlert()
        a.messageText = title
        a.informativeText = text
        NSApp.activate(ignoringOtherApps: true)
        a.runModal()
    }
}
