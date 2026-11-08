import XCTest
@testable import ClaudeBarCore

final class PricingTests: XCTestCase {
    func testModelKeys() {
        XCTAssertEqual(Pricing.key(for: "claude-opus-5-5"), "opus-5-5")
        XCTAssertEqual(Pricing.key(for: "claude-sonnet-4-20250514"), "sonnet-4")
        XCTAssertEqual(Pricing.key(for: "claude-opus-4-1-20250805"), "opus-4-1")
        XCTAssertEqual(Pricing.key(for: "claude-haiku-4-5-20251001"), "haiku-4-5")
        XCTAssertEqual(Pricing.key(for: "claude-fable-5-1"), "fable-5-1")
        // Versió nova que encara no és a la taula: cau a la família major.
        XCTAssertEqual(Pricing.key(for: "claude-opus-5-9"), "opus-5")
        XCTAssertNil(Pricing.key(for: "claude-3-5-haiku-20241022"))
        XCTAssertNil(Pricing.key(for: "<synthetic>"))
    }

    func testCost() {
        let u = TokenUsage(input: 1_000_000, output: 1_000_000, cacheWrite5m: 1_000_000, cacheRead: 1_000_000)
        // Opus 5.5: 4 + 20 + 5 + 0.20
        XCTAssertEqual(u.cost(model: "claude-opus-5-5")!, 29.20, accuracy: 0.0001)
        var fast = u
        fast.fast = true
        XCTAssertEqual(fast.cost(model: "claude-opus-5-5")!, 58.40, accuracy: 0.0001)
        XCTAssertNil(u.cost(model: "gpt-whatever"))
    }

    func testHaikuLongContext() {
        let short = TokenUsage(input: 50_000, output: 0)
        let long = TokenUsage(input: 200_000, output: 0)
        XCTAssertEqual(short.cost(model: "claude-haiku-5-5")!, 0.005, accuracy: 1e-9)
        XCTAssertEqual(long.cost(model: "claude-haiku-5-5")!, 0.10, accuracy: 1e-9)
    }

    func testUsageJSONSplitsCacheWrites() {
        let u = TokenUsage(json: [
            "input_tokens": 10, "output_tokens": 20,
            "cache_creation_input_tokens": 300, "cache_read_input_tokens": 4000,
            "cache_creation": ["ephemeral_5m_input_tokens": 100, "ephemeral_1h_input_tokens": 200],
        ])
        XCTAssertEqual(u, TokenUsage(input: 10, output: 20, cacheWrite5m: 100, cacheWrite1h: 200, cacheRead: 4000))
    }
}

final class UsageScannerTests: XCTestCase {
    private var dir: URL!

    override func setUpWithError() throws {
        dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: dir.appendingPathComponent("proj"), withIntermediateDirectories: true)
    }

    override func tearDownWithError() throws {
        try? FileManager.default.removeItem(at: dir)
    }

    private func line(_ date: Date, id: String, req: String, input: Int, output: Int) -> String {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return """
        {"type":"assistant","timestamp":"\(iso.string(from: date))","requestId":"\(req)","message":{"id":"\(id)","model":"claude-sonnet-5-5","usage":{"input_tokens":\(input),"output_tokens":\(output)}}}
        """
    }

    func testIncrementalReadDedupeAndBlocks() throws {
        let now = Date()
        let file = dir.appendingPathComponent("proj/session.jsonl")
        let a = line(now.addingTimeInterval(-600), id: "m1", req: "r1", input: 1_000_000, output: 0)
        // Mateix missatge escrit dos cops (Claude Code ho fa en streaming): s'ha de comptar una vegada.
        let dup = a
        let user = #"{"type":"user","timestamp":"2026-01-01T00:00:00Z","message":{"role":"user","content":"hola"}}"#
        try (a + "\n" + dup + "\n" + user + "\n").write(to: file, atomically: true, encoding: .utf8)

        let scanner = UsageScanner(roots: [dir])
        var s = scanner.refresh(now: now)
        XCTAssertEqual(s.week.requests, 1)
        XCTAssertEqual(s.week.cost, 2.0, accuracy: 1e-9) // 1M input a $2
        XCTAssertNotNil(s.activeBlock)

        // Afegim una línia nova i una a mig escriure (sense \n): només ha de comptar la completa.
        let b = line(now.addingTimeInterval(-60), id: "m2", req: "r2", input: 0, output: 100_000)
        let partial = String(line(now, id: "m3", req: "r3", input: 1, output: 1).prefix(40))
        let h = try FileHandle(forWritingTo: file)
        h.seekToEndOfFile()
        h.write(Data((b + "\n" + partial).utf8))
        try h.close()

        s = scanner.refresh(now: now)
        XCTAssertEqual(s.week.requests, 2)
        XCTAssertEqual(s.week.cost, 3.0, accuracy: 1e-9) // + 100k output a $10/MTok
    }

    func testBlockExpires() throws {
        let now = Date()
        let file = dir.appendingPathComponent("proj/old.jsonl")
        try (line(now.addingTimeInterval(-6 * 3600), id: "x", req: "y", input: 10, output: 10) + "\n")
            .write(to: file, atomically: true, encoding: .utf8)
        let s = UsageScanner(roots: [dir]).refresh(now: now)
        XCTAssertEqual(s.week.requests, 1)
        XCTAssertNil(s.activeBlock)
    }
}

