import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { ShieldCheck, Lightbulb, Users, Rocket } from 'lucide-react';

const values = [
  { icon: <ShieldCheck size={20} />, title: 'Calidad ante todo', desc: 'Cada pipeline que entrego tiene tests, documentación y métricas de salud. Nunca entregas a ciegas.' },
  { icon: <Lightbulb size={20} />, title: 'Soluciones prácticas', desc: 'Sin sobreingeniería. La herramienta correcta para el problema correcto, desplegada en el menor tiempo posible.' },
  { icon: <Users size={20} />, title: 'Trabajo en equipo', desc: 'Me integro con tu equipo técnico, aprendo tu contexto y dejo el conocimiento transferido al terminar.' },
  { icon: <Rocket size={20} />, title: 'Entrega continua', desc: 'Sprints cortos, entregables reales desde la primera semana. Sin meses de diseño antes de ver resultados.' },
];

export default function AboutUs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="nosotros" style={{ padding: '96px 0', background: 'var(--bg-dark)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="about-grid">

          {/* Texto */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{
              display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
              color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20,
            }}>Quiénes somos</span>

            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
              Expertos en convertir{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>datos en valor</span>
            </h2>

            <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 18, fontSize: '0.95rem' }}>
              Somos un equipo especializado en automatización de datos e inteligencia artificial, con foco
              en <strong style={{ color: 'var(--text)' }}>calidad, velocidad y transferencia de conocimiento</strong>.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 32, fontSize: '0.95rem' }}>
              Trabajamos principalmente con n8n, Python y LLMs para construir pipelines que no solo funcionan,
              sino que son mantenibles, observables y fáciles de escalar. Nuestros clientes van desde startups
              hasta equipos de datos en empresas medianas que necesitan mover rápido sin perder rigor.
            </p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { num: '+50', label: 'Proyectos entregados' },
                { num: '4 años', label: 'En automatización de datos' },
                { num: '100%', label: 'Remoto & disponible' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{
                    fontSize: '1.6rem', fontWeight: 900, lineHeight: 1,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{s.num}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Valores */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
          >
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -4, borderColor: 'rgba(96,165,250,0.25)' }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-lg)', padding: '24px 20px',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)', marginBottom: 14,
                }}>
                  {v.icon}
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>{v.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
      <style>{`@media (max-width: 860px) { .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </section>
  );
}
