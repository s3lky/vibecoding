import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap, Brain, RefreshCw, Archive, Link2, BarChart2 } from 'lucide-react';

const services = [
  {
    icon: <Zap size={28} />,
    color: 'var(--accent)',
    colorRgb: '96,165,250',
    title: 'Automatización con n8n',
    tagline: 'Workflows visuales, sin vendor lock-in',
    description: `n8n es la herramienta más flexible del mercado para automatización de procesos. A diferencia de Zapier o Make, permite despliegues self-hosted, código personalizado y flujos complejos con lógica condicional, bucles y manejo de errores robusto.

Diseño flujos que conectan tus sistemas, validan datos en cada paso y alertan cuando algo falla — todo sin depender de proveedores cloud caros.`,
    deliverables: [
      'Diseño y documentación del flujo',
      'Implementación en n8n (cloud o self-hosted)',
      'Tests de integración por nodo',
      'Sistema de alertas y reintentos',
      'Monitoreo con métricas clave',
      'Handover y formación al equipo',
    ],
    useCases: ['Sincronización entre CRM y ERP', 'Procesado de formularios y webhooks', 'Generación automática de reportes', 'Notificaciones y alertas por eventos'],
  },
  {
    icon: <Brain size={28} />,
    color: 'var(--accent2)',
    colorRgb: '129,140,248',
    title: 'Calidad de Datos con IA',
    tagline: 'Datos limpios, confiables y auditables',
    description: `La mayoría de los problemas de analítica son problemas de calidad de datos. Usando LLMs (OpenAI, Claude) y técnicas de ML clásico, construyo sistemas que detectan automáticamente anomalías, normalizan formatos inconsistentes y enriquecen registros incompletos.

El resultado: un flujo de datos que llega limpio al destino, con trazabilidad de cada transformación.`,
    deliverables: [
      'Perfilado inicial de calidad de datos',
      'Reglas de validación por campo y entidad',
      'Detección de duplicados con fuzzy matching',
      'Normalización semántica con LLMs',
      'Scoring de calidad por registro',
      'Dashboard de salud de datos',
    ],
    useCases: ['Limpieza de bases de datos de clientes', 'Normalización de catálogos de producto', 'Validación de datos de formularios', 'Enriquecimiento de registros con fuentes externas'],
  },
  {
    icon: <RefreshCw size={28} />,
    color: '#34d399',
    colorRgb: '52,211,153',
    title: 'Pipelines ETL/ELT',
    tagline: 'Desde la fuente hasta el destino con trazabilidad total',
    description: `Un pipeline bien construido es la columna vertebral de cualquier operación data-driven. Diseño arquitecturas ETL y ELT que escalan con tu negocio: desde scripts simples en Python hasta pipelines orquestados con Airflow y transformaciones declarativas en dbt.

Cada pipeline incluye linaje de datos, manejo de errores, reintentos y documentación del flujo.`,
    deliverables: [
      'Diseño de arquitectura del pipeline',
      'Conectores para APIs, DBs y archivos',
      'Transformaciones con dbt o Python',
      'Carga incremental o full-refresh',
      'Linaje y auditoría de datos',
      'Monitoreo de latencia y freshness',
    ],
    useCases: ['Consolidación de datos de múltiples fuentes', 'Alimentación de data warehouses', 'Reportes automáticos para clientes', 'Migración de datos entre sistemas'],
  },
  {
    icon: <Archive size={28} />,
    color: 'var(--orange)',
    colorRgb: '251,146,60',
    title: 'Curado de Datos',
    tagline: 'Un catálogo limpio es un activo de negocio',
    description: `El curado de datos va más allá de la limpieza puntual. Es el proceso de definir, documentar y mantener los datos como un activo estratégico. Implemento data contracts, catálogos de metadatos y procesos de gobernanza que tu equipo puede mantener sin mi intervención.`,
    deliverables: [
      'Diseño del Data Catalog',
      'Definición de data contracts por dominio',
      'Reglas de negocio codificadas y testeadas',
      'Glosario de términos del negocio',
      'Proceso de revisión periódica',
      'Reportes automáticos de data health',
    ],
    useCases: ['Preparación para analítica avanzada', 'Cumplimiento de GDPR y auditorías', 'Onboarding de nuevos sistemas de datos', 'Mejora de la confianza en los dashboards'],
  },
  {
    icon: <Link2 size={28} />,
    color: 'var(--red)',
    colorRgb: '248,113,113',
    title: 'Integraciones & APIs',
    tagline: 'Sistemas conectados, datos consistentes',
    description: `Cada empresa acumula con el tiempo un ecosistema de herramientas que no se hablan entre sí. Diseño y construyo las capas de integración que hacen que tus sistemas compartan datos de forma fiable, con transformación de formatos, autenticación segura y manejo de errores.`,
    deliverables: [
      'Mapeo de sistemas y flujos actuales',
      'Desarrollo de conectores REST/GraphQL',
      'Autenticación OAuth2 y API keys',
      'Transformación de formatos (JSON, CSV, XML)',
      'Rate limiting y cola de reintentos',
      'Documentación de cada integración',
    ],
    useCases: ['Integración CRM ↔ ERP', 'Conexión con plataformas de ecommerce', 'Webhooks en tiempo real', 'Sincronización bidireccional de datos'],
  },
  {
    icon: <BarChart2 size={28} />,
    color: 'var(--yellow)',
    colorRgb: '250,204,21',
    title: 'Observabilidad & Reporting',
    tagline: 'Si no lo mides, no existe',
    description: `Un pipeline sin monitoreo es una caja negra. Construyo sistemas de observabilidad que miden la salud de tus datos en tiempo real: completitud, freshness, volumen, latencia y calidad. Cuando algo falla, el equipo lo sabe antes que los usuarios.`,
    deliverables: [
      'Definición de KPIs de calidad de datos',
      'Dashboard en Grafana o Metabase',
      'Alertas por Slack, email o webhook',
      'Métricas de completitud y freshness',
      'SLA de datos automatizado',
      'Logs de auditoría consultables',
    ],
    useCases: ['Monitoreo de pipelines en producción', 'Reportes de estado para stakeholders', 'Detección temprana de anomalías', 'SLA de datos hacia clientes internos'],
  },
];

