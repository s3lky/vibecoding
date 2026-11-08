import AppKit

/// La mascota en pixel art: 14 x 8 píxels.
/// 'o' = cos (taronja Claude), 'k' = ulls, '.' = transparent.
enum Sprite {
    static let width = 14
    static let height = 8

    static let body = NSColor(srgbRed: 0xD9 / 255, green: 0x77 / 255, blue: 0x57 / 255, alpha: 1)
    static let eye = NSColor(srgbRed: 0x1F / 255, green: 0x1E / 255, blue: 0x1D / 255, alpha: 1)

    enum Eyes { case open, blink, happy, sad }

    /// legPhase: 0 = quiet, 1 i 2 = passes de caminar.
    static func rows(eyes: Eyes, armsUp: Bool, legPhase: Int) -> [[Character]] {
        var r: [String] = []
        r.append("..oooooooooo..")
        switch eyes {
        case .open:
            r.append("..ookooookoo..")
            r.append("..ookooookoo..")
        case .blink:
            r.append("..oooooooooo..")
            r.append("..ookooookoo..")
        case .happy: // ^ ^
            r.append("..ookooookoo..")
            r.append("..okokookoko..")
        case .sad: // v v
            r.append("..okokookoko..")
            r.append("..ookooookoo..")
        }
        r.append(armsUp ? "..oooooooooo.." : "oooooooooooooo")
        r.append("..oooooooooo..")
        r.append("..oooooooooo..")
        switch legPhase {
        case 1:
            r.append("..o.o....o.o..")
            r.append(".o...o..o...o.")
        case 2:
            r.append("...o.o..o.o...")
            r.append("...o.o..o.o...")
        default:
            r.append("..o.o....o.o..")
            r.append("..o.o....o.o..")
        }

        var grid = r.map { Array($0) }
        if armsUp { // bracets enlaire a les columnes dels extrems
            for row in 1...2 {
                grid[row][0] = "o"
                grid[row][width - 1] = "o"
            }
        }
        return grid
    }

    /// Pinta la mascota. `origin` és la cantonada inferior esquerra.
    static func draw(_ grid: [[Character]], at origin: CGPoint, pixel: CGFloat, flipped: Bool) {
        let ctx = NSGraphicsContext.current
        let oldAA = ctx?.shouldAntialias ?? true
        ctx?.shouldAntialias = false
        defer { ctx?.shouldAntialias = oldAA }

        for (r, row) in grid.enumerated() {
            for (c, ch) in row.enumerated() where ch != "." {
                (ch == "k" ? eye : body).setFill()
                let col = flipped ? (width - 1 - c) : c
                NSRect(x: origin.x + CGFloat(col) * pixel,
                       y: origin.y + CGFloat(height - 1 - r) * pixel,
                       width: pixel, height: pixel).fill()
            }
        }
    }

    /// Icona per a la barra de menús i la Control Strip.
    static func icon(pixel: CGFloat = 1.5, eyes: Eyes = .open) -> NSImage {
        let size = NSSize(width: CGFloat(width) * pixel, height: CGFloat(height) * pixel)
        return NSImage(size: size, flipped: false) { _ in
            draw(rows(eyes: eyes, armsUp: false, legPhase: 0), at: .zero, pixel: pixel, flipped: false)
            return true
        }
    }
}
