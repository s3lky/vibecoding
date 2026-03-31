import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ── Constantes ───────────────────────────────────────────────────────
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY  = process.env.JWT_ACCESS_EXPIRY  || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// ── JWT helpers ──────────────────────────────────────────────────────
export function signAccess(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY, algorithm: 'HS256' });
}

export function signRefresh(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY, algorithm: 'HS256' });
}

export function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] });
}

export function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] });
}

// ── Middleware: requiere JWT válido ──────────────────────────────────
export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ── Middleware: requiere API key de n8n ──────────────────────────────
// Comparación en tiempo constante para prevenir timing attacks
export function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  const expected = process.env.N8N_API_KEY;

  if (!key || !expected) {
    return res.status(401).json({ error: 'API key requerida' });
  }

  // timingSafeEqual requiere buffers del mismo tamaño
  const keyBuf = Buffer.alloc(64);
  const expBuf = Buffer.alloc(64);
  keyBuf.write(key);
  expBuf.write(expected);

  if (!crypto.timingSafeEqual(keyBuf, expBuf)) {
    return res.status(401).json({ error: 'API key inválida' });
  }

  next();
}

// ── Opciones cookie httpOnly para refresh token ──────────────────────
export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  path: '/api/auth',
};