export default function ServicesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px' }}>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 40, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = ''}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ maxWidth: 680, marginBottom: 72 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Catálogo de servicios</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.12, marginBottom: 16 }}>
            Servicios de automatización{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>en detalle</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Cada servicio está diseñado para resolver un problema específico. Aquí el alcance completo de lo que entrego.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
              }}
              className="service-detail"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `rgba(${s.colorRgb},0.1)`, border: `1px solid rgba(${s.colorRgb},0.2)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color,
                  }}>{s.icon}</div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.title}</h2>
                    <p style={{ fontSize: '0.8rem', color: s.color, marginTop: 2 }}>{s.tagline}</p>
                  </div>
                </div>
                {s.description.split('\n\n').map((para, j) => (
                  <p key={j} style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: 12 }}>{para}</p>
                ))}
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Casos de uso frecuentes</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {s.useCases.map(u => (
                      <span key={u} style={{
                        fontSize: '0.78rem', padding: '4px 12px', borderRadius: 100,
                        background: `rgba(${s.colorRgb},0.07)`, border: `1px solid rgba(${s.colorRgb},0.18)`,
                        color: s.color,
                      }}>{u}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Qué incluye</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {s.deliverables.map(d => (
                    <div key={d} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.875rem', color: 'var(--text)',
                    }}>
                      <Check size={14} color={s.color} strokeWidth={3} style={{ flexShrink: 0, marginTop: 2 }} />
                      {d}
                    </div>
                  ))}
                </div>
                <a href="/#contacto" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 28,
                  padding: '12px 24px', borderRadius: 'var(--radius)',
                  background: `rgba(${s.colorRgb},0.1)`, border: `1px solid rgba(${s.colorRgb},0.25)`,
                  color: s.color, fontWeight: 700, fontSize: '0.875rem',
                  transition: 'all 0.2s',
                }}>
                  Solicitar este servicio →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 780px) { .service-detail { grid-template-columns: 1fr !important; gap: 32px !important; } }`}</style>
    </div>
  );
}
