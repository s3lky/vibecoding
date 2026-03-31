import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Check, Zap, Star, Building2, ArrowRight, Plus } from 'lucide-react';

const plans = {
  proyecto: [
    {
      id: 'starter',
      icon: <Zap size={20} />,
      name: 'Esencial',
      tagline: 'Para probar la automatización sin riesgo',
      price: '1.200',
      priceAlt: '1.000',
      unit: '€ / proyecto',
      colorVar: 'var(--accent)',
      colorRgb: '96,165,250',
      features: [
        'Hasta 3 workflows en n8n',
        'Integración de hasta 5 fuentes',
        'Validaciones básicas de calidad',
        'Documentación técnica incluida',
        'Código en repositorio privado',
        'Soporte por email 30 días',
        '1 revisión post-entrega',
      ],
      cta: 'Empezar',
      featured: false,
    },
    {
      id: 'pro',
      icon: <Star size={20} />,
      name: 'Profesional',
      tagline: 'El que eligen la mayoría de equipos B2B',
      price: '3.500',
      priceAlt: '2.900',
      unit: '€ / proyecto',
      colorVar: 'var(--accent2)',
      colorRgb: '129,140,248',
      features: [
        'Todo lo del plan Esencial, más:',
        'Workflows ilimitados en n8n',
        'Calidad de datos con IA / LLMs',
        'Pipeline ETL/ELT completo con dbt',
        'Dashboard de observabilidad',
        'Formación al equipo incluida',
        'Soporte prioritario 60 días',
        '3 revisiones post-entrega',
      ],
      cta: 'Comenzar — sin permanencia',
      featured: true,
    },
    {
      id: 'enterprise',
      icon: <Building2 size={20} />,
      name: 'Enterprise',
      tagline: 'Para infraestructura de datos crítica',
      price: 'A medida',
      priceAlt: null,
      unit: '',
      colorVar: '#34d399',
      colorRgb: '52,211,153',
      features: [
        'Todo lo del plan Profesional, más:',
        'Arquitectura de datos completa',
        'Self-hosted, sin vendor lock-in',
        'Integraciones con sistemas legacy',
        'SLA de datos garantizado',
        'Soporte continuo con SLA',
        'Consultoría estratégica mensual',
        'Auditorías de calidad periódicas',
      ],
      cta: 'Agendar llamada técnica',
      featured: false,
    },
  ],
};

