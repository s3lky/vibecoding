#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# SerenIA API — generador de .env
# Uso: bash setup-env.sh
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

ENV_FILE="$(dirname "$0")/.env"

# Colores
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}  SerenIA API — Configuración de entorno${NC}"
echo -e "  ─────────────────────────────────────────"
echo ""

# Advertencia si ya existe
if [[ -f "$ENV_FILE" ]]; then
  echo -e "${YELLOW}  ⚠  Ya existe un .env. Se sobreescribirá.${NC}"
  read -rp "  ¿Continuar? [s/N] " confirm
  [[ "${confirm,,}" == "s" ]] || { echo "  Cancelado."; exit 0; }
  echo ""
fi

# ── Entorno ────────────────────────────────────────────────────────────
echo -e "${BOLD}  [1/4] Entorno${NC}"
read -rp "  NODE_ENV [development]: " NODE_ENV
NODE_ENV="${NODE_ENV:-development}"
read -rp "  PORT [3001]: " PORT
PORT="${PORT:-3001}"
echo ""

# ── Credenciales admin ─────────────────────────────────────────────────
echo -e "${BOLD}  [2/4] Credenciales del panel admin${NC}"
read -rp "  Usuario admin [admin]: " ADMIN_USERNAME
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"

while true; do
  read -rsp "  Contraseña admin: " ADMIN_PASSWORD; echo ""
  [[ ${#ADMIN_PASSWORD} -ge 12 ]] && break
  echo -e "  ${RED}  Mínimo 12 caracteres.${NC}"
done

read -rsp "  Confirma contraseña: " ADMIN_PASSWORD2; echo ""
if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD2" ]]; then
  echo -e "  ${RED}  Las contraseñas no coinciden. Abortando.${NC}"; exit 1
fi
echo ""

# ── CORS ───────────────────────────────────────────────────────────────
echo -e "${BOLD}  [3/4] CORS — orígenes permitidos${NC}"
echo -e "  (separados por coma, sin espacios)"
read -rp "  ALLOWED_ORIGINS [http://localhost:5173,https://serenia.io]: " ALLOWED_ORIGINS
ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:5173,https://serenia.io}"
echo ""

# ── SQLite ─────────────────────────────────────────────────────────────
echo -e "${BOLD}  [4/4] Base de datos${NC}"
read -rp "  DB_PATH [./data/serenia.db]: " DB_PATH
DB_PATH="${DB_PATH:-./data/serenia.db}"
echo ""

# ── Generar secrets ────────────────────────────────────────────────────
echo -e "  ${CYAN}Generando secrets aleatorios...${NC}"
JWT_ACCESS_SECRET=$(node -e "process.stdout.write(require('crypto').randomBytes(64).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "process.stdout.write(require('crypto').randomBytes(64).toString('hex'))")
N8N_API_KEY=$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))")

# ── Escribir .env ──────────────────────────────────────────────────────
cat > "$ENV_FILE" <<EOF
# ── Servidor ──────────────────────────────────────────────────────────
PORT=${PORT}
NODE_ENV=${NODE_ENV}

# ── JWT ───────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Admin ─────────────────────────────────────────────────────────────
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# ── API Key para n8n ──────────────────────────────────────────────────
N8N_API_KEY=${N8N_API_KEY}

# ── CORS ──────────────────────────────────────────────────────────────
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}

# ── SQLite ────────────────────────────────────────────────────────────
DB_PATH=${DB_PATH}
EOF

# Permisos restrictivos: solo el propietario puede leer
chmod 600 "$ENV_FILE"

echo ""
echo -e "  ${GREEN}✓  .env generado correctamente${NC}"
echo -e "  ${GREEN}✓  Permisos: 600 (solo tú puedes leerlo)${NC}"
echo ""
echo -e "${BOLD}  Tu API Key para n8n:${NC}"
echo -e "  ${CYAN}${N8N_API_KEY}${NC}"
echo ""
echo -e "  Guárdala ahora — no se mostrará de nuevo."
echo -e "  Úsala en n8n como header: ${BOLD}X-API-Key: <key>${NC}"
echo ""
echo -e "  Para arrancar la API:"
echo -e "  ${BOLD}cd api && npm start${NC}"
echo ""