final class HookTests: XCTestCase {
    private func input(_ event: String, extra: String = "") -> Data {
        Data(#"{"hook_event_name":"\#(event)","session_id":"abc-123","cwd":"/tmp","transcript_path":"/x"\#(extra)}"#.utf8)
    }

    private func state(_ a: HookHandler.Action) -> AgentState? {
        if case .set(let r) = a { return r.state }
        return nil
    }

    func testEventMapping() {
        XCTAssertEqual(state(HookHandler.action(for: input("UserPromptSubmit"))), .working)
        XCTAssertEqual(state(HookHandler.action(for: input("PreToolUse"))), .working)
        XCTAssertEqual(state(HookHandler.action(for: input("Stop"))), .done)
        XCTAssertEqual(state(HookHandler.action(for: input("Notification", extra: #","notification_type":"permission_prompt""#))), .waiting)
        XCTAssertEqual(state(HookHandler.action(for: input("Notification", extra: #","notification_type":"idle_prompt""#))), .done)
        XCTAssertEqual(HookHandler.action(for: input("SessionEnd")), .remove("abc-123"))
        XCTAssertEqual(HookHandler.action(for: input("PreCompact")), .ignore)
        XCTAssertEqual(HookHandler.action(for: Data("no és json".utf8)), .ignore)
    }

    func testAggregatePriorityAndExpiry() {
        let now = Date()
        let recs = [
            SessionRecord(sessionId: "a", state: .working, event: "PreToolUse", cwd: nil, updated: now),
            SessionRecord(sessionId: "b", state: .waiting, event: "Notification", cwd: nil, updated: now),
            SessionRecord(sessionId: "c", state: .working, event: "PreToolUse", cwd: nil, updated: now.addingTimeInterval(-3600)),
        ]
        let agg = SessionStore.aggregate(recs, now: now)
        XCTAssertEqual(agg.state, .waiting)
        XCTAssertEqual(agg.activeSessions, 2) // la "c" fa una hora que no diu res: caducada
    }

    func testInstallerKeepsUserHooksAndIsIdempotent() {
        let userHook: [String: Any] = ["matcher": "Bash", "hooks": [["type": "command", "command": "echo meu"]]]
        let root: [String: Any] = ["model": "opus", "hooks": ["PreToolUse": [userHook]]]
        let cmd = HookInstaller.command(forExecutable: "/Applications/Claude Bar.app/Contents/MacOS/ClaudeBar")

        let once = HookInstaller.apply(to: root, command: cmd)
        let twice = HookInstaller.apply(to: once, command: cmd)
        let pre = (twice["hooks"] as! [String: Any])["PreToolUse"] as! [[String: Any]]
        XCTAssertEqual(pre.count, 2, "el hook de l'usuari + el nostre, sense duplicar")
        XCTAssertEqual(twice["model"] as? String, "opus")

        let removed = HookInstaller.apply(to: twice, command: nil)
        let hooks = removed["hooks"] as! [String: Any]
        XCTAssertEqual(hooks.keys.sorted(), ["PreToolUse"])
        XCTAssertEqual((hooks["PreToolUse"] as! [[String: Any]]).count, 1)
    }

    func testCommandQuoting() {
        XCTAssertEqual(HookInstaller.command(forExecutable: "/a b/it's"), #"'/a b/it'\''s' hook # claudebar"#)
    }
}

final class FormatTests: XCTestCase {
    func testTokens() {
        XCTAssertEqual(Format.tokens(950), "950")
        XCTAssertEqual(Format.tokens(12_300), "12k")
        XCTAssertEqual(Format.tokens(1_234_567), "1.2M")
        XCTAssertEqual(Format.tokens(3_400_000_000), "3.4B")
    }

    func testCost() {
        XCTAssertEqual(Format.cost(3.456), "$3.46")
        XCTAssertEqual(Format.cost(18.24), "$18.2")
    }
}
