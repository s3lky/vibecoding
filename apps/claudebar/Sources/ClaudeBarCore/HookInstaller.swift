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

    /// Retorna la ruta de la còpia de seguretat (nil si no hi havia fitxer).
    @discardableResult
    public static func install(executable: String, settings: URL = settingsURL()) throws -> URL? {
        try rewrite(settings) { apply(to: $0, command: command(forExecutable: executable)) }
    }

    @discardableResult
    public static func uninstall(settings: URL = settingsURL()) throws -> URL? {
        try rewrite(settings) { apply(to: $0, command: nil) }
    }

    public static func isInstalled(settings: URL = settingsURL()) -> Bool {
        guard let data = try? Data(contentsOf: settings),
              let text = String(data: data, encoding: .utf8) else { return false }
        return text.contains(marker)
    }

    private static func rewrite(_ url: URL, transform: ([String: Any]) -> [String: Any]) throws -> URL? {
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
            withJSONObject: transform(root),
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
