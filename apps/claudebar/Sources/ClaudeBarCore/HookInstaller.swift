import Foundation

/// Afegeix (o treu) els hooks de ClaudeBar a ~/.claude/settings.json sense tocar els teus.
/// Abans d'escriure en fa una còpia: settings.json.claudebar-backup-<timestamp>.
public enum HookInstaller {
    /// Marca per reconèixer els nostres hooks (és un comentari de shell, no fa res).
    static let marker = "# claudebar"

    /// (esdeveniment, necessita matcher d'eines)
    static let events: [(name: String, toolMatcher: Bool)] = [
        ("SessionStart", false),
        ("UserPromptSubmit", false),
        ("PreToolUse", true),
        ("PostToolUse", true),
        ("Notification", false),
        ("Stop", false),
        ("SessionEnd", false),
    ]

    public enum InstallError: Error, CustomStringConvertible {
        case invalidJSON(URL)
        public var description: String {
            switch self {
            case .invalidJSON(let u): return "\(u.path) no és un JSON vàlid. No el toco: arregla'l primer."
            }
        }
    }

    public static func settingsURL() -> URL {
        let env = ProcessInfo.processInfo.environment["CLAUDE_CONFIG_DIR"]?
            .split(separator: ",").first.map { String($0).trimmingCharacters(in: .whitespaces) }
        let base = env.map { URL(fileURLWithPath: $0) }
            ?? FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".claude")
        return base.appendingPathComponent("settings.json")
    }

    public static func command(forExecutable path: String) -> String {
        let quoted = "'" + path.replacingOccurrences(of: "'", with: "'\\''") + "'"
        return "\(quoted) hook \(marker)"
    }

    public static func statusLineCommand(forExecutable path: String) -> String {
        let quoted = "'" + path.replacingOccurrences(of: "'", with: "'\\''") + "'"
        return "\(quoted) statusline \(marker)"
    }

    public struct Result {
        /// Còpia de seguretat del settings.json (nil si no existia).
        public var backup: URL?
        /// Ja tenies una statusline teva i no l'he tocat (llavors no hi haurà quota).
        public var statusLineSkipped: Bool
    }

    /// Instal·la els hooks i, si no en tens cap de pròpia, la statusline (per llegir la quota).
    @discardableResult
    public static func install(executable: String, settings: URL = settingsURL()) throws -> Result {
        var skipped = false
        let backup = try rewrite(settings) { root in
            let withHooks = apply(to: root, command: command(forExecutable: executable))
            let (out, ok) = applyStatusLine(to: withHooks, command: statusLineCommand(forExecutable: executable))
            skipped = !ok
            return out
        }
        return Result(backup: backup, statusLineSkipped: skipped)
    }

    @discardableResult
    public static func uninstall(settings: URL = settingsURL()) throws -> URL? {
        try rewrite(settings) { applyStatusLine(to: apply(to: $0, command: nil), command: nil).0 }
    }

    /// Posa (o treu, si `command` és nil) la nostra statusline. Mai trepitja la teva:
    /// retorna false si n'hi havia una d'aliena i, per tant, no s'ha instal·lat.
    static func applyStatusLine(to root: [String: Any], command: String?) -> ([String: Any], Bool) {
        var root = root
        let existing = root["statusLine"] as? [String: Any]
        let isOurs = (existing?["command"] as? String)?.contains(marker) ?? false
        if root["statusLine"] != nil && !isOurs {
            return (root, false)
        }
        if let command {
            root["statusLine"] = ["type": "command", "command": command]
        } else {
            root.removeValue(forKey: "statusLine")
        }
        return (root, true)
    }

    public static func isInstalled(settings: URL = settingsURL()) -> Bool {
        guard let data = try? Data(contentsOf: settings),
              let text = String(data: data, encoding: .utf8) else { return false }
        return text.contains(marker)
    }

    private static func rewrite(_ url: URL, transform: ([String: Any]) throws -> [String: Any]) throws -> URL? {
        let fm = FileManager.default
        var root: [String: Any] = [:]
        var backup: URL?
        if fm.fileExists(atPath: url.path) {
            let data = try Data(contentsOf: url)
            if !data.isEmpty {
                guard let obj = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] else {
                    throw InstallError.invalidJSON(url)
                }
                root = obj
            }
            let stamp = Int(Date().timeIntervalSince1970)
            let b = url.deletingLastPathComponent()
                .appendingPathComponent("settings.json.claudebar-backup-\(stamp)")
            try data.write(to: b)
            backup = b
        } else {
            try fm.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        }
        let out = try JSONSerialization.data(
            withJSONObject: try transform(root),
            options: [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
        )
        try out.write(to: url, options: .atomic)
        return backup
    }

    /// Funció pura: treu els nostres hooks i, si `command` no és nil, hi posa els nous.
    static func apply(to root: [String: Any], command: String?) -> [String: Any] {
        var root = root
        var hooks = root["hooks"] as? [String: Any] ?? [:]

        for event in events {
            var groups = (hooks[event.name] as? [Any] ?? []).compactMap { group -> Any? in
                guard var g = group as? [String: Any], let list = g["hooks"] as? [[String: Any]] else {
                    return group
                }
                let kept = list.filter { !(($0["command"] as? String)?.contains(marker) ?? false) }
                if kept.count == list.count { return g }
                if kept.isEmpty { return nil }
                g["hooks"] = kept
                return g
            }
            if let command {
                var group: [String: Any] = [
                    "hooks": [["type": "command", "command": command, "timeout": 5]],
                ]
                if event.toolMatcher { group["matcher"] = "*" }
                groups.append(group)
            }
            if groups.isEmpty { hooks.removeValue(forKey: event.name) } else { hooks[event.name] = groups }
        }

        if hooks.isEmpty { root.removeValue(forKey: "hooks") } else { root["hooks"] = hooks }
        return root
    }
}
