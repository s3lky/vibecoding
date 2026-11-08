import Foundation

public struct UsageEntry {
    public let date: Date
    public let model: String
    public let usage: TokenUsage
    public let cost: Double?
    let dedupeKey: String?
}

public struct Totals: Equatable {
    public var tokens = 0
    public var cost = 0.0
    /// Tokens de models que no surten a la taula de preus (no sumen al cost).
    public var unpricedTokens = 0
    public var requests = 0

    public init() {}

    mutating func add(_ e: UsageEntry) {
        tokens += e.usage.total
        requests += 1
        if let c = e.cost { cost += c } else { unpricedTokens += e.usage.total }
    }
}

/// Bloc de 5 hores a l'estil de ccusage: comença a l'hora en punt del primer missatge.
/// Ull: és una aproximació. Els límits reals del pla els calcula Anthropic al servidor.
public struct UsageBlock: Equatable {
    public let start: Date
    public var end: Date { start.addingTimeInterval(UsageScanner.blockLength) }
    public var totals: Totals
    public var lastActivity: Date
}

public struct UsageSummary: Equatable {
    public var today = Totals()
    public var week = Totals()
    /// Bloc de 5h actiu (nil si fa més de 5h que no fas res).
    public var activeBlock: UsageBlock?
    public var lastActivity: Date?
    public var filesScanned = 0
}

/// Llegeix els transcripts JSONL de Claude Code de forma incremental
/// (només llegeix els bytes nous de cada fitxer a cada refresc).
/// No és thread-safe: crida-la sempre des de la mateixa cua.
public final class UsageScanner {
    public static let blockLength: TimeInterval = 5 * 3600
    static let retention: TimeInterval = 8 * 24 * 3600

    public let roots: [URL]
    private var offsets: [String: UInt64] = [:]
    private var seen = Set<String>()
    private var entries: [UsageEntry] = []

    private let isoFrac: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()
    private let isoPlain = ISO8601DateFormatter()

    public init(roots: [URL] = UsageScanner.defaultRoots()) {
        self.roots = roots
    }

    /// $CLAUDE_CONFIG_DIR (pot ser una llista separada per comes), ~/.config/claude i ~/.claude.
    public static func defaultRoots() -> [URL] {
        let fm = FileManager.default
        let home = fm.homeDirectoryForCurrentUser
        var dirs: [URL] = []
        if let env = ProcessInfo.processInfo.environment["CLAUDE_CONFIG_DIR"], !env.isEmpty {
            dirs += env.split(separator: ",").map {
                URL(fileURLWithPath: String($0).trimmingCharacters(in: .whitespaces))
            }
        }
        dirs.append(home.appendingPathComponent(".config/claude"))
        dirs.append(home.appendingPathComponent(".claude"))
        var unique: [URL] = []
        for d in dirs.map({ $0.appendingPathComponent("projects").standardizedFileURL })
        where !unique.contains(d) {
            unique.append(d)
        }
        return unique
    }

    public func refresh(now: Date = Date()) -> UsageSummary {
        let cutoff = now.addingTimeInterval(-Self.retention)
        var files = 0
        for file in jsonlFiles(modifiedAfter: cutoff) {
            files += 1
            readNewLines(of: file)
        }
        prune(before: cutoff)
        var s = summarize(now: now)
        s.filesScanned = files
        return s
    }

    // MARK: - Fitxers

    private func jsonlFiles(modifiedAfter cutoff: Date) -> [URL] {
        let fm = FileManager.default
        let keys: [URLResourceKey] = [.contentModificationDateKey, .isRegularFileKey]
        var result: [URL] = []
        for root in roots where fm.fileExists(atPath: root.path) {
            guard let en = fm.enumerator(at: root, includingPropertiesForKeys: keys) else { continue }
            for case let url as URL in en where url.pathExtension == "jsonl" {
                let v = try? url.resourceValues(forKeys: Set(keys))
                guard v?.isRegularFile == true else { continue }
                if let m = v?.contentModificationDate, m < cutoff { continue }
                result.append(url)
            }
        }
        return result
    }

    private func readNewLines(of url: URL) {
        let path = url.path
        guard let handle = try? FileHandle(forReadingFrom: url) else { return }
        defer { try? handle.close() }

        let size = (try? handle.seekToEnd()) ?? 0
        var offset = offsets[path] ?? 0
        if size < offset { offset = 0 } // fitxer reescrit o truncat
        guard size > offset else { return }
        do { try handle.seek(toOffset: offset) } catch { return }
        guard let data = try? handle.readToEnd(), !data.isEmpty else { return }

        // Només processem fins a l'últim salt de línia: l'última pot estar a mig escriure.
        guard let lastNewline = data.lastIndex(of: 0x0A) else { return }
        let complete = data[data.startIndex...lastNewline]
        offsets[path] = offset + UInt64(complete.count)

        let marker = Data("\"usage\"".utf8)
        for line in complete.split(separator: 0x0A, omittingEmptySubsequences: true) {
            guard line.range(of: marker) != nil else { continue }
            if let e = parse(line: Data(line)) { add(e) }
        }
    }

    // MARK: - Parsing

    func parse(line: Data) -> UsageEntry? {
        guard
            let obj = (try? JSONSerialization.jsonObject(with: line)) as? [String: Any],
            obj["type"] as? String == "assistant",
            let msg = obj["message"] as? [String: Any],
            let usageJSON = msg["usage"] as? [String: Any],
            let ts = obj["timestamp"] as? String,
            let date = isoFrac.date(from: ts) ?? isoPlain.date(from: ts)
        else { return nil }

        let model = msg["model"] as? String ?? "unknown"
        if model == "<synthetic>" { return nil }

        let usage = TokenUsage(json: usageJSON)
        if usage.total == 0 { return nil }

        // Claude Code escriu diverses línies per al mateix missatge: deduplica per id + requestId.
        let msgId = msg["id"] as? String
        let reqId = obj["requestId"] as? String
        let key: String? = (msgId == nil && reqId == nil) ? nil : "\(msgId ?? "")|\(reqId ?? "")"

        return UsageEntry(date: date, model: model, usage: usage, cost: usage.cost(model: model), dedupeKey: key)
    }

    func add(_ e: UsageEntry) {
        if let k = e.dedupeKey {
            guard !seen.contains(k) else { return }
            seen.insert(k)
        }
        entries.append(e)
    }

    private func prune(before cutoff: Date) {
        guard entries.contains(where: { $0.date < cutoff }) else { return }
        entries.removeAll { $0.date < cutoff }
        seen = Set(entries.compactMap(\.dedupeKey))
    }

    // MARK: - Resum

    func summarize(now: Date) -> UsageSummary {
        var s = UsageSummary()
        let cal = Calendar.current
        let startOfToday = cal.startOfDay(for: now)
        let weekStart = now.addingTimeInterval(-7 * 24 * 3600)

        var block: UsageBlock?
        for e in entries.sorted(by: { $0.date < $1.date }) where e.date <= now {
            if e.date >= startOfToday { s.today.add(e) }
            if e.date >= weekStart { s.week.add(e) }

            if block == nil || e.date >= block!.end {
                block = UsageBlock(start: Self.floorToHour(e.date), totals: Totals(), lastActivity: e.date)
            }
            block!.totals.add(e)
            block!.lastActivity = e.date
            s.lastActivity = e.date
        }
        if let b = block, now < b.end { s.activeBlock = b }
        return s
    }

    static func floorToHour(_ d: Date) -> Date {
        Date(timeIntervalSince1970: (d.timeIntervalSince1970 / 3600).rounded(.down) * 3600)
    }
}
