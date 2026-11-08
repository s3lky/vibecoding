import Foundation

/// Què està fent Claude Code, segons els hooks.
public enum AgentState: String, Codable, Comparable {
    case idle, done, working, error, waiting

    /// Prioritat quan hi ha diverses sessions obertes: el que més et cal saber guanya.
    var priority: Int {
        switch self {
        case .idle: return 0
        case .done: return 1
        case .working: return 2
        case .error: return 3
        case .waiting: return 4
        }
    }

    public static func < (a: AgentState, b: AgentState) -> Bool { a.priority < b.priority }
}

public struct SessionRecord: Codable, Equatable {
    public var sessionId: String
    public var state: AgentState
    public var event: String
    public var cwd: String?
    public var updated: Date
}

public struct AggregateState: Equatable {
    public var state: AgentState
    /// Sessions que estan treballant o esperant-te.
    public var activeSessions: Int
    public var lastUpdate: Date?
}

/// Cada sessió de Claude Code té el seu fitxer JSON a ~/.claudebar/sessions.
/// El hook l'escriu i l'app el llegeix. Sense sockets ni dimonis: només fitxers.
public enum SessionStore {
    /// ~/.claudebar (o $CLAUDEBAR_HOME): aquí hi ha tot el que escriuen els hooks i la statusline.
    public static var baseDirectory: URL {
        if let custom = ProcessInfo.processInfo.environment["CLAUDEBAR_HOME"], !custom.isEmpty {
            return URL(fileURLWithPath: custom)
        }
        return FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".claudebar")
    }

    public static var directory: URL { baseDirectory.appendingPathComponent("sessions") }

    // Temps màxims abans de considerar un estat caducat (Claude Code mort, terminal tancat...).
    static let workingTTL: TimeInterval = 15 * 60
    static let doneTTL: TimeInterval = 3 * 60
    static let waitingTTL: TimeInterval = 60 * 60
    static let errorTTL: TimeInterval = 5 * 60
    static let garbageTTL: TimeInterval = 24 * 3600

    static func fileURL(for sessionId: String) -> URL {
        let safe = String(sessionId.unicodeScalars.map {
            CharacterSet.alphanumerics.contains($0) || $0 == "-" || $0 == "_" ? Character($0) : "_"
        })
        return directory.appendingPathComponent((safe.isEmpty ? "unknown" : safe) + ".json")
    }

    static let encoder = JSONEncoder()
    static let decoder = JSONDecoder()

    public static func write(_ r: SessionRecord) throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        try encoder.encode(r).write(to: fileURL(for: r.sessionId), options: .atomic)
    }

    public static func remove(sessionId: String) {
        try? FileManager.default.removeItem(at: fileURL(for: sessionId))
    }

    public static func load() -> [SessionRecord] {
        let fm = FileManager.default
        guard let files = try? fm.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil) else {
            return []
        }
        return files.filter { $0.pathExtension == "json" }.compactMap { url in
            guard let data = try? Data(contentsOf: url) else { return nil }
            return try? decoder.decode(SessionRecord.self, from: data)
        }
    }

    /// Esborra fitxers de sessions mortes de fa més d'un dia.
    public static func collectGarbage(now: Date = Date()) {
        for r in load() where now.timeIntervalSince(r.updated) > garbageTTL {
            remove(sessionId: r.sessionId)
        }
    }

    /// Estat efectiu d'una sessió tenint en compte la caducitat.
    static func effectiveState(_ r: SessionRecord, now: Date) -> AgentState {
        let age = now.timeIntervalSince(r.updated)
        switch r.state {
        case .working where age > workingTTL: return .idle
        case .done where age > doneTTL: return .idle
        case .waiting where age > waitingTTL: return .idle
        case .error where age > errorTTL: return .idle
        default: return r.state
        }
    }

    public static func aggregate(_ records: [SessionRecord], now: Date = Date()) -> AggregateState {
        var best = AgentState.idle
        var active = 0
        var last: Date?
        for r in records {
            let s = effectiveState(r, now: now)
            if s > best { best = s }
            if s == .working || s == .waiting { active += 1 }
            if last == nil || r.updated > last! { last = r.updated }
        }
        return AggregateState(state: best, activeSessions: active, lastUpdate: last)
    }
}

/// El que fa `ClaudeBar hook`: llegeix el JSON del hook per stdin i desa l'estat.
/// IMPORTANT: no ha d'escriure res a stdout (a UserPromptSubmit s'afegiria al context de Claude).
public enum HookHandler {
    public enum Action: Equatable {
        case set(SessionRecord)
        case remove(String)
        case ignore
    }

    public static func action(for input: Data, now: Date = Date()) -> Action {
        guard
            let obj = (try? JSONSerialization.jsonObject(with: input)) as? [String: Any],
            let event = obj["hook_event_name"] as? String,
            let session = obj["session_id"] as? String
        else { return .ignore }

        let state: AgentState
        switch event {
        case "SessionEnd":
            return .remove(session)
        case "SessionStart":
            state = .idle
        case "UserPromptSubmit", "PreToolUse", "PostToolUse", "SubagentStart":
            state = .working
        case "Stop":
            state = .done
        case "StopFailure":
            state = .error
        case "PermissionRequest":
            state = .waiting
        case "Notification":
            // idle_prompt / agent_completed = ha acabat i t'espera; la resta (permisos...) = et necessita.
            let type = (obj["notification_type"] as? String ?? "").lowercased()
            state = (type.contains("idle") || type.contains("completed")) ? .done : .waiting
        default:
            return .ignore
        }
        return .set(SessionRecord(sessionId: session, state: state, event: event,
                                  cwd: obj["cwd"] as? String, updated: now))
    }

    public static func runFromStdin() {
        let data = FileHandle.standardInput.readDataToEndOfFile()
        switch action(for: data) {
        case .set(let r): try? SessionStore.write(r)
        case .remove(let id): SessionStore.remove(sessionId: id)
        case .ignore: break
        }
    }
}
