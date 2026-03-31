import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Hexagon } from 'lucide-react';

const links = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Stack', href: '#stack' },
  { label: 'Casos', href: '#casos' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '16px 0',
          background: scrolled ? 'rgba(6,9,15,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--accent)', display: 'flex' }}><Hexagon size={22} strokeWidth={2} /></span>
            Seren<span style={{ color: 'var(--accent)' }}>IA</span>
          </a>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
            {links.map(l => (
              <a key={l.href} href={l.href} style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                {l.label}
              </a>
            ))}
            <a href="#contacto"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', padding: '8px 20px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 0 20px rgba(99,179,237,0.25)', transition: 'all 0.2s' }}>
              Hablemos
            </a>
          </nav>

          <button onClick={() => setOpen(o => !o)} className="burger-btn"
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

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
              alignItems: 'center', justifyContent: 'center', gap: 40,
            }}
          >
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
                {l.label}
              </a>
            ))}
            <a href="#contacto" onClick={() => setOpen(false)}
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', padding: '14px 32px', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '1.1rem' }}>
              Hablemos
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .burger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
