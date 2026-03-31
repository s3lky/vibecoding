import { Hexagon } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-dark)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '32px 0',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1.1rem' }}>
          <span style={{ color: 'var(--accent)' }}><Hexagon size={20} strokeWidth={2} /></span>
          DataFlow<span style={{ color: 'var(--accent)' }}>Pro</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          © 2026 DataFlowPro · Automatización & Calidad de Datos
        </p>
        <nav style={{ display: 'flex', gap: 24 }}>
          {['#servicios', '#proceso', '#contacto'].map((href) => (
            <a key={href} href={href} style={{ fontSize: '0.82rem', color: 'var(--muted)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = ''}>
              {href.replace('#', '').charAt(0).toUpperCase() + href.replace('#', '').slice(1)}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
