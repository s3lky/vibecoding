import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { ShieldCheck, Lightbulb, Users, Rocket, ExternalLink } from 'lucide-react';

const values = [
  { icon: <ShieldCheck size={18} />, title: 'Calidad ante todo', desc: 'Cada pipeline tiene tests, documentación y métricas de salud. Nunca entregas a ciegas.' },
  { icon: <Lightbulb size={18} />, title: 'Sin sobreingeniería', desc: 'La herramienta correcta para el problema correcto, desplegada en el menor tiempo posible.' },
  { icon: <Users size={18} />, title: 'Transferencia real', desc: 'Me integro con tu equipo, aprendo tu contexto y dejo el conocimiento transferido al terminar.' },
  { icon: <Rocket size={18} />, title: 'Entregables rápidos', desc: 'Sprints de una semana. Resultados en producción desde el día 7, no desde el mes 3.' },
];

const stats = [
  { num: '+50', label: 'Proyectos entregados' },
  { num: '+200k', label: 'Horas automatizadas' },
  { num: '4 años', label: 'Especializados en datos' },
  { num: '100%', label: 'Remoto & disponible' },
];

export default function AboutUs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="nosotros" style={{ padding: '96px 0', background: 'var(--bg-dark)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80, alignItems: 'start' }} className="about-grid">

          {/* Texto */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{
              display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
              color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20,
            }}>Quiénes somos</span>

            {/* Pain-first headline */}
            <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
              La mayoría de equipos pierden{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>10–30h a la semana</span>{' '}
              en tareas que podrían automatizarse en días.
            </h2>

            <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.95rem' }}>
              Somos un equipo especializado en automatización de datos e IA, con foco en <strong style={{ color: 'var(--text)' }}>calidad, velocidad y transferencia de conocimiento</strong>. Construimos los sistemas que hacen ese trabajo por ti.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 16, fontSize: '0.95rem' }}>
              Después de años construyendo pipelines de datos para empresas de logística, fintech y SaaS B2B, creamos SerenIA para ofrecer ese mismo nivel técnico sin las tarifas de una gran consultora.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 32, fontSize: '0.95rem' }}>
              Trabajamos principalmente con <strong style={{ color: 'var(--text)' }}>n8n, Python, dbt y LLMs</strong>. Nuestros clientes van desde startups hasta equipos de datos en empresas medianas que necesitan moverse rápido sin perder rigor.
            </p>

            {/* LinkedIn / credenciales */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
              {['n8n Certified', 'Data Quality Expert', 'AI Integrations', 'ETL/ELT'].map(tag => (
                <span key={tag} style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '4px 14px', borderRadius: 100,
                  background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.18)', color: 'var(--accent)',
                }}>{tag}</span>
              ))}
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: '0.75rem', fontWeight: 600, padding: '4px 14px', borderRadius: 100,
                background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.18)', color: 'var(--accent2)',
                textDecoration: 'none',
              }}>
                LinkedIn <ExternalLink size={11} />
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="stats-grid">
              {stats.map(s => (
                <div key={s.label} style={{
                  background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius)', padding: '16px 12px', textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '1.5rem', fontWeight: 900, lineHeight: 1,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{s.num}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 5, lineHeight: 1.35 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Valores */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Foto / avatar placeholder */}
            <div style={{
              width: '100%', aspectRatio: '1 / 0.9', borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(129,140,248,0.08))',
              border: '1px solid rgba(96,165,250,0.14)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, gap: 8,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
              }}>👤</div>
              <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem' }}>Tu nombre aquí</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Fundador · Data Automation Engineer</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
                "Vendemos resultados, no horas de trabajo."
              </p>
              {/* Decorative orb */}
              <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.12), transparent 70%)', top: -60, right: -60, pointerEvents: 'none' }} />
            </div>

            {/* Valores grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {values.map((v, i) => (
                <motion.div key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
                  whileHover={{ y: -3, borderColor: 'rgba(96,165,250,0.22)' }}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius)', padding: '18px 16px', transition: 'border-color 0.2s',
                  }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, marginBottom: 10,
                    background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                  }}>{v.icon}</div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 5 }}>{v.title}</h4>
                  <p style={{ fontSize: '0.77rem', color: 'var(--muted)', lineHeight: 1.6 }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }
        @media (max-width: 560px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}
