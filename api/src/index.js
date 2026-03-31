import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import authRouter from './routes/auth.js';
import blogRouter from './routes/blog.js';
import { ensureAdminExists } from './routes/auth.js';

// ── Validar env obligatorios ─────────────────────────────────────────
const REQUIRED_ENV = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'N8N_API_KEY', 'ADMIN_PASSWORD'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Variable de entorno obligatoria no configurada: ${key}`);
    process.exit(1);
  }
}

const app  = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// ── Seguridad: Helmet ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
}));

// ── CORS estricto ────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permitir sin origen (curl, mobile apps) solo en dev
    if (!origin && !isProd) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// ── Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '512kb' }));
app.use(cookieParser());

// ── Rate limiting ────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera 15 minutos.' },
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones.' },
});

const n8nLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.headers['x-api-key'] || ipKeyGenerator(req),
  message: { error: 'Límite de drafts alcanzado.' },
});

// ── Rutas ────────────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter,   authRouter);
app.use('/api/blog/draft', n8nLimiter);   // aplicar antes del router
app.use('/api/blog',      publicLimiter, blogRouter);

// ── Health check ─────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── 404 ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  // No exponer detalles de error en producción
  const message = isProd && status === 500 ? 'Error interno' : err.message;
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
});

// ── Arranque ─────────────────────────────────────────────────────────
ensureAdminExists();
app.listen(PORT, () => {
  console.log(`✓ SerenIA API corriendo en http://localhost:${PORT}`);
  console.log(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
});
