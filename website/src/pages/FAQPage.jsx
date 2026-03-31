import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Plus } from 'lucide-react';

// ── Añade tus preguntas aquí ──────────────────────────────────────
const faqData = [
  {
    category: 'General',
    items: [
      {
        q: '¿Qué tipo de empresas se benefician más de estos servicios?',
        a: 'Empresas en crecimiento que acumulan datos en distintas herramientas (CRM, ERP, hojas de cálculo, APIs) y necesitan unificarlos y automatizar procesos manuales. El perfil más habitual son equipos de datos pequeños (1-5 personas) en empresas de 20-500 empleados, aunque también trabajamos con freelancers y startups desde etapas tempranas.',
      },
      {
        q: '¿Es necesario tener un equipo técnico para trabajar contigo?',
        a: 'No es un requisito. Puedo trabajar directamente con el negocio y entregar soluciones listas para usar. Dicho esto, si hay un equipo técnico, la transferencia de conocimiento y el mantenimiento posterior serán más sencillos.',
      },
      {
        q: '¿Cómo es el proceso para empezar?',
        a: 'Empezamos con una llamada de diagnóstico gratuita de 30 minutos donde entiendo tu situación actual y los objetivos. A partir de ahí preparo una propuesta con alcance, plazos y precio. Si hay acuerdo, empezamos con un sprint de diseño de una semana.',
      },
    ],
  },
  {
    category: 'n8n & Automatización',
    items: [
      {
        q: '¿Por qué n8n y no Zapier o Make?',
        a: 'n8n ofrece self-hosting (tus datos no salen de tu infraestructura), código personalizado en JavaScript/Python dentro de los flujos, sin límites artificiales de operaciones y una licencia open-source. Para uso empresarial serio, n8n es más robusto, flexible y a largo plazo más económico.',
      },
      {
        q: '¿Dónde se despliega n8n? ¿Necesito un servidor?',
        a: 'Depende de tus necesidades. Para simplicidad, n8n Cloud funciona perfectamente. Para datos sensibles o mayor control, lo desplegamos en tu propia infraestructura (VPS, Docker, Kubernetes). Me encargo de toda la configuración y el mantenimiento inicial.',
      },
      {
        q: '¿Qué pasa si algo falla en un workflow?',
        a: 'Los workflows que construyo incluyen manejo de errores explícito, sistema de reintentos con backoff y alertas por Slack o email. Además, cada ejecución queda registrada con logs consultables para diagnóstico rápido.',
      },
    ],
  },
  {
    category: 'Calidad de datos & ETL',
    items: [
      {
        q: '¿Cómo se detectan los errores en los datos?',
        a: 'Usando una combinación de reglas de validación explícitas (esquemas, rangos, formatos), métricas estadísticas (distribuciones, outliers) y, cuando tiene sentido, LLMs para validaciones semánticas que las reglas rígidas no pueden capturar.',
      },
      {
        q: '¿Cuánto tiempo tarda en construirse un pipeline ETL?',
        a: 'Un pipeline básico (una fuente, transformaciones simples, un destino) puede estar en producción en 1-2 semanas. Pipelines complejos con múltiples fuentes, lógica de negocio elaborada y observabilidad completa llevan 4-8 semanas. Siempre hay entregables parciales desde la primera semana.',
      },
      {
        q: '¿Funcionan los pipelines con datos en tiempo real?',
        a: 'Sí. Trabajo tanto con pipelines batch (ejecuciones programadas) como con flujos event-driven en tiempo real basados en webhooks o colas de mensajes (Kafka, Redis Streams). La elección depende de la latencia que requiera tu caso de uso.',
      },
    ],
  },
  {
    category: 'Precios & colaboración',
    items: [
      {
        q: '¿Los precios de los planes son fijos?',
        a: 'Son orientativos. El precio final depende del alcance específico de tu proyecto. Siempre presupuesto por proyecto cerrado (no por horas), lo que te da previsibilidad total. Si el alcance cambia durante el proyecto, lo hablamos antes de ejecutar.',
      },
      {
        q: '¿Hay soporte después de entregar el proyecto?',
        a: 'Sí. Todos los planes incluyen un período de soporte post-entrega (30-60 días según el plan). Para soporte continuo más allá de ese período, ofrezco contratos de mantenimiento mensual.',
      },
      {
        q: '¿Trabajas con clientes de fuera de España?',
        a: 'Por supuesto. Trabajo 100% en remoto con clientes en España y LATAM principalmente, aunque también con equipos en Europa. Los proyectos se gestionan en asincrónico con sesiones de sincronización semanales.',
      },
    ],
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isOpen ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        padding: '18px 20px', background: 'none', border: 'none', color: 'var(--text)',
        textAlign: 'left', cursor: 'pointer',
      }}>
        <span style={{ fontWeight: 600, fontSize: '0.925rem', lineHeight: 1.45, flex: 1 }}>{item.q}</span>
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, color: isOpen ? 'var(--accent)' : 'var(--muted)', marginTop: 2 }}>
          <Plus size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.75, marginTop: 14 }}>{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openItem, setOpenItem] = useState(null);

  const toggle = (key) => setOpenItem(prev => prev === key ? null : key);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 40 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = ''}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>FAQ</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: 12 }}>
            Preguntas{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>frecuentes</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>
            Todo lo que necesitas saber antes de empezar un proyecto.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {faqData.map(section => (
            <div key={section.category}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                {section.category}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  return (
                    <FAQItem key={key} item={item} isOpen={openItem === key} onToggle={() => toggle(key)} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{
            marginTop: 64, padding: '32px', borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(96,165,250,0.07), rgba(129,140,248,0.07))',
            border: '1px solid rgba(96,165,250,0.15)', textAlign: 'center',
          }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>¿No encuentras tu respuesta?</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 20 }}>
            Escríbenos directamente. Respondemos en menos de 24h.
          </p>
          <a href="/#contacto" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            boxShadow: '0 0 24px rgba(96,165,250,0.3)',
          }}>
            Contactar →
          </a>
        </motion.div>
      </div>
    </div>
  );
}
