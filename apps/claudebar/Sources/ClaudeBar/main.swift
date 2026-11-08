import AppKit
import ClaudeBarCore

// Subordres per a línia d'ordres. `hook` és el que criden els hooks de Claude Code:
// ha de ser ràpid, silenciós i no tocar mai AppKit.
let args = CommandLine.arguments
if args.count > 1 {
    switch args[1] {
    case "hook":
        HookHandler.runFromStdin()
        exit(0)

    case "statusline":
        StatusLine.runFromStdin()
        exit(0)

    case "install-hooks":
        let exe = Bundle.main.executablePath ?? args[0]
        do {
            let r = try HookInstaller.install(executable: exe)
            print("Hooks instal·lats a \(HookInstaller.settingsURL().path)")
            if let backup = r.backup { print("Còpia de seguretat: \(backup.path)") }
            if r.statusLineSkipped {
                print("Ja tens una statusline pròpia: no l'he tocada, així que no hi haurà quota.")
            }
            print("Reinicia les sessions de Claude Code perquè ho carreguin.")
            exit(0)
        } catch {
            FileHandle.standardError.write(Data("Error: \(error)\n".utf8))
            exit(1)
        }

    case "uninstall-hooks":
        do {
            try HookInstaller.uninstall()
            print("Hooks desinstal·lats")
            exit(0)
        } catch {
            FileHandle.standardError.write(Data("Error: \(error)\n".utf8))
            exit(1)
        }

    case "usage":
        // Per comprovar els números sense Touch Bar.
        let s = UsageScanner().refresh()
        let (l1, l2) = Format.touchBarLines(s)
        print(l1)
        print(l2)
        print("fitxers llegits: \(s.filesScanned), peticions 7d: \(s.week.requests)")
        if s.week.unpricedTokens > 0 {
            print("tokens sense preu (model desconegut): \(Format.tokens(s.week.unpricedTokens))")
        }
        if let rl = RateLimitStore.load() {
            for key in rl.windows.keys.sorted() {
                let w = rl.windows[key]!
                let reset = w.resetsAt.map { " reset \(Format.resetLabel($0))" } ?? ""
                print("quota \(key): \(Format.percent(w.usedPercent))\(reset)")
            }
            print("quota llegida \(Format.ago(rl.updated))")
        } else {
            print("quota: sense dades (falta la statusline o Claude Code < 2.1.80)")
        }
        print("estat: \(SessionStore.aggregate(SessionStore.load()).state.rawValue)")
        exit(0)

    case "help", "--help", "-h":
        print("""
        ClaudeBar: la mascota de Claude Code a la Touch Bar.
          ClaudeBar                  obre l'app
          ClaudeBar usage            mostra els consums a la terminal
          ClaudeBar install-hooks    afegeix els hooks a ~/.claude/settings.json
          ClaudeBar uninstall-hooks  els treu
          ClaudeBar hook             (ús intern dels hooks)
          ClaudeBar statusline       (ús intern de la statusline de Claude Code)
        """)
        exit(0)

    default:
        break // p. ex. -NSDocumentRevisionsDebugMode que posa Xcode
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
