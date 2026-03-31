import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const stats = [
  { num: '98%', label: 'Precisión de datos' },
  { num: '10×', label: 'Velocidad de procesado' },
  { num: '0', label: 'Intervención manual' },
];

export default function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, overflow: 'hidden' }}>

      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)',
        }} />
        {/* Orbs */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,179,237,0.18) 0%, transparent 70%)', filter: 'blur(60px)', top: -200, right: -150, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(159,122,234,0.15) 0%, transparent 70%)', filter: 'blur(60px)', bottom: -100, left: -100, pointerEvents: 'none' }} />
      </div>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1 }}>

        <motion.div {...fadeUp(0.1)}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,179,237,0.07)', border: '1px solid rgba(99,179,237,0.22)',
            color: 'var(--accent)', borderRadius: 100, padding: '5px 16px',
            fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            <Zap size={12} />
            n8n · IA · ETL · Data Quality
          </span>
        </motion.div>

        <motion.h1 {...fadeUp(0.2)} style={{
          fontSize: 'clamp(2.8rem, 6vw, 5rem)',
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: '-0.04em',
          marginBottom: 24,
          maxWidth: 820,
        }}>
          Automatiza tus datos.<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Eleva tu negocio.
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.3)} style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--muted)', maxWidth: 580, marginBottom: 44, lineHeight: 1.75 }}>
          Diseño e implemento pipelines de automatización con n8n e IA para limpiar,
          curar y transformar tus datos — de fuente a destino, sin fricciones.
        </motion.p>

        <motion.div {...fadeUp(0.4)} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 72 }}>
          <a href="#contacto" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#fff', padding: '14px 28px', borderRadius: 'var(--radius)',
            fontWeight: 700, fontSize: '1rem',
            boxShadow: '0 0 32px rgba(99,179,237,0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(99,179,237,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 32px rgba(99,179,237,0.35)'; }}>
            Solicitar diagnóstico gratuito <ArrowRight size={16} />
          </a>
          <a href="#servicios" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: 'var(--text)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 28px', borderRadius: 'var(--radius)',
            fontWeight: 600, fontSize: '1rem',
            transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}>
            Ver servicios →
          </a>
        </motion.div>

        <motion.div {...fadeUp(0.5)} style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: i > 0 ? 40 : 0 }}>
              {i > 0 && <div style={{ width: 1, height: 44, background: 'rgba(255,255,255,0.08)', marginRight: 0 }} />}
              <div>
                <div style={{
                  fontSize: '2.2rem', fontWeight: 900, lineHeight: 1,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
