import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const cases = [
  {
    tag: 'E-commerce',
    tagColor: '#9f7aea',
    title: 'Sincronización de inventario multi-canal',
    desc: 'Pipeline n8n que unifica stock de 4 marketplaces, detecta inconsistencias con IA y actualiza el ERP cada 5 minutos — eliminando overselling completamente.',
    metrics: [
      { type: 'down', label: '94% errores de stock' },
      { type: 'up', label: '3h/día recuperadas' },
    ],
  },
  {
    tag: 'Fintech',
    tagColor: '#63b3ed',
    title: 'Curado de datos de transacciones',
    desc: 'Sistema de validación y enriquecimiento de transacciones bancarias usando LLMs para clasificar categorías y detectar duplicados en tiempo real.',
    metrics: [
      { type: 'up', label: '99.2% precisión' },
      { type: 'down', label: '80% revisión manual' },
    ],
  },
  {
    tag: 'SaaS B2B',
    tagColor: '#f97316',
    title: 'ETL para reportes de clientes',
    desc: 'Automatización completa de la generación de reportes mensuales: extracción de 6 fuentes, transformación con dbt y envío personalizado por cliente.',
    metrics: [
      { type: 'down', label: '2 días → 15 min' },
      { type: 'up', label: '0 errores manuales' },
    ],
  },
];

function MetricBadge({ metric }) {
  const isUp = metric.type === 'up';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.78rem', fontWeight: 700,
      color: '#68d391',
      background: 'rgba(104,211,145,0.1)', border: '1px solid rgba(104,211,145,0.2)',
      borderRadius: 100, padding: '4px 12px',
    }}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {metric.label}
    </span>
  );
}

export default function Cases() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="casos" style={{ padding: '96px 0', background: 'var(--bg-dark)' }}>
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
          }}>Casos de uso</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15 }}>
            Resultados reales para{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>equipos reales</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {cases.map((c, i) => {
            const cardRef = useRef(null);
            const cardInView = useInView(cardRef, { once: true, margin: '-40px' });
            return (
              <motion.div
                key={c.title}
                ref={cardRef}
                initial={{ opacity: 0, y: 40 }}
                animate={cardInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, borderColor: 'rgba(99,179,237,0.22)' }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px',
                  display: 'flex', flexDirection: 'column', gap: 0,
                  transition: 'border-color 0.2s',
                }}
              >
                <span style={{
                  display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: c.tagColor,
                  background: `${c.tagColor}18`,
                  border: `1px solid ${c.tagColor}28`,
                  borderRadius: 100, padding: '3px 12px', marginBottom: 16,
                  alignSelf: 'flex-start',
                }}>
                  {c.tag}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{c.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 24, flex: 1, lineHeight: 1.65 }}>{c.desc}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {c.metrics.map(m => <MetricBadge key={m.label} metric={m} />)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