const faqItems = [
  { q: '¿El precio es fijo o puede variar?', a: 'Son precios orientativos. El precio final depende del alcance concreto, siempre cerrado antes de empezar. Sin sorpresas.' },
  { q: '¿Cuánto tarda la entrega?', a: 'El plan Esencial se entrega en 1–2 semanas. El Profesional en 3–5 semanas. Siempre hay entregables parciales desde la primera semana.' },
  { q: '¿Qué pasa si mis necesidades cambian durante el proyecto?', a: 'Si el alcance cambia, lo hablamos antes de ejecutar. Nunca trabajo en extras sin acordarlos previamente.' },
  { q: '¿Incluye soporte una vez entregado?', a: 'Sí. Todos los planes incluyen período de soporte post-entrega. Para soporte continuo hay contratos de mantenimiento mensual.' },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0', background: 'none', border: 'none', color: 'var(--text)',
        fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', gap: 16, fontFamily: 'var(--font)',
      }}>
        {item.q}
        <motion.span animate={{ rotate: open ? 45 : 0 }} style={{ color: 'var(--muted)', flexShrink: 0 }}>
          <Plus size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.83rem', color: 'var(--muted)', paddingBottom: 14, lineHeight: 1.7 }}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [annual, setAnnual] = useState(false);

  return (
    <section id="planes" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>

        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 16px' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Planes</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 14 }}>
            Transparencia total.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Sin sorpresas.</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: 28 }}>
            Cada plan tiene un alcance claro. Precios cerrados antes de empezar, siempre.
          </p>
        </motion.div>

        {/* Toggle anual/puntual */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 52 }}>
          <span style={{ fontSize: '0.875rem', color: annual ? 'var(--muted)' : 'var(--text)', fontWeight: annual ? 400 : 600 }}>Proyecto único</span>
          <button onClick={() => setAnnual(a => !a)} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: annual ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.3s',
          }}>
            <motion.div animate={{ x: annual ? 24 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff' }} />
          </button>
          <span style={{ fontSize: '0.875rem', color: annual ? 'var(--text)' : 'var(--muted)', fontWeight: annual ? 600 : 400 }}>
            Retainer mensual
            {annual && <span style={{
              marginLeft: 8, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100,
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399',
            }}>Ahorra ~17%</span>}
          </span>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }} className="pricing-grid">
          {plans.proyecto.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: plan.featured
                  ? `linear-gradient(180deg, rgba(${plan.colorRgb},0.09) 0%, var(--bg-card) 45%)`
                  : 'var(--bg-card)',
                border: `1px solid ${plan.featured ? `rgba(${plan.colorRgb},0.35)` : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 'var(--radius-lg)', padding: '32px 28px', position: 'relative',
                boxShadow: plan.featured ? `0 0 60px rgba(${plan.colorRgb},0.1)` : 'none',
              }}
            >
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  color: '#fff', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
                  textTransform: 'uppercase', padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap',
                }}>Más popular</div>
              )}

              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `rgba(${plan.colorRgb},0.1)`, border: `1px solid rgba(${plan.colorRgb},0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: plan.colorVar, marginBottom: 16,
              }}>{plan.icon}</div>

              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 24, lineHeight: 1.45 }}>{plan.tagline}</div>

              <div style={{ marginBottom: 28 }}>
                <AnimatePresence mode="wait">
                  <motion.span key={annual ? 'alt' : 'main'}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'block',
                      fontSize: plan.unit ? '2.2rem' : '1.6rem', fontWeight: 900, lineHeight: 1,
                      color: plan.unit ? 'var(--text)' : plan.colorVar,
                    }}>
                    {annual && plan.priceAlt ? plan.priceAlt : plan.price}
                  </motion.span>
                </AnimatePresence>
                {plan.unit && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {annual && plan.priceAlt ? '€ / mes' : plan.unit}
                  </span>
                )}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 22, marginBottom: 26 }}>
                {plan.features.map(f => (
                  <div key={f} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 9, padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.82rem', color: f.startsWith('Todo lo') ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: f.startsWith('Todo lo') ? 600 : 400,
                  }}>
                    <Check size={12} color={plan.colorVar} strokeWidth={3} style={{ flexShrink: 0, marginTop: 3 }} />
                    {f}
                  </div>
                ))}
              </div>

              <motion.a href="#contacto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  width: '100%', padding: '12px',
                  background: plan.featured
                    ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                    : `rgba(${plan.colorRgb},0.09)`,
                  border: `1px solid rgba(${plan.colorRgb},0.25)`,
                  color: plan.featured ? '#fff' : plan.colorVar,
                  borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.875rem',
                  cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s',
                  boxShadow: plan.featured ? `0 0 24px rgba(${plan.colorRgb},0.28)` : 'none',
                }}>
                {plan.cta} <ArrowRight size={14} />
              </motion.a>
            </motion.div>
          ))}
        </div>

        {/* Trust note */}
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', marginTop: 20 }}>
          Precios orientativos en €. Diagnóstico inicial gratuito. Sin permanencia. Sin sorpresas.
        </motion.p>

        {/* FAQ mini */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.35, duration: 0.6 }}
          style={{ maxWidth: 680, margin: '64px auto 0' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, textAlign: 'center' }}>
            Preguntas sobre los planes
          </p>
          {faqItems.map(item => <FaqItem key={item.q} item={item} />)}
        </motion.div>

      </div>
      <style>{`@media (max-width: 860px) { .pricing-grid { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto; } }`}</style>
    </section>
  );
}
