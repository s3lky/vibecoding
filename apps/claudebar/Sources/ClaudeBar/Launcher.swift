import AppKit
import ClaudeBarCore

/// Obre `claude` en una finestra de terminal nova.
///
/// Com ho fa: escriu un script `.command` temporal i l'obre amb Terminal (o iTerm).
/// Així no cal demanar permís d'Automatització per controlar el Terminal amb AppleScript.
/// L'script s'esborra a si mateix quan arrenca.
final class Launcher {
    enum TerminalApp: String, CaseIterable {
        case terminal = "com.apple.Terminal"
        case iterm = "com.googlecode.iterm2"

        var name: String { self == .terminal ? "Terminal" : "iTerm" }

        var url: URL? { NSWorkspace.shared.urlForApplication(withBundleIdentifier: rawValue) }
    }

    private enum Keys {
        static let directory = "workingDirectory"
        static let terminal = "terminalApp"
        static let askSkips = "askSkipsPermissions"
    }

    private let defaults = UserDefaults.standard

    /// Carpeta fixa on s'obre sempre Claude. Per defecte, la teva carpeta d'usuari.
    var workingDirectory: URL {
        get {
            if let p = defaults.string(forKey: Keys.directory),
               FileManager.default.fileExists(atPath: p) {
                return URL(fileURLWithPath: p, isDirectory: true)
            }
            return FileManager.default.homeDirectoryForCurrentUser
        }
        set { defaults.set(newValue.path, forKey: Keys.directory) }
    }

    var terminal: TerminalApp {
        get {
            let t = defaults.string(forKey: Keys.terminal).flatMap(TerminalApp.init(rawValue:)) ?? .terminal
            return t.url == nil ? .terminal : t
        }
        set { defaults.set(newValue.rawValue, forKey: Keys.terminal) }
    }

    /// Si la pregunta també s'obre amb --dangerously-skip-permissions. Per defecte NO.
    var askSkipsPermissions: Bool {
        get { defaults.bool(forKey: Keys.askSkips) }
        set { defaults.set(newValue, forKey: Keys.askSkips) }
    }

    var displayDirectory: String {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        let p = workingDirectory.path
        return p.hasPrefix(home) ? "~" + p.dropFirst(home.count) : p
    }

    // MARK: - Accions

    /// El botó vermell: claude sense demanar permisos.
    func openYolo() {
        launch(skipPermissions: true, prompt: nil)
    }

    /// El botó de la pregunta: demana el text i obre claude amb la pregunta ja enviada.
    func ask() {
        let alert = NSAlert()
        alert.messageText = "Pregunta a Claude Code"
        alert.informativeText = "S'obrirà \(terminal.name) a \(displayDirectory)"
            + (askSkipsPermissions ? " amb --dangerously-skip-permissions." : ".")
        let field = NSTextField(frame: NSRect(x: 0, y: 0, width: 420, height: 24))
        field.placeholderString = "Què vols saber?"
        alert.accessoryView = field
        alert.addButton(withTitle: "Pregunta")
        alert.addButton(withTitle: "Cancel·la")
        alert.window.initialFirstResponder = field
        NSApp.activate(ignoringOtherApps: true)
        guard alert.runModal() == .alertFirstButtonReturn else { return }
        let text = field.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        launch(skipPermissions: askSkipsPermissions, prompt: text)
    }

    func chooseDirectory() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.directoryURL = workingDirectory
        panel.prompt = "Tria"
        panel.message = "Carpeta on s'obrirà sempre Claude Code"
        NSApp.activate(ignoringOtherApps: true)
        if panel.runModal() == .OK, let url = panel.url {
            workingDirectory = url
        }
    }

    // MARK: - Implementació

    private func launch(skipPermissions: Bool, prompt: String?) {
        let file = FileManager.default.temporaryDirectory
            .appendingPathComponent("claudebar-\(UUID().uuidString).command")
        let body = TerminalScript.make(directory: workingDirectory.path, skipPermissions: skipPermissions, prompt: prompt)
        do {
            try body.write(to: file, atomically: true, encoding: .utf8)
            try FileManager.default.setAttributes([.posixPermissions: 0o700], ofItemAtPath: file.path)
        } catch {
            fail("No he pogut crear l'script: \(error)")
            return
        }
        guard let app = terminal.url else {
            fail("No trobo \(terminal.name).")
            return
        }
        NSWorkspace.shared.open([file], withApplicationAt: app, configuration: NSWorkspace.OpenConfiguration()) { _, error in
            if let error {
                DispatchQueue.main.async { self.fail("No s'ha pogut obrir \(self.terminal.name): \(error.localizedDescription)") }
            }
        }
    }

    private func fail(_ message: String) {
        let a = NSAlert()
        a.messageText = "ClaudeBar"
        a.informativeText = message
        NSApp.activate(ignoringOtherApps: true)
        a.runModal()
    }
}
