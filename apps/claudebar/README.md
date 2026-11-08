# ClaudeBar 🦀🟧

La mascota pixelada de Claude Code passejant per la Touch Bar, amb la quota del teu pla, els
consums i dos botons per obrir Claude al terminal.

```
5h ▕███░░░░▏ 23% →14:00        $1.92 │  ▄██████▄ ✻ Rumiant…  │ ✻ Pregunta │ ⚡︎ claude
7d ▕█████░░▏ 41% →dl. 09:00 $3.40 avui │ ▀▀█▀▀▀▀█▀▀            │            │
```

- **Quota del pla:** el % de la finestra de 5 h (el cicle actual) i de la setmanal, amb l'hora
  de reset. Les barres passen de verd a groc, taronja i vermell.
- **Cost estimat:** el del bloc de 5 h a dalt, i el d'avui a baix.
- **La mascota**, que fa coses segons el que fa Claude Code:

| Claude Code… | La mascota… |
|---|---|
| està treballant (prompt, eines) | corre amunt i avall amb el spinner `· ✢ ✳ ✶ ✻ ✽` i un verb que va canviant, com al terminal (`×2` si hi ha diverses sessions) |
| et demana permís o una resposta | s'atura i salta amb un `!` que parpelleja |
| ha acabat | fa saltirons amb els ulls `^ ^` i un `✓` |
| ha petat | fa cara trista amb una `×` |
| no fa res | passeja, s'atura, parpelleja… i al cap de 10 min s'adorm (`zZ`) |

Si toques la mascota, salta. Si toques els números, es refresquen.

### Botons

- **✻ Pregunta**: surt una finestreta, escrius la pregunta i s'obre el Terminal amb
  `claude "la teva pregunta"`. La sessió continua oberta perquè hi segueixis parlant.
- **⚡︎ claude** (vermell): obre el Terminal amb `claude --dangerously-skip-permissions`.

Tots dos s'obren a la **carpeta fixa** que triïs al menú (per defecte, la teva carpeta
d'usuari). Al menú també pots triar entre Terminal i iTerm, i decidir si la pregunta
també s'obre sense permisos (per defecte, no).

> ⚠︎ `--dangerously-skip-permissions` vol dir que Claude executa ordres, esborra i
> modifica fitxers **sense preguntar-te res**. Si la carpeta fixa és el teu home, el risc
> és tot el teu disc. Posa-hi una carpeta de projectes o, millor encara, un projecte amb git.

Per obrir el terminal no es fa servir AppleScript: es crea un `.command` temporal, s'obre
amb el Terminal i s'esborra sol. Per això no et demanarà permís d'Automatització. La pregunta
passa per una variable d'entorn, així que encara que hi escriguis `$(rm -rf ~)`, no s'executa.

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
4. afegeix els hooks i la statusline a `~/.claude/settings.json` (abans en fa una còpia),
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

- **Quota:** des de la versió 2.1.80, Claude Code passa el camp `rate_limits` (finestres
  `five_hour` i `seven_day`, amb `used_percentage` i `resets_at`) a l'script de la
  statusline. La statusline de ClaudeBar (`ClaudeBar statusline`) desa aquestes dades a
  `~/.claudebar/ratelimits.json` i escriu a Claude Code una línia curta: `Opus 5.5 · 5h 24% · 7d 41%`.
  Si tens límits extra (per exemple per model), surten al menú.
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

### Què s'instal·la a settings.json

`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Notification`, `Stop` i
`SessionEnd`. Tots criden:

```
'/Users/tu/Applications/ClaudeBar.app/Contents/MacOS/ClaudeBar' hook # claudebar
```

i la statusline:

```
'/Users/tu/Applications/ClaudeBar.app/Contents/MacOS/ClaudeBar' statusline # claudebar
```

Si ja tens una statusline pròpia, **no la toca**. Llavors no veuràs la quota (l'app t'ho diu).

El comentari `# claudebar` serveix per reconèixer-los: reinstal·lar-los no els duplica, i
desinstal·lar-los no toca els teus.

```bash
~/Applications/ClaudeBar.app/Contents/MacOS/ClaudeBar uninstall-hooks
```

També ho pots fer des del menú de la mascota a la barra de menús.

## Llegeix això abans de queixar-te

- **No hi ha quota diària.** Els plans de Claude tenen la finestra de 5 h i la setmanal
  (i, en alguns plans, límits setmanals per model). No t'invento una tercera.
- **La quota és la de l'última resposta de l'API.** Només s'actualitza mentre fas servir
  Claude Code. Si fa més de 30 min, es mostra més apagada i el menú et diu quan és de fa.
  Quan passa l'hora de reset, mostra `—` fins que tornis a fer servir Claude Code.
- **Sense pla (amb clau d'API) no hi ha quota**: es mostren els consums estimats de sempre.
- **El pla que tens (Pro, Max...) no surt.** Claude Code no el passa a la statusline.
- **Els dòlars són una ESTIMACIÓ.** Si tens un pla Pro o Max no pagues per token. El cost
  et diu el que hauria costat via API, que és útil per comparar dies, no per mirar la factura.
- **El cost del "bloc de 5 h" és un càlcul local** (com el de `ccusage`: comença a l'hora en
  punt del primer missatge). El % de la quota, en canvi, és el real que dona Claude Code.
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
| La quota surt com a "sense dades" | Cal Claude Code ≥ 2.1.80, la statusline de ClaudeBar a `settings.json` i haver fet com a mínim una petició des que l'has instal·lat. `ClaudeBar usage` t'ensenya què hi ha desat. |
| Els botons obren el terminal però diu `claude: command not found` | El teu PATH es configura en algun lloc que el shell de login no llegeix. Afegeix la carpeta on tens `claude` (`which claude`) a `~/.zprofile`. |
| La mascota no reacciona | Reinicia les sessions de Claude Code. Comprova que `~/.claude/settings.json` conté `# claudebar` i que `~/.claudebar/sessions/` s'omple. |
| No surt res a la Touch Bar | Mira els logs a Console.app filtrant per `ClaudeBar`. Si posa que l'API no és disponible, el teu macOS ja no la té. |
| Has mogut l'app | Torna a instal·lar els hooks des del menú: la ruta va dins del hook. |

## Personalitzar

- Dibuix i colors: `Sources/ClaudeBar/Sprite.swift` (graella de 14×8 de caràcters).
- Velocitats, temps per adormir-se, mida, frames del spinner i verbs: `Sources/ClaudeBar/MascotBarView.swift`.
- Botons de la Touch Bar: `Sources/ClaudeBar/TouchBarController.swift`.
- Caducitat dels estats: `Sources/ClaudeBarCore/SessionStore.swift`.

La mascota és un dibuix propi inspirat en la de Claude Code, per a ús personal. Claude i el
seu logo són marques d'Anthropic. No ho publiquis com si fos oficial.
