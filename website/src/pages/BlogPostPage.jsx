import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { blogApi } from '../lib/api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    blogApi.get(slug)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setArticle)
      .catch(() => setError('Artículo no encontrado.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !article) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <SEO title="Artículo no encontrado" noindex />
      <p style={{ color: 'var(--muted)' }}>{error || 'Artículo no encontrado.'}</p>
      <Link to="/blog" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>← Volver al blog</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <SEO
        title={article.title}
        description={article.excerpt}
        path={`/blog/${article.slug}`}
        image={article.cover_url || undefined}
        type="article"
      />

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 40 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = ''}>
          <ArrowLeft size={16} /> Volver al blog
        </Link>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {article.tags.map(tag => (
              <span key={tag} style={{
                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.07em', padding: '3px 12px', borderRadius: 100,
                background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
                color: 'var(--accent)',
              }}>{tag}</span>
            ))}
          </div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>
          {article.title}
        </motion.h1>

        <div style={{ display: 'flex', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--muted)' }}>
            <Calendar size={13} /> {formatDate(article.published_at)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--muted)' }}>
            <User size={13} /> {article.author}
          </span>
        </div>

        {article.cover_url && (
          <img src={article.cover_url} alt={article.title}
            style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: 40, maxHeight: 440, objectFit: 'cover' }}
          />
        )}

        {/* Contenido HTML sanitizado en servidor */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: article.content }}
          style={{
            color: 'var(--muted)', lineHeight: 1.8, fontSize: '1rem',
          }}
        />

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 60, paddingTop: 32 }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 16 }}>
            ¿Quieres automatizar algo parecido?
          </p>
          <a href="/#contacto" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            boxShadow: '0 0 24px rgba(96,165,250,0.25)',
          }}>
            Solicitar diagnóstico gratuito →
          </a>
        </div>
      </article>

      {/* Estilos para el contenido HTML del artículo */}
      <style>{`
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: var(--text); font-weight: 700; margin: 1.6em 0 0.6em;
        }
        .prose h2 { font-size: 1.5rem; }
        .prose h3 { font-size: 1.2rem; }
        .prose p  { margin-bottom: 1.2em; }
        .prose a  { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
        .prose code {
          background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.15);
          padding: 2px 7px; border-radius: 5px; font-size: 0.875em;
          font-family: var(--mono); color: var(--accent);
        }
        .prose pre {
          background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.07);
          border-radius: var(--radius); padding: 20px; overflow-x: auto; margin: 1.5em 0;
        }
        .prose pre code { background: none; border: none; padding: 0; color: #e2e8f0; font-size: 0.875rem; }
        .prose ul, .prose ol { padding-left: 1.6em; margin-bottom: 1.2em; }
        .prose li { margin-bottom: 0.4em; }
        .prose blockquote {
          border-left: 3px solid var(--accent); padding-left: 16px;
          color: var(--muted); font-style: italic; margin: 1.5em 0;
        }
        .prose img { max-width: 100%; border-radius: var(--radius); margin: 1.5em 0; }
        .prose table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.875rem; }
        .prose th, .prose td { border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; }
        .prose th { background: rgba(96,165,250,0.07); color: var(--text); font-weight: 700; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
