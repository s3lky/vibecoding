import Foundation

/// Genera el `.command` que obre `claude` al terminal.
public enum TerminalScript {
    public static func make(directory: String, skipPermissions: Bool, prompt: String?) -> String {
        var command = "claude"
        if skipPermissions { command += " --dangerously-skip-permissions" }

        var lines = [
            "#!/bin/sh",
            "rm -f \"$0\"",
            "cd \(shellQuote(directory)) || exit 1",
        ]
        if let prompt {
            // La pregunta va en una variable d'entorn: res del que escriguis s'interpreta com a shell.
            lines.append("CLAUDEBAR_PROMPT=\(shellQuote(prompt))")
            lines.append("export CLAUDEBAR_PROMPT")
            command += prompt.hasPrefix("-") ? " -- \"$CLAUDEBAR_PROMPT\"" : " \"$CLAUDEBAR_PROMPT\""
        }
        // Shell de login + interactiu perquè carregui el teu PATH (on viu `claude`).
        // Quan surts de claude, et quedes al shell en lloc de tancar la finestra.
        let inner = "\(command); unset CLAUDEBAR_PROMPT; exec \"${SHELL:-/bin/zsh}\" -l"
        lines.append("exec \"${SHELL:-/bin/zsh}\" -lic \(shellQuote(inner))")
        return lines.joined(separator: "\n") + "\n"
    }

    public static func shellQuote(_ s: String) -> String {
        "'" + s.replacingOccurrences(of: "'", with: "'\\''") + "'"
    }
}
