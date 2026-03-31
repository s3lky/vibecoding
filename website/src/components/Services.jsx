import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Brain, RefreshCw, Archive, Link2, BarChart2, ArrowRight, Check } from 'lucide-react';

const services = [
  {
    icon: <Zap size={28} />,
    title: 'Automatización con n8n',
    desc: 'Workflows visuales que conectan tus herramientas, APIs y bases de datos. Sin código propietario, sin vendor lock-in.',
    features: ['Flujos complejos multi-step', 'Integraciones con +400 servicios', 'Deployment cloud o self-hosted', 'Monitoreo y alertas automáticas'],
    featured: true,
    color: 'var(--accent)',
  },
  {
    icon: <Brain size={28} />,
    title: 'Calidad de Datos con IA',
    desc: 'Modelos de lenguaje y ML para detectar anomalías, normalizar registros y enriquecer datos en tiempo real.',
    features: ['Detección de duplicados y outliers', 'Normalización semántica con LLMs', 'Validación de esquemas automática', 'Scoring de calidad por campo'],
    color: 'var(--accent2)',
  },
  {
    icon: <RefreshCw size={28} />,
    title: 'Pipelines ETL/ELT',
    desc: 'Arquitecturas de datos robustas que mueven, transforman y cargan información con trazabilidad total.',
    features: ['Ingesta desde APIs, DBs, archivos', 'Transformaciones declarativas', 'Carga incremental o full-refresh', 'Linaje y auditoría de datos'],
    color: 'var(--green)',
  },
  {
    icon: <Archive size={28} />,
    title: 'Curado de Datos',
    desc: 'Estrategias y procesos para mantener un catálogo limpio, documentado y listo para analítica.',
    features: ['Diseño de Data Catalog', 'Definición de data contracts', 'Reglas de negocio codificadas', 'Reportes de data health'],
    color: 'var(--orange)',
  },
  {
    icon: <Link2 size={28} />,
    title: 'Integraciones & APIs',
    desc: 'Conexión de sistemas heterogéneos: CRMs, ERPs, plataformas cloud, bases de datos relacionales y NoSQL.',
    features: ['Webhooks y event-driven flows', 'Transformación JSON/CSV/XML', 'Rate limiting y manejo de errores', 'Documentación de integraciones'],
    color: 'var(--red)',
  },
  {
    icon: <BarChart2 size={28} />,
    title: 'Observabilidad & Reporting',
    desc: 'Dashboards en tiempo real del estado de tus pipelines y KPIs de calidad para tomar decisiones con confianza.',
    features: ['Métricas de completitud y freshness', 'Alertas por Slack, email o webhook', 'Dashboards en Grafana o Metabase', 'SLA de datos automatizado'],
    color: 'var(--yellow)',
  },
];

function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: service.featured
          ? `linear-gradient(135deg, rgba(99,179,237,0.07) 0%, rgba(159,122,234,0.07) 100%)`
          : 'var(--bg-card)',
        border: `1px solid ${service.featured ? 'rgba(99,179,237,0.25)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        display: 'flex', flexDirection: 'column',
        cursor: 'default',
        transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
      }}
      whileHover={{
        y: -6,
        boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${service.color}22`,
        borderColor: `${service.color}44`,
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${service.color}15`,
        border: `1px solid ${service.color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: service.color, marginBottom: 20,
      }}>
        {service.icon}
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{service.title}</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 20, flex: 1 }}>{service.desc}</p>

      <ul style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {service.features.map(f => (
          <li key={f} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: '0.82rem', color: 'var(--muted)',
            padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <Check size={13} color={service.color} strokeWidth={3} style={{ flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>

      <a href="#contacto" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: service.color, fontSize: '0.875rem', fontWeight: 600,
        transition: 'gap 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.gap = '10px'}
        onMouseLeave={e => e.currentTarget.style.gap = '6px'}>
        Empezar <ArrowRight size={14} />
      </a>
    </motion.div>
  );
}

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="servicios" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 64px' }}
        >
          <span style={{
            display: 'inline-block', background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Servicios</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            Todo lo que necesitas para{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>datos de calidad</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem' }}>
            Desde la ingesta hasta el reporte, cubro cada etapa del ciclo de vida del dato.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {services.map((s, i) => <ServiceCard key={s.title} service={s} index={i} />)}
        </div>
      </div>
    </section>
  );
}
