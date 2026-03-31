import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Hexagon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const hashLinks = [
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Nosotros', href: '/#nosotros' },
  { label: 'Planes', href: '/#planes' },
  { label: 'Contacto', href: '/#contacto' },
];

const pageLinks = [
  { label: 'Catálogo', to: '/servicios' },
  { label: 'Glosario', to: '/glosario' },
  { label: 'FAQ', to: '/faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '14px 0',
          background: scrolled ? 'rgba(4,7,13,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ color: 'var(--accent)', display: 'flex' }}><Hexagon size={22} strokeWidth={2} /></span>
            Seren<span style={{ color: 'var(--accent)' }}>IA</span>
          </a>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
            {hashLinks.map(l => (
              <a key={l.href} href={l.href}
                style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                {l.label}
              </a>
            ))}

            {/* Dropdown "Más" */}
            <div style={{ position: 'relative' }} onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
              <button style={{
                background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.875rem',
                fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                transition: 'color 0.2s', fontFamily: 'var(--font)',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                Recursos ▾
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                      marginTop: 8, background: 'var(--bg-card)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)',
                      padding: '8px 0', minWidth: 160,
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    }}
                  >
                    {pageLinks.map(l => (
                      <Link key={l.to} to={l.to} style={{
                        display: 'block', padding: '10px 16px', fontSize: '0.875rem', color: 'var(--muted)',
                        textDecoration: 'none', transition: 'color 0.15s, background 0.15s',
                        fontWeight: 500,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'; }}>
                        {l.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="/#contacto"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', padding: '8px 20px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 0 20px rgba(96,165,250,0.22)', transition: 'all 0.2s', textDecoration: 'none' }}>
              Hablemos
            </a>
          </nav>

          <button onClick={() => setOpen(o => !o)} className="burger-btn"
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text)', padding: 4, cursor: 'pointer' }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99,
              background: 'var(--bg-dark)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 32,
            }}
          >
            {hashLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>
                {l.label}
              </a>
            ))}
            <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            {pageLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
            <a href="/#contacto" onClick={() => setOpen(false)}
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', padding: '14px 32px', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '1.1rem', marginTop: 8, textDecoration: 'none' }}>
              Hablemos
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 720px) {
          .desktop-nav { display: none !important; }
          .burger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
