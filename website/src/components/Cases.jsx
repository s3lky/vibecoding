import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const cases = [
  {
    tag: 'E-commerce',
    tagColor: '#9f7aea',
    problem: 'Overselling constante por stock desincronizado entre 4 canales',
    title: 'Inventario multi-canal en tiempo real',
    solution: 'Pipeline n8n que unifica stock de 4 marketplaces, detecta inconsistencias con IA y actualiza el ERP cada 5 minutos.',
    metrics: [{ val: '−94%', label: 'errores de stock' }, { val: '+3h/día', label: 'recuperadas' }],
  },
  {
    tag: 'Fintech',
    tagColor: '#63b3ed',
    problem: 'Analistas perdían 2 días/semana revisando transacciones manualmente',
    title: 'Validación automática de transacciones',
    solution: 'LLMs clasifican y verifican transacciones bancarias en tiempo real, con detección de duplicados y scoring de confianza por registro.',
    metrics: [{ val: '99.2%', label: 'precisión' }, { val: '−80%', label: 'revisión manual' }],
  },
  {
    tag: 'SaaS B2B',
    tagColor: '#f97316',
    problem: 'Reportes mensuales para 40 clientes tomaban 2 días y salían con errores',
    title: 'Reporting automático multi-cliente',
    solution: 'Extracción de 6 fuentes con dbt, transformación y envío personalizado por cliente cada mes de forma totalmente autónoma.',
    metrics: [{ val: '2d → 15m', label: 'tiempo de entrega' }, { val: '0', label: 'errores manuales' }],
  },
  {
    tag: 'Logística',
    tagColor: '#34d399',
    problem: 'Datos de seguimiento de envíos llegaban duplicados y con formatos inconsistentes',
    title: 'Curado de datos de tracking',
    solution: 'Pipeline de deduplicación y normalización semántica que estandariza registros de 3 operadores logísticos distintos antes de cargar al data warehouse.',
    metrics: [{ val: '−97%', label: 'registros duplicados' }, { val: '1 semana', label: 'implantación' }],
  },
  {
    tag: 'Salud',
    tagColor: '#f472b6',
    problem: 'CRM de pacientes y sistema de citas no intercambiaban datos, todo era copia manual',
    title: 'Integración CRM ↔ sistema de citas',
    solution: 'Sincronización bidireccional vía webhook entre plataformas heterogéneas, con validación de datos antes de cada escritura y alerta de anomalías.',
    metrics: [{ val: '0h', label: 'trabajo manual/semana' }, { val: '< 30s', label: 'latencia de sync' }],
  },
  {
    tag: 'Retail',
    tagColor: '#fbbf24',
    problem: 'Nadie sabía si los dashboards de ventas reflejaban la realidad',
    title: 'Observabilidad del data warehouse',
    solution: 'Sistema de monitoreo con métricas de freshness, completitud y volumen. Alertas a Slack cuando algo se desvía del rango esperado, antes de que llegue al negocio.',
    metrics: [{ val: '< 5min', label: 'detección de anomalías' }, { val: '100%', label: 'confianza en dashboards' }],
  },
];

function CaseCard({ c, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, borderColor: `${c.tagColor}28` }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Tag */}
      <span style={{
        display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: c.tagColor, background: `${c.tagColor}14`,
        border: `1px solid ${c.tagColor}24`,
        borderRadius: 100, padding: '3px 10px', marginBottom: 14,
        alignSelf: 'flex-start',
      }}>{c.tag}</span>

      {/* Problema */}
      <div style={{
        background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)',
        borderRadius: 8, padding: '8px 12px', marginBottom: 14,
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span style={{ color: '#f87171', fontSize: '0.75rem', flexShrink: 0, marginTop: 1 }}>●</span>
        <p style={{ fontSize: '0.78rem', color: '#f87171', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{c.problem}</p>
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.35 }}>{c.title}</h3>
      <p style={{ fontSize: '0.845rem', color: 'var(--muted)', marginBottom: 20, flex: 1, lineHeight: 1.65 }}>{c.solution}</p>

      {/* Métricas resultado */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {c.metrics.map(m => (
          <div key={m.label} style={{
            background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)',
            borderRadius: 8, padding: '8px 12px',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{m.val}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 3 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <a href="#contacto" style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        color: c.tagColor, fontSize: '0.8rem', fontWeight: 600,
        transition: 'gap 0.2s', alignSelf: 'flex-start',
      }}
        onMouseEnter={e => e.currentTarget.style.gap = '9px'}
        onMouseLeave={e => e.currentTarget.style.gap = '5px'}>
        Quiero algo así <ArrowRight size={13} />
      </a>
    </motion.div>
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
            display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Casos de uso</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 14 }}>
            Del problema al resultado.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>En semanas, no meses.</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>
            Proyectos reales. Cada tarjeta muestra el dolor de partida, la solución y los números al final.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 18 }}>
          {cases.map((c, i) => <CaseCard key={c.title} c={c} i={i} />)}
        </div>

      </div>
    </section>
  );
}
