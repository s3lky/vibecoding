import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import db from '../db/database.js';
import {
  signAccess, signRefresh, verifyRefresh,
  requireAuth, refreshCookieOptions,
} from '../middleware/auth.js';

const router = Router();

// ── Hashing seguro sin bcrypt (PBKDF2 nativo de Node) ────────────────
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt] = stored.split(':');
  const expected = hashPassword(password, salt);
  // Comparación en tiempo constante
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(stored));
}

// ── Crear admin inicial si no existe ────────────────────────────────
export function ensureAdminExists() {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(
    process.env.ADMIN_USERNAME || 'admin'
  );
  if (!existing) {
    const id = crypto.randomUUID();
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error('ADMIN_PASSWORD no configurado en .env');
    db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(
      id, username, hashPassword(password)
    );
    console.log(`✓ Admin "${username}" creado`);
  }
}

// ── Validación ───────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Credenciales inválidas' });
  }

  const { username, password } = parsed.data;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  // Siempre ejecuta la verificación aunque el usuario no exista (anti-timing)
  const dummyHash = '0000000000000000:0000000000000000000000000000000000000000000000000000000000000000';
  const valid = user
    ? verifyPassword(password, user.password_hash)
    : verifyPassword(password, dummyHash) && false;

  if (!valid) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const payload = { sub: user.id, username: user.username };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  // Guardar refresh token en DB
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(refreshToken, user.id, expiresAt);

  // Refresh token en httpOnly cookie; access token en body
  res.cookie('refresh_token', refreshToken, refreshCookieOptions);
  res.json({ accessToken, expiresIn: 900 }); // 15 min
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: 'Sin refresh token' });

  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    return res.status(401).json({ error: 'Refresh token inválido' });
  }

  // Verificar que el token existe en DB y no ha expirado
  const stored = db.prepare(
    "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%SZ', 'now')"
  ).get(refreshToken);

  if (!stored) {
    res.clearCookie('refresh_token', refreshCookieOptions);
    return res.status(401).json({ error: 'Refresh token revocado' });
  }

  const newAccess = signAccess({ sub: payload.sub, username: payload.username });
  res.json({ accessToken: newAccess, expiresIn: 900 });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  }
  res.clearCookie('refresh_token', refreshCookieOptions);
  res.json({ ok: true });
});

// DELETE /api/auth/sessions — revocar todos los refresh tokens (logout en todos los devices)
router.delete('/sessions', requireAuth, (req, res) => {
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(req.user.sub);
  res.clearCookie('refresh_token', refreshCookieOptions);
  res.json({ ok: true });
});

export default router;
