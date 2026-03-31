import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Tag, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { blogApi } from '../lib/api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ArticleCard({ article, i }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      style={{
        background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      whileHover={{ y: -4, borderColor: 'rgba(96,165,250,0.22)' }}
    >
      {article.cover_url && (
        <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'rgba(96,165,250,0.05)' }}>
          <img src={article.cover_url} alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy" />
        </div>
      )}
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {article.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', padding: '2px 10px', borderRadius: 100,
                background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)',
                color: 'var(--accent)',
              }}>{tag}</span>
            ))}
          </div>
        )}
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>
          {article.title}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, flex: 1, marginBottom: 16 }}>
          {article.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--muted)' }}>
            <Calendar size={12} /> {formatDate(article.published_at)}
          </span>
          <Link to={`/blog/${article.slug}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)',
            transition: 'gap 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.gap = '9px'}
            onMouseLeave={e => e.currentTarget.style.gap = '5px'}>
            Leer <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [meta, setMeta]         = useState(null);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    blogApi.list(page, 9)
      .then(r => r.json())
      .then(({ data, meta }) => { setArticles(data); setMeta(meta); })
      .catch(() => setError('No se pudo cargar el blog.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <SEO
        title="Blog — Automatización de datos, n8n, IA y ETL"
        description="Artículos sobre automatización con n8n, calidad de datos con IA, pipelines ETL/ELT y buenas prácticas de data engineering."
        path="/blog"
      />
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 56 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Blog</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: 12 }}>
            Automatización, datos{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>e inteligencia artificial</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>
            Guías prácticas, casos de uso y reflexiones sobre data engineering.
          </p>
        </motion.div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: 8 }}>Pronto habrá artículos aquí.</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Mientras tanto, visita el <Link to="/glosario" style={{ color: 'var(--accent)' }}>glosario</Link>.</p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {articles.map((a, i) => <ArticleCard key={a.id} article={a} i={i} />)}
            </div>

            {/* Paginación */}
            {meta && meta.pages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 48 }}>
                {Array.from({ length: meta.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: 36, height: 36, borderRadius: 8, border: '1px solid',
                    borderColor: p === page ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    background: p === page ? 'rgba(96,165,250,0.1)' : 'transparent',
                    color: p === page ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
