import { Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-dark)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '48px 0 28px',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1.1rem', marginBottom: 14 }}>
              <span style={{ color: 'var(--accent)' }}><Hexagon size={20} strokeWidth={2} /></span>
              Seren<span style={{ color: 'var(--accent)' }}>IA</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 240 }}>
              Servicios profesionales de automatización con n8n, calidad de datos con IA y pipelines ETL/ELT.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Servicios</p>
            {['Automatización n8n', 'Calidad de Datos IA', 'Pipelines ETL/ELT', 'Curado de Datos', 'Integraciones API'].map(s => (
              <a key={s} href="/#servicios" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = ''}>{s}</a>
            ))}
          </div>

          {/* Empresa */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Empresa</p>
            {[
              { label: 'Quiénes somos', href: '/#nosotros' },
              { label: 'Planes', href: '/#planes' },
              { label: 'Casos de uso', href: '/#casos' },
              { label: 'Contacto', href: '/#contacto' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = ''}>{l.label}</a>
            ))}
          </div>

          {/* Recursos */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Recursos</p>
            {[
              { label: 'Catálogo de servicios', to: '/servicios' },
              { label: 'Glosario IA & Datos', to: '/glosario' },
              { label: 'FAQ', to: '/faq' },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = ''}>{l.label}</Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            © 2026 SerenIA · Automatización & Calidad de Datos · hola@serenia.io
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['n8n Certified', 'Data Quality', 'AI Integrations', 'ETL/ELT'].map(t => (
              <span key={t} style={{
                fontSize: '0.68rem', padding: '2px 10px', borderRadius: 100,
                background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.12)',
                color: 'var(--muted)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 720px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr !important; } }`}</style>
    </footer>
  );
}
