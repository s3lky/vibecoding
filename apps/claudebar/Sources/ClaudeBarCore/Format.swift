import Foundation

public enum Format {
    /// 950 -> "950", 12_300 -> "12k", 1_234_567 -> "1.2M", 3_400_000_000 -> "3.4B"
    public static func tokens(_ n: Int) -> String {
        let d = Double(n)
        switch n {
        case ..<1_000: return "\(n)"
        case ..<1_000_000: return "\(Int((d / 1_000).rounded()))k"
        case ..<1_000_000_000: return trimmed(d / 1_000_000) + "M"
        default: return trimmed(d / 1_000_000_000) + "B"
        }
    }

    public static func cost(_ usd: Double) -> String {
        if usd < 10 { return String(format: "$%.2f", usd) }
        if usd < 1000 { return String(format: "$%.1f", usd) }
        return String(format: "$%.0f", usd)
    }

    public static func time(_ d: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f.string(from: d)
    }

    /// "2h05" / "37m"
    public static func remaining(_ interval: TimeInterval) -> String {
        let m = max(0, Int(interval / 60))
        return m >= 60 ? String(format: "%dh%02d", m / 60, m % 60) : "\(m)m"
    }

    /// 23.5 -> "24%", 7 -> "7%"
    public static func percent(_ v: Double) -> String {
        "\(Int(v.rounded()))%"
    }

    /// Avui: "14:00". Un altre dia: "dl. 09:00".
    public static func resetLabel(_ d: Date, now: Date = Date()) -> String {
        if Calendar.current.isDate(d, inSameDayAs: now) { return time(d) }
        let f = DateFormatter()
        f.locale = Locale(identifier: "ca_ES")
        f.dateFormat = "EEE HH:mm"
        return f.string(from: d)
    }

    /// "fa 3 min" / "fa 2 h"
    public static func ago(_ d: Date, now: Date = Date()) -> String {
        let s = max(0, Int(now.timeIntervalSince(d)))
        if s < 60 { return "ara mateix" }
        if s < 3600 { return "fa \(s / 60) min" }
        if s < 86400 { return "fa \(s / 3600) h" }
        return "fa \(s / 86400) dies"
    }

    private static func trimmed(_ v: Double) -> String {
        v >= 100 ? String(format: "%.0f", v) : String(format: "%.1f", v)
    }

    /// Línies que es mostren a la Touch Bar.
    public static func touchBarLines(_ s: UsageSummary?, now: Date = Date()) -> (String, String) {
        guard let s, s.week.requests > 0 else {
            return ("Sense dades de Claude Code", "~/.claude/projects buit?")
        }
        let line1: String
        if let b = s.activeBlock {
            line1 = "5h \(cost(b.totals.cost)) · \(tokens(b.totals.tokens)) · reset \(time(b.end))"
        } else {
            line1 = "5h — cap bloc actiu"
        }
        let line2 = "avui \(cost(s.today.cost)) · \(tokens(s.today.tokens))  7d \(cost(s.week.cost))"
        return (line1, line2)
    }
}
