import Foundation

/// Una finestra de quota del pla (Pro/Max): "five_hour", "seven_day"...
public struct RateWindow: Codable, Equatable {
    /// 0–100 (pot passar de 100 si l'has rebentat).
    public var usedPercent: Double
    public var resetsAt: Date?

    public init(usedPercent: Double, resetsAt: Date?) {
        self.usedPercent = usedPercent
        self.resetsAt = resetsAt
    }
}

/// La quota tal com la passa Claude Code a la statusline (camp `rate_limits`, des de la 2.1.80).
/// Ve de l'última resposta de l'API: si fa estona que no fas servir Claude Code, és vella.
public struct RateLimits: Codable, Equatable {
    public var windows: [String: RateWindow]
    public var model: String?
    public var updated: Date

    public static let fiveHour = "five_hour"
    public static let sevenDay = "seven_day"

    public init(windows: [String: RateWindow], model: String?, updated: Date) {
        self.windows = windows
        self.model = model
        self.updated = updated
    }

    /// La finestra si encara és vàlida. Si ja ha passat el reset, no sabem quant portes: nil.
    public func current(_ key: String, now: Date = Date()) -> RateWindow? {
        guard let w = windows[key] else { return nil }
        if let r = w.resetsAt, r <= now { return nil }
        return w
    }

    /// Les finestres que no són la de 5 h ni la setmanal (p. ex. límits per model).
    public var extraKeys: [String] {
        windows.keys.filter { $0 != Self.fiveHour && $0 != Self.sevenDay }.sorted()
    }

    public func isStale(now: Date = Date(), after: TimeInterval = 30 * 60) -> Bool {
        now.timeIntervalSince(updated) > after
    }
}

public enum RateLimitStore {
    public static var url: URL { SessionStore.baseDirectory.appendingPathComponent("ratelimits.json") }

    public static func write(_ r: RateLimits) throws {
        try FileManager.default.createDirectory(at: SessionStore.baseDirectory, withIntermediateDirectories: true)
        try JSONEncoder().encode(r).write(to: url, options: .atomic)
    }

    public static func load() -> RateLimits? {
        guard let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(RateLimits.self, from: data)
    }

    /// Llegeix el JSON que Claude Code passa a la statusline.
    /// Accepta tant `{"five_hour": {"used_percentage": .., "resets_at": ..}}` com una llista
    /// `[{"kind": "five_hour", "percentUsed": .., "resetsAt": ..}]`, i `resets_at` en segons
    /// Unix, mil·lisegons o ISO 8601. Millor ser tolerant que petar amb una versió nova.
    public static func parse(statusLineInput data: Data, now: Date = Date()) -> RateLimits? {
        guard let obj = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] else { return nil }

        var windows: [String: RateWindow] = [:]
        if let dict = obj["rate_limits"] as? [String: Any] {
            for (key, value) in dict {
                if let d = value as? [String: Any], let w = window(d) { windows[key] = w }
            }
        } else if let list = obj["rate_limits"] as? [[String: Any]] {
            for d in list {
                if let key = (d["kind"] ?? d["type"] ?? d["name"]) as? String, let w = window(d) {
                    windows[key] = w
                }
            }
        }
        guard !windows.isEmpty else { return nil }
        return RateLimits(windows: windows, model: modelName(obj), updated: now)
    }

    public static func modelName(_ obj: [String: Any]) -> String? {
        if let m = obj["model"] as? [String: Any] {
            return (m["display_name"] as? String) ?? (m["id"] as? String)
        }
        return obj["model"] as? String
    }

    static func window(_ d: [String: Any]) -> RateWindow? {
        guard let pct = number(d["used_percentage"] ?? d["percentUsed"] ?? d["utilization"]) else { return nil }
        return RateWindow(usedPercent: pct, resetsAt: date(d["resets_at"] ?? d["resetsAt"]))
    }

    static func number(_ any: Any?) -> Double? {
        if let n = any as? NSNumber, CFGetTypeID(n) != CFBooleanGetTypeID() { return n.doubleValue }
        if let s = any as? String { return Double(s) }
        return nil
    }

    static func date(_ any: Any?) -> Date? {
        if let s = any as? String {
            if let v = Double(s) { return epoch(v) }
            let f = ISO8601DateFormatter()
            f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let d = f.date(from: s) { return d }
            return ISO8601DateFormatter().date(from: s)
        }
        return number(any).map(epoch)
    }

    private static func epoch(_ v: Double) -> Date {
        Date(timeIntervalSince1970: v > 1e12 ? v / 1000 : v)
    }
}

/// El que fa `ClaudeBar statusline`: desa la quota i escriu una línia curta per a Claude Code.
public enum StatusLine {
    public static func render(input: Data, now: Date = Date()) -> String {
        let obj = (try? JSONSerialization.jsonObject(with: input)) as? [String: Any] ?? [:]
        var parts: [String] = []
        if let m = RateLimitStore.modelName(obj) { parts.append(m) }
        if let rl = RateLimitStore.parse(statusLineInput: input, now: now) {
            if let w = rl.current(RateLimits.fiveHour, now: now) { parts.append("5h \(Format.percent(w.usedPercent))") }
            if let w = rl.current(RateLimits.sevenDay, now: now) { parts.append("7d \(Format.percent(w.usedPercent))") }
        }
        return parts.isEmpty ? "ClaudeBar" : parts.joined(separator: " · ")
    }

    public static func runFromStdin() {
        let data = FileHandle.standardInput.readDataToEndOfFile()
        if let rl = RateLimitStore.parse(statusLineInput: data) {
            try? RateLimitStore.write(rl)
        }
        print(render(input: data))
    }
}
