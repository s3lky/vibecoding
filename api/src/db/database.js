import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/serenia.db');

// Asegurar que el directorio existe
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// WAL mode: mejor rendimiento y concurrencia
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
// Forzar borrado seguro (no deja datos en disco tras DELETE)
db.pragma('secure_delete = ON');

// ── Migraciones ──────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id          TEXT PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    excerpt     TEXT NOT NULL,
    content     TEXT NOT NULL,
    cover_url   TEXT,
    tags        TEXT DEFAULT '[]',
    status      TEXT NOT NULL DEFAULT 'draft'
                CHECK(status IN ('draft', 'published', 'archived')),
    author      TEXT NOT NULL DEFAULT 'SerenIA',
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    published_at TEXT,
    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_articles_status   ON articles(status);
  CREATE INDEX IF NOT EXISTS idx_articles_slug     ON articles(slug);
  CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON articles(published_at DESC);

  CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    username     TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    token       TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
`);

export default db;
