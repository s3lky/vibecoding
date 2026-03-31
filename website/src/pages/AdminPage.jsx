import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Eye, Trash2, CheckCircle, RotateCcw, Loader2, AlertTriangle, FileText, Globe } from 'lucide-react';
import { authApi, adminApi } from '../lib/api';
import SEO from '../components/SEO';

// ── Login ─────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { ok, error: err } = await authApi.login(username, password);
    if (ok) onLogin();
    else { setError(err || 'Credenciales incorrectas'); setLoading(false); }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--font)',
    fontSize: '0.9rem', padding: '12px 14px', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <SEO title="Admin — SerenIA Blog" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 380, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>
            Seren<span style={{ color: 'var(--accent)' }}>IA</span> Admin
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Acceso al panel de blog</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-lg)', padding: '28px',
        }}>
          {error && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16,
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 'var(--radius)', padding: '10px 14px',
              fontSize: '0.82rem', color: '#f87171',
            }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Usuario" autoComplete="username" required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <input value={password} onChange={e => setPassword(e.target.value)}
              type="password" placeholder="Contraseña" autoComplete="current-password" required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <button type="submit" disabled={loading} style={{
            marginTop: 20, width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font)',
          }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Entrando...</> : 'Entrar'}
          </button>
        </form>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Badge de estado ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    draft:     { label: 'Borrador',   bg: 'rgba(250,204,21,0.1)',   border: 'rgba(250,204,21,0.25)',   color: '#fbbf24' },
    published: { label: 'Publicado',  bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.25)',   color: '#34d399' },
    archived:  { label: 'Archivado',  bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',   color: 'var(--muted)' },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      textTransform: 'uppercase', letterSpacing: '0.07em',
    }}>{s.label}</span>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────
function AdminPanel() {
  const [articles, setArticles]   = useState([]);
  const [filter, setFilter]       = useState('all');
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.list(filter === 'all' ? null : filter)
      .then(r => r.json())
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const action = async (fn, id) => {
    setActionId(id);
    await fn(id);
    load();
    setActionId(null);
  };

  const handleDelete = async (id) => {
    setConfirmDel(null);
    await action(adminApi.delete, id);
  };

  const counts = { all: articles.length }; // simplificado

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <SEO title="Admin Blog — SerenIA" noindex />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>
              Blog Admin
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
              Revisa los borradores creados por n8n y publícalos cuando estén listos.
            </p>
          </div>
          <button onClick={() => authApi.logout().then(() => window.location.reload())}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)',
              color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 600, padding: '8px 14px',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['all', 'draft', 'published'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600,
                border: `1px solid ${filter === f ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                background: filter === f ? 'rgba(96,165,250,0.1)' : 'transparent',
                color: filter === f ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
              {f === 'all' ? 'Todos' : f === 'draft' ? 'Borradores' : 'Publicados'}
            </button>
          ))}
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--muted)' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <FileText size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No hay artículos en esta categoría.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {articles.map(a => (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 'var(--radius)', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  }}>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, lineHeight: 1.35 }}>{a.title}</p>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusBadge status={a.status} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {new Date(a.created_at).toLocaleDateString('es')}
                      </span>
                      {a.tags?.length > 0 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          {a.tags.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {a.status === 'published' && (
                      <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(96,165,250,0.06)', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 600 }}>
                        <Eye size={13} /> Ver
                      </a>
                    )}

                    {a.status === 'draft' && (
                      <button
                        onClick={() => action(adminApi.publish, a.id)}
                        disabled={actionId === a.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.08)', color: '#34d399', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                        {actionId === a.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                        Publicar
                      </button>
                    )}

                    {a.status === 'published' && (
                      <button
                        onClick={() => action(adminApi.unpublish, a.id)}
                        disabled={actionId === a.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(250,204,21,0.2)', background: 'rgba(250,204,21,0.06)', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                        <RotateCcw size={13} /> Borrador
                      </button>
                    )}

                    <button
                      onClick={() => setConfirmDel(a.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.06)', color: '#f87171', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal confirmación borrado */}
        <AnimatePresence>
          {confirmDel && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
              onClick={() => setConfirmDel(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
                style={{ background: 'var(--bg-card)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius-lg)', padding: '28px', maxWidth: 380, width: '90%' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>¿Eliminar artículo?</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 20 }}>Esta acción no se puede deshacer.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setConfirmDel(null)}
                    style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600 }}>
                    Cancelar
                  </button>
                  <button onClick={() => handleDelete(confirmDel)}
                    style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: '#f87171', color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font)' }}>
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Componente raíz: decide si mostrar login o panel ─────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(authApi.isLoggedIn());

  // Intenta restaurar sesión con refresh token al cargar
  useEffect(() => {
    if (!authed) {
      authApi.refresh().then(ok => { if (ok) setAuthed(true); });
    }
  }, []);

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;
  return <AdminPanel />;
}
