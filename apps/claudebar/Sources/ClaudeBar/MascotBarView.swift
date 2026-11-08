import AppKit
import ClaudeBarCore
import QuartzCore

/// La vista que ocupa la Touch Bar: estadístiques a l'esquerra i la mascota passejant a la dreta.
final class MascotBarView: NSView {
    // MARK: - Dades d'entrada

    var summary: UsageSummary? { didSet { needsDisplay = true } }

    var agent: AgentState = .idle {
        didSet {
            guard agent != oldValue else { return }
            stateSince = CACurrentMediaTime()
            if agent == .done || agent == .waiting { jumpStart = stateSince }
        }
    }

    var activeSessions = 0

    /// Toc a la zona de text (l'app la fa servir per refrescar els consums).
    var onStatsTap: (() -> Void)?

    // MARK: - Mides

    static let barWidth: CGFloat = 660
    private let barHeight: CGFloat = 30
    private let statsWidth: CGFloat = 248
    private let pixel: CGFloat = 3
    private var spriteWidth: CGFloat { CGFloat(Sprite.width) * pixel }
    private var trackMinX: CGFloat { statsWidth + 8 }
    private var trackMaxX: CGFloat { bounds.width - spriteWidth - 14 }

    // MARK: - Estat de l'animació

    private var x: CGFloat = 300
    private var dir: CGFloat = 1
    private var lastTick = CACurrentMediaTime()
    private var stateSince = CACurrentMediaTime()
    private var stepClock: Double = 0
    private var legPhase = 0
    private var jumpStart: Double?
    private var pauseUntil: Double = 0
    private var nextPauseAt = CACurrentMediaTime() + 5
    private var blinkUntil: Double = 0
    private var nextBlinkAt = CACurrentMediaTime() + 3
    private var timer: Timer?

    /// Després d'aquesta estona sense que Claude Code faci res, la mascota s'adorm.
    private let sleepAfter: Double = 10 * 60

    override init(frame: NSRect) {
        super.init(frame: frame)
        allowedTouchTypes = [.direct]
        wantsLayer = true
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) no suportat") }

    override var intrinsicContentSize: NSSize { NSSize(width: Self.barWidth, height: barHeight) }

