import Foundation

/// Preu en USD per milió de tokens (MTok).
public struct ModelPrice: Equatable {
    public let input: Double
    public let cacheWrite5m: Double
    public let cacheWrite1h: Double
    public let cacheRead: Double
    public let output: Double

    public init(_ input: Double, _ cacheWrite5m: Double, _ cacheWrite1h: Double, _ cacheRead: Double, _ output: Double) {
        self.input = input
        self.cacheWrite5m = cacheWrite5m
        self.cacheWrite1h = cacheWrite1h
        self.cacheRead = cacheRead
        self.output = output
    }
}

/// Taula de preus de l'API d'Anthropic.
/// Font: https://platform.claude.com/docs/en/about-claude/pricing (consultada el 2026-11-08).
/// Si Anthropic canvia preus, això s'ha d'actualitzar a mà. És una ESTIMACIÓ:
/// amb un pla Pro/Max no pagues per token; serveix per saber quant "gastes".
public enum Pricing {
    static let table: [String: ModelPrice] = [
        "fable-5-1":  ModelPrice(10, 12.50, 20, 0.25, 50),
        "mythos-5-1": ModelPrice(10, 12.50, 20, 0.25, 50),
        "fable-5":    ModelPrice(10, 12.50, 20, 1.00, 50),
        "mythos-5":   ModelPrice(10, 12.50, 20, 1.00, 50),
        "opus-5-5":   ModelPrice(4, 5, 8, 0.20, 20),
        "opus-5":     ModelPrice(5, 6.25, 10, 0.50, 25),
        "opus-4-8":   ModelPrice(5, 6.25, 10, 0.50, 25),
        "opus-4-7":   ModelPrice(5, 6.25, 10, 0.50, 25),
        "opus-4-6":   ModelPrice(5, 6.25, 10, 0.50, 25),
        "opus-4-5":   ModelPrice(5, 6.25, 10, 0.50, 25),
        "opus-4-1":   ModelPrice(15, 18.75, 30, 1.50, 75),
        "opus-4":     ModelPrice(15, 18.75, 30, 1.50, 75),
        "sonnet-5-5": ModelPrice(2, 2.50, 4, 0.10, 10),
        "sonnet-5":   ModelPrice(2, 2.50, 4, 0.20, 10),
        "sonnet-4-6": ModelPrice(3, 3.75, 6, 0.30, 15),
        "sonnet-4-5": ModelPrice(3, 3.75, 6, 0.30, 15),
        "sonnet-4":   ModelPrice(3, 3.75, 6, 0.30, 15),
        "haiku-5-5":  ModelPrice(0.10, 0.125, 0.20, 0.01, 0.50),
        "haiku-4-5":  ModelPrice(1, 1.25, 2, 0.10, 5),
    ]

    /// Haiku 5.5 té preu diferent quan el prompt supera els 100K tokens.
    static let haiku55Long = ModelPrice(0.50, 0.625, 1, 0.05, 2.50)
    static let longContextThreshold = 100_000

    /// El fast mode d'Opus surt el doble ($8/$40 a Opus 5.5).
    static let fastMultiplier = 2.0

    // "claude-opus-4-1-20250805" -> opus, 4, 1 ; "claude-sonnet-4-20250514" -> sonnet, 4, nil
    private static let regex = try! NSRegularExpression(
        pattern: "(opus|sonnet|haiku|fable|mythos)-(\\d+)(?:-(\\d)(?!\\d))?"
    )

    /// Retorna la clau de la taula ("opus-5-5") o nil si el model no és reconeixible.
    public static func key(for model: String) -> String? {
        let ns = model as NSString
        guard let m = regex.firstMatch(in: model, range: NSRange(location: 0, length: ns.length)) else {
            return nil
        }
        let family = ns.substring(with: m.range(at: 1))
        let major = ns.substring(with: m.range(at: 2))
        var candidates: [String] = []
        if m.range(at: 3).location != NSNotFound {
            candidates.append("\(family)-\(major)-\(ns.substring(with: m.range(at: 3)))")
        }
        candidates.append("\(family)-\(major)")
        return candidates.first { table[$0] != nil }
    }

    public static func price(for model: String, promptTokens: Int) -> ModelPrice? {
        guard let k = key(for: model), let p = table[k] else { return nil }
        if k == "haiku-5-5" && promptTokens > longContextThreshold { return haiku55Long }
        return p
    }
}

/// Tokens d'una resposta, tal com surten al camp `usage` dels transcripts de Claude Code.
public struct TokenUsage: Equatable {
    public var input = 0
    public var output = 0
    public var cacheWrite5m = 0
    public var cacheWrite1h = 0
    public var cacheRead = 0
    public var fast = false

    public init(input: Int = 0, output: Int = 0, cacheWrite5m: Int = 0, cacheWrite1h: Int = 0, cacheRead: Int = 0, fast: Bool = false) {
        self.input = input
        self.output = output
        self.cacheWrite5m = cacheWrite5m
        self.cacheWrite1h = cacheWrite1h
        self.cacheRead = cacheRead
        self.fast = fast
    }

    public var total: Int { input + output + cacheWrite5m + cacheWrite1h + cacheRead }
    public var promptTokens: Int { input + cacheWrite5m + cacheWrite1h + cacheRead }

    /// Cost estimat en USD, o nil si no coneixem el model.
    public func cost(model: String) -> Double? {
        guard let p = Pricing.price(for: model, promptTokens: promptTokens) else { return nil }
        let raw = Double(input) * p.input
            + Double(cacheWrite5m) * p.cacheWrite5m
            + Double(cacheWrite1h) * p.cacheWrite1h
            + Double(cacheRead) * p.cacheRead
            + Double(output) * p.output
        return raw / 1_000_000 * (fast ? Pricing.fastMultiplier : 1)
    }

    /// Construeix a partir del diccionari `message.usage` d'un transcript.
    public init(json usage: [String: Any]) {
        input = intValue(usage["input_tokens"])
        output = intValue(usage["output_tokens"])
        cacheRead = intValue(usage["cache_read_input_tokens"])
        let creation = intValue(usage["cache_creation_input_tokens"])
        if let split = usage["cache_creation"] as? [String: Any] {
            cacheWrite5m = intValue(split["ephemeral_5m_input_tokens"])
            cacheWrite1h = intValue(split["ephemeral_1h_input_tokens"])
            // Si el desglossament no quadra, el que falti ho comptem com a 5m.
            let rest = creation - cacheWrite5m - cacheWrite1h
            if rest > 0 { cacheWrite5m += rest }
        } else {
            cacheWrite5m = creation
        }
        fast = (usage["speed"] as? String) == "fast"
    }
}

func intValue(_ any: Any?) -> Int {
    if let n = any as? NSNumber { return n.intValue }
    if let i = any as? Int { return i }
    if let d = any as? Double { return Int(d) }
    return 0
}
