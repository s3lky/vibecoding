import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, PenTool, Code2, Handshake } from 'lucide-react';

const steps = [
  { num: '01', icon: <Search size={22} />, title: 'Diagnóstico', desc: 'Auditoría de fuentes de datos, procesos manuales y puntos de dolor. Identificamos el ROI potencial antes de escribir una línea.' },
  { num: '02', icon: <PenTool size={22} />, title: 'Diseño', desc: 'Arquitectura del pipeline, selección de herramientas y definición de reglas de calidad junto a tu equipo técnico.' },
  { num: '03', icon: <Code2 size={22} />, title: 'Implementación', desc: 'Desarrollo iterativo en sprints de 1 semana. Entregables tangibles y en producción desde el día 7.' },
  { num: '04', icon: <Handshake size={22} />, title: 'Transferencia', desc: 'Documentación completa, formación al equipo y soporte post-lanzamiento incluido en todos los proyectos.' },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="proceso" style={{ padding: '96px 0', background: 'var(--bg-dark)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 64px' }}
        >
          <span style={{
            display: 'inline-block', background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Proceso</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15 }}>
            De la idea a{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>producción en semanas</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, position: 'relative' }}>
          {steps.map((step, i) => {
            const stepRef = useRef(null);
            const stepInView = useInView(stepRef, { once: true, margin: '-40px' });
            return (
              <motion.div
                key={step.num}
                ref={stepRef}
                initial={{ opacity: 0, y: 40 }}
                animate={stepInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 28px',
                  position: 'relative',
                }}
                whileHover={{ borderColor: 'rgba(99,179,237,0.25)', y: -4 }}
              >
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: '2.8rem', fontWeight: 600,
                  color: 'var(--accent)', opacity: 0.25, lineHeight: 1, marginBottom: 20,
                  userSelect: 'none',
                }}>
                  {step.num}
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)', marginBottom: 16,
                }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65 }}>{step.desc}</p>

                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '50%', right: -10,
                    width: 20, height: 1,
                    background: 'rgba(99,179,237,0.2)',
                    display: 'none',
                  }} className="step-arrow" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