    func start() {
        guard timer == nil else { return }
        let t = Timer(timeInterval: 1.0 / 30.0, repeats: true) { [weak self] _ in self?.tick() }
        RunLoop.main.add(t, forMode: .common)
        timer = t
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    // MARK: - Comportament

    private enum Mood { case walking, running, sleeping, alert, celebrating, sad }

    private func mood(_ now: Double) -> Mood {
        let inState = now - stateSince
        switch agent {
        case .working: return .running
        case .waiting: return .alert
        case .error: return .sad
        case .done: return inState < 4 ? .celebrating : .walking
        case .idle: return inState > sleepAfter ? .sleeping : .walking
        }
    }

    private func tick() {
        let now = CACurrentMediaTime()
        let dt = min(now - lastTick, 0.1)
        lastTick = now
        let m = mood(now)

        // Pauses aleatòries quan passeja: s'atura, mira, i continua.
        if m == .walking, now >= nextPauseAt {
            pauseUntil = now + Double.random(in: 1.2...3.0)
            nextPauseAt = pauseUntil + Double.random(in: 4...10)
            if Bool.random() { dir = -dir }
        }
        let paused = m == .walking && now < pauseUntil

        let speed: CGFloat
        switch m {
        case .running: speed = 55
        case .walking: speed = paused ? 0 : 16
        default: speed = 0
        }

        if speed > 0 {
            x += dir * speed * CGFloat(dt)
            if x <= trackMinX { x = trackMinX; dir = 1 }
            if x >= trackMaxX { x = trackMaxX; dir = -1 }
            stepClock += dt
            let stepEvery = m == .running ? 0.10 : 0.28
            if stepClock >= stepEvery {
                stepClock = 0
                legPhase = legPhase == 1 ? 2 : 1
            }
        } else {
            legPhase = 0
        }
        x = min(max(x, trackMinX), max(trackMinX, trackMaxX))

        // Parpelleig
        if now >= nextBlinkAt {
            blinkUntil = now + 0.14
            nextBlinkAt = now + Double.random(in: 2.5...6)
        }

        // Quan t'espera, salta sense parar.
        if m == .alert, jumpStart == nil || now - jumpStart! > 0.55 { jumpStart = now }
        if m == .celebrating, jumpStart == nil || now - jumpStart! > 0.7 { jumpStart = now }

        needsDisplay = true
    }

    func jump() {
        let now = CACurrentMediaTime()
        if let j = jumpStart, now - j < 0.5 { return }
        jumpStart = now
        // Un toc la desperta.
        if agent == .idle, now - stateSince > sleepAfter { stateSince = now }
    }

    private func jumpOffset(_ now: Double) -> CGFloat {
        guard let j = jumpStart else { return 0 }
        let duration = 0.45
        let t = (now - j) / duration
        guard t < 1 else { return 0 }
        return CGFloat(sin(t * .pi)) * 5
    }

    // MARK: - Dibuix

    override func draw(_ dirtyRect: NSRect) {
        let now = CACurrentMediaTime()
        drawStats()

        NSColor(white: 1, alpha: 0.15).setFill()
        NSRect(x: statsWidth, y: 5, width: 1, height: barHeight - 10).fill()

        let m = mood(now)
        let eyes: Sprite.Eyes
        switch m {
        case .celebrating: eyes = .happy
        case .sad: eyes = .sad
        case .sleeping: eyes = .blink
        default: eyes = now < blinkUntil ? .blink : (agent == .done ? .happy : .open)
        }
        // Corrent mou els bracets amunt i avall; si t'espera, els té enlaire.
        let armsUp = m == .alert || m == .celebrating || (m == .running && legPhase == 1)
        let grid = Sprite.rows(eyes: eyes, armsUp: armsUp, legPhase: legPhase)
        let y = 1 + jumpOffset(now)
        Sprite.draw(grid, at: CGPoint(x: x, y: y), pixel: pixel, flipped: dir < 0)

        drawBubble(m, now: now, headY: y + CGFloat(Sprite.height) * pixel)
    }

    private func drawStats() {
        let (l1, l2) = Format.touchBarLines(summary)
        let font = NSFont.monospacedDigitSystemFont(ofSize: 11, weight: .medium)
        let strong: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: NSColor.white]
        let soft: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: NSColor(white: 0.72, alpha: 1)]
        NSAttributedString(string: l1, attributes: strong).draw(at: CGPoint(x: 6, y: 15))
        NSAttributedString(string: l2, attributes: soft).draw(at: CGPoint(x: 6, y: 2))
    }

    private func drawBubble(_ m: Mood, now: Double, headY: CGFloat) {
        let text: String
        let color: NSColor
        switch m {
        case .alert:
            // Parpelleja perquè et giris a mirar el terminal.
            guard Int(now * 3) % 2 == 0 else { return }
            text = "!"
            color = NSColor.systemYellow
        case .sleeping:
            text = Int(now) % 2 == 0 ? "z" : "zZ"
            color = NSColor(white: 0.8, alpha: 1)
        case .celebrating:
            text = "✓"
            color = NSColor.systemGreen
        case .sad:
            text = "×"
            color = NSColor.systemRed
        case .running where activeSessions > 1:
            text = "×\(activeSessions)"
            color = NSColor(white: 0.85, alpha: 1)
        default:
            return
        }
        let font = NSFont.systemFont(ofSize: 12, weight: .heavy)
        let s = NSAttributedString(string: text, attributes: [.font: font, .foregroundColor: color])
        let size = s.size()
        // Al costat del cap, cap on mira; si no hi cap, a l'altre costat.
        var bx = dir >= 0 ? x + spriteWidth + 2 : x - size.width - 2
        if bx + size.width > bounds.width { bx = x - size.width - 2 }
        if bx < trackMinX { bx = x + spriteWidth + 2 }
        let by = min(headY - size.height + 4, barHeight - size.height)
        s.draw(at: CGPoint(x: bx, y: max(0, by)))
    }

    // MARK: - Tocs

    override func touchesBegan(with event: NSEvent) {
        guard let touch = event.touches(matching: .began, in: self).first else { return }
        let p = touch.location(in: self)
        if p.x < statsWidth {
            onStatsTap?()
        } else {
            jump()
        }
    }
}
