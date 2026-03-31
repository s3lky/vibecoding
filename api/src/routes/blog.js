import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import slugify from 'slugify';
import sanitizeHtml from 'sanitize-html';
import db from '../db/database.js';
import { requireAuth, requireApiKey } from '../middleware/auth.js';

const router = Router();

// ── Sanitización de HTML (contenido del artículo) ────────────────────
const ALLOWED_HTML = {
  allowedTags: [
    'h1','h2','h3','h4','h5','h6','p','br','hr',
    'ul','ol','li','blockquote','pre','code',
    'strong','em','b','i','u','s',
    'a','img','table','thead','tbody','tr','th','td',
  ],
  allowedAttributes: {
    'a':   ['href', 'title', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'code': ['class'],
    'pre':  ['class'],
  },
  allowedSchemes: ['https', 'http', 'mailto'],
  // Forzar rel=noopener en links externos
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: 'noopener noreferrer' },
    }),
  },
};

function sanitize(html) {
  return sanitizeHtml(html, ALLOWED_HTML);
}

function generateSlug(title) {
  const base = slugify(title, { lower: true, strict: true, locale: 'es' });
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

// ── Schemas de validación ────────────────────────────────────────────
const draftSchema = z.object({
  title:     z.string().min(5).max(200),
  excerpt:   z.string().min(10).max(500),
  content:   z.string().min(50).max(100_000),
  cover_url: z.string().url().optional().nullable(),
  tags:      z.array(z.string().max(30)).max(10).optional(),
  author:    z.string().max(100).optional(),
});

const updateSchema = draftSchema.partial();

// ── RUTAS PÚBLICAS ────────────────────────────────────────────────────

// GET /api/blog — artículos publicados (paginado)
router.get('/', (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
  const tag   = req.query.tag || null;
  const offset = (page - 1) * limit;

  let where = "WHERE status = 'published'";
  const params = [];

  if (tag) {
    where += " AND tags LIKE ?";
    params.push(`%"${tag}"%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as n FROM articles ${where}`).get(...params).n;
  const articles = db.prepare(`
    SELECT id, slug, title, excerpt, cover_url, tags, author, published_at
    FROM articles ${where}
    ORDER BY published_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({
    data: articles.map(a => ({ ...a, tags: JSON.parse(a.tags) })),
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

// GET /api/blog/:slug — artículo publicado individual
router.get('/:slug', (req, res) => {
  const article = db.prepare(
    "SELECT * FROM articles WHERE slug = ? AND status = 'published'"
  ).get(req.params.slug);

  if (!article) return res.status(404).json({ error: 'Artículo no encontrado' });

  res.json({ ...article, tags: JSON.parse(article.tags) });
});

// ── RUTAS ADMIN (JWT) ─────────────────────────────────────────────────

// GET /api/blog/admin/all — todos los artículos con cualquier estado
router.get('/admin/all', requireAuth, (req, res) => {
  const status = req.query.status || null;
  let query = 'SELECT id, slug, title, excerpt, tags, status, author, created_at, published_at FROM articles';
  const params = [];
  if (status) { query += ' WHERE status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC';

  const articles = db.prepare(query).all(...params);
  res.json(articles.map(a => ({ ...a, tags: JSON.parse(a.tags) })));
});

// GET /api/blog/admin/:id — ver borrador completo
router.get('/admin/:id', requireAuth, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'No encontrado' });
  res.json({ ...article, tags: JSON.parse(article.tags) });
});

// PUT /api/blog/admin/:id — editar artículo
router.put('/admin/:id', requireAuth, (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = db.prepare('SELECT id FROM articles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });

  const { title, excerpt, content, cover_url, tags, author } = parsed.data;
  const updates = [];
  const params = [];

  if (title   !== undefined) { updates.push('title = ?');     params.push(title); }
  if (excerpt !== undefined) { updates.push('excerpt = ?');   params.push(excerpt); }
  if (content !== undefined) { updates.push('content = ?');   params.push(sanitize(content)); }
  if (cover_url !== undefined) { updates.push('cover_url = ?'); params.push(cover_url); }
  if (tags    !== undefined) { updates.push('tags = ?');      params.push(JSON.stringify(tags)); }
  if (author  !== undefined) { updates.push('author = ?');    params.push(author); }

  if (!updates.length) return res.status(400).json({ error: 'Sin cambios' });

  updates.push("updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')");
  params.push(req.params.id);

  db.prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  res.json({ ...updated, tags: JSON.parse(updated.tags) });
});

// POST /api/blog/admin/:id/publish — publicar borrador
router.post('/admin/:id/publish', requireAuth, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'No encontrado' });
  if (article.status === 'published') return res.status(409).json({ error: 'Ya publicado' });

  db.prepare(`
    UPDATE articles
    SET status = 'published',
        published_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
        updated_at   = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
    WHERE id = ?
  `).run(req.params.id);

  res.json({ ok: true, slug: article.slug });
});

// POST /api/blog/admin/:id/unpublish — volver a borrador
router.post('/admin/:id/unpublish', requireAuth, (req, res) => {
  const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'No encontrado' });

  db.prepare(`
    UPDATE articles
    SET status = 'draft', published_at = NULL,
        updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
    WHERE id = ?
  `).run(req.params.id);

  res.json({ ok: true });
});

// DELETE /api/blog/admin/:id — eliminar artículo
router.delete('/admin/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'No encontrado' });
  res.json({ ok: true });
});

// ── RUTA n8n: crear borrador ──────────────────────────────────────────

// POST /api/blog/draft — n8n envía aquí con X-API-Key
router.post('/draft', requireApiKey, (req, res) => {
  const parsed = draftSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { title, excerpt, content, cover_url, tags = [], author = 'SerenIA' } = parsed.data;

  const id   = crypto.randomUUID();
  const slug = generateSlug(title);
  const sanitizedContent = sanitize(content);

  db.prepare(`
    INSERT INTO articles (id, slug, title, excerpt, content, cover_url, tags, status, author)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)
  `).run(id, slug, title, excerpt, sanitizedContent, cover_url ?? null, JSON.stringify(tags), author);

  res.status(201).json({ id, slug, status: 'draft' });
});

export default router;
