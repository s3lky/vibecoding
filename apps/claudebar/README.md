# ClaudeBar 🦀🟧

La mascota pixelada de Claude Code passejant per la Touch Bar, amb els teus consums al costat.

```
┌──────────────────────────────────┬──────────────────────────────────────────┐
│ 5h $1.92 · 820k · reset 14:00    │            ▄██████▄  !                   │
│ avui $3.40 · 1.2M  7d $18.2      │           ▀▀█▀▀▀▀█▀▀                     │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

- **Esquerra:** cost estimat i tokens del bloc actual de 5 h, d'avui i dels últims 7 dies.
- **Dreta:** la mascota, que fa coses segons el que fa Claude Code:

| Claude Code… | La mascota… |
|---|---|
| està treballant (prompt, eines) | corre amunt i avall movent els bracets (`×2` si hi ha diverses sessions) |
| et demana permís o una resposta | s'atura i salta amb un `!` que parpelleja |
| ha acabat | fa saltirons amb els ulls `^ ^` i un `✓` |
| ha petat | fa cara trista amb una `×` |
| no fa res | passeja, s'atura, parpelleja… i al cap de 10 min s'adorm (`zZ`) |

Si toques la mascota, salta. Si toques els números, es refresquen.

## Requisits

- Un Mac amb Touch Bar (provat pensant en un MacBook Pro M2 de 13").
- macOS 13 o posterior.
- Xcode o les Command Line Tools amb Swift 5.9 o posterior (`xcode-select --install`).

## Compilar i instal·lar

```bash
cd apps/claudebar
./build.sh install
```

L'script:
1. compila en mode release,
2. munta `build/ClaudeBar.app` i la signa ad hoc,
3. la copia a `~/Applications/ClaudeBar.app`,
4. afegeix els hooks a `~/.claude/settings.json` (abans en fa una còpia),
5. l'obre.

Si només la vols compilar: `./build.sh`. Tests (aquests necessiten Xcode): `swift test`.

> **Les sessions de Claude Code que ja tenies obertes no veuen els hooks nous.** Reinicia-les.

## Com funciona

```
Claude Code ──hook──▶ ClaudeBar hook ──escriu──▶ ~/.claudebar/sessions/<id>.json
                                                         │
~/.claude/projects/**/*.jsonl ──────────┐                │ (cada 1 s)
                                        ▼                ▼
                                  ClaudeBar.app ──▶ Touch Bar
                                  (cada 30 s, incremental)
```

- **Consums:** llegeix els transcripts locals de Claude Code (`~/.claude/projects`,
  `~/.config/claude/projects` i `$CLAUDE_CONFIG_DIR`). Només llegeix els bytes nous de
  cada fitxer, i deduplica els missatges repetits per `message.id` + `requestId`.
- **Cost:** es calcula amb la taula de preus oficial de l'API
  (`Sources/ClaudeBarCore/Pricing.swift`, consultada el novembre del 2026), tenint en
  compte les escriptures de cache de 5 m i d'1 h, les lectures de cache, el *fast mode*
  i el preu de context llarg de Haiku 5.5.
- **Estat:** els hooks criden el mateix binari (`ClaudeBar hook`), que llegeix el JSON del
  hook per stdin i desa l'estat de la sessió en un fitxer. L'app llegeix aquests fitxers.
  No hi ha xarxa, ni sockets, ni res que surti del teu Mac.

### Hooks que s'instal·len

`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Notification`, `Stop` i
`SessionEnd`. Tots criden:

```
'/Users/tu/Applications/ClaudeBar.app/Contents/MacOS/ClaudeBar' hook # claudebar
```

El comentari `# claudebar` serveix per reconèixer-los: reinstal·lar-los no els duplica, i
desinstal·lar-los no toca els teus.

```bash
~/Applications/ClaudeBar.app/Contents/MacOS/ClaudeBar uninstall-hooks
```

També ho pots fer des del menú de la mascota a la barra de menús.

## Llegeix això abans de queixar-te

- **Els números són una ESTIMACIÓ.** Si tens un pla Pro o Max no pagues per token. El cost
  et diu el que hauria costat via API, que és útil per comparar dies, no per mirar la factura.
- **El "bloc de 5 h" no és el límit real del teu pla.** És el mateix càlcul que fa
  `ccusage`: un bloc comença a l'hora en punt del primer missatge i dura 5 h. Anthropic
  calcula els límits reals al servidor i no hi ha cap API pública per consultar-los.
- **Només compta Claude Code.** El que facis a claude.ai o a l'app d'escriptori no queda
  als transcripts locals.
- **Fa servir API privada de macOS** (`DFRFoundation` i mètodes ocults de `NSTouchBar`)
  perquè la barra es vegi sempre, com fan MTMR o Pock. Es pot trencar amb una actualització
  de macOS i no passaria mai la revisió de l'App Store. Els símbols es resolen en temps
  d'execució: si algun desapareix, l'app no peta, simplement no es mostra.
- **"Sempre a sobre"** vol dir que tapa la Touch Bar de l'app activa (Xcode, Final Cut…).
  Si et molesta, desactiva-ho al menú i toca la mascota de la Control Strip per
  mostrar-la o amagar-la.
- **Cada hook arrenca el binari**, que triga unes desenes de mil·lisegons. A `PreToolUse`
  això passa a cada crida d'eina. No es nota, però que sàpigues que hi és.
- Els preus estan escrits al codi. Quan Anthropic els canviï, actualitza `Pricing.swift`.
  Els models que no reconeix es compten com a tokens "sense preu" (el menú t'ho avisa).

## Problemes

| Símptoma | Què fer |
|---|---|
| "Sense dades de Claude Code" | `~/Applications/ClaudeBar.app/Contents/MacOS/ClaudeBar usage` et diu quants fitxers llegeix. Si són 0, revisa `CLAUDE_CONFIG_DIR`. |
| La mascota no reacciona | Reinicia les sessions de Claude Code. Comprova que `~/.claude/settings.json` conté `# claudebar` i que `~/.claudebar/sessions/` s'omple. |
| No surt res a la Touch Bar | Mira els logs a Console.app filtrant per `ClaudeBar`. Si posa que l'API no és disponible, el teu macOS ja no la té. |
| Has mogut l'app | Torna a instal·lar els hooks des del menú: la ruta va dins del hook. |

## Personalitzar

- Dibuix i colors: `Sources/ClaudeBar/Sprite.swift` (graella de 14×8 de caràcters).
- Velocitats, temps per adormir-se i mida: `Sources/ClaudeBar/MascotBarView.swift`.
- Caducitat dels estats: `Sources/ClaudeBarCore/SessionStore.swift`.

La mascota és un dibuix propi inspirat en la de Claude Code, per a ús personal. Claude i el
seu logo són marques d'Anthropic. No ho publiquis com si fos oficial.
