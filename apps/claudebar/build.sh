#!/bin/bash
# Compila ClaudeBar.app. Ús:
#   ./build.sh            -> build/ClaudeBar.app
#   ./build.sh install    -> també la copia a ~/Applications i instal·la els hooks
set -euo pipefail
cd "$(dirname "$0")"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "Això només compila a macOS." >&2
  exit 1
fi

swift build -c release --arch arm64
BIN="$(swift build -c release --arch arm64 --show-bin-path)/ClaudeBar"

APP=build/ClaudeBar.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"
cp "$BIN" "$APP/Contents/MacOS/ClaudeBar"
cp Resources/Info.plist "$APP/Contents/Info.plist"
# Signatura ad hoc: suficient per executar-la al teu Mac.
codesign --force --sign - "$APP"
echo "Fet: $APP"

if [[ "${1:-}" == "install" ]]; then
  DEST="$HOME/Applications/ClaudeBar.app"
  mkdir -p "$HOME/Applications"
  pkill -x ClaudeBar 2>/dev/null || true
  rm -rf "$DEST"
  cp -R "$APP" "$DEST"
  "$DEST/Contents/MacOS/ClaudeBar" install-hooks
  open "$DEST"
  echo "Instal·lada a $DEST i en marxa."
fi
