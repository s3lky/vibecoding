import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Check, Zap, Star, Building2, ArrowRight } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    icon: <Zap size={20} />,
    name: 'Starter',
    tagline: 'Para empezar a automatizar',
    price: '1.200',
    unit: '/ proyecto',
    color: 'var(--accent)',
    colorRgb: '96,165,250',
    features: [
      'Hasta 3 workflows en n8n',
      'Integración de hasta 5 fuentes',
      'Validaciones básicas de calidad',
      'Documentación técnica incluida',
      'Soporte por email 30 días',
      '1 revisión post-entrega',
    ],
    cta: 'Empezar',
    featured: false,
  },
  {
    id: 'pro',
    icon: <Star size={20} />,
    name: 'Professional',
    tagline: 'El más elegido por equipos de datos',
    price: '3.500',
    unit: '/ proyecto',
    color: 'var(--accent2)',
    colorRgb: '129,140,248',
    features: [
      'Workflows ilimitados en n8n',
      'Integraciones sin límite de fuentes',
      'Calidad de datos con IA (LLMs)',
      'Pipeline ETL/ELT completo',
      'Dashboard de observabilidad',
      'Documentación + formación al equipo',
      'Soporte prioritario 60 días',
      '3 revisiones post-entrega',
    ],
    cta: 'Más popular',
    featured: true,
  },
  {
    id: 'enterprise',
    icon: <Building2 size={20} />,
    name: 'Enterprise',
    tagline: 'Para proyectos de largo alcance',
    price: 'A medida',
    unit: '',
    color: '#34d399',
    colorRgb: '52,211,153',
    features: [
      'Todo lo del plan Professional',
      'Arquitectura de datos completa',
      'Equipo dedicado de ingeniería',
      'Integraciones con sistemas legacy',
      'SLA de datos garantizado',
      'Soporte continuo con SLA',
      'Consultoría estratégica mensual',
      'Auditorías de calidad periódicas',
    ],
    cta: 'Contactar',
    featured: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="planes" style={{ padding: '96px 0' }}>
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
          }}>Planes</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            Transparencia total en{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>precios y alcance</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>
            Sin sorpresas. Cada plan tiene un alcance claro. Si tu proyecto es especial, lo hablamos.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }} className="pricing-grid">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: plan.featured
                  ? `linear-gradient(180deg, rgba(${plan.colorRgb},0.08) 0%, var(--bg-card) 40%)`
                  : 'var(--bg-card)',
                border: `1px solid ${plan.featured ? `rgba(${plan.colorRgb},0.35)` : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '32px 28px',
                position: 'relative',
                boxShadow: plan.featured ? `0 0 60px rgba(${plan.colorRgb},0.12)` : 'none',
              }}
            >
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: `linear-gradient(135deg, var(--accent), var(--accent2))`,
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', padding: '4px 16px', borderRadius: 100,
                  whiteSpace: 'nowrap',
                }}>
                  Más popular
                </div>
              )}

              {/* Plan header */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `rgba(${plan.colorRgb},0.1)`,
                border: `1px solid rgba(${plan.colorRgb},0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: plan.color, marginBottom: 16,
              }}>
                {plan.icon}
              </div>

              <div style={{ marginBottom: 4, fontSize: '1.1rem', fontWeight: 800 }}>{plan.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 24 }}>{plan.tagline}</div>

              <div style={{ marginBottom: 28 }}>
                <span style={{
                  fontSize: plan.unit ? '2.4rem' : '1.8rem',
                  fontWeight: 900, lineHeight: 1,
                  color: plan.unit ? 'var(--text)' : plan.color,
                }}>
                  {plan.price}
                </span>
                {plan.unit && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: 4 }}>€ {plan.unit}</span>
                )}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.83rem', color: 'var(--muted)',
                  }}>
                    <Check size={13} color={plan.color} strokeWidth={3} style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </div>
                ))}
              </div>

              <motion.a
                href="#contacto"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '13px',
                  background: plan.featured
                    ? `linear-gradient(135deg, var(--accent), var(--accent2))`
                    : `rgba(${plan.colorRgb},0.08)`,
                  border: `1px solid rgba(${plan.colorRgb},0.25)`,
                  color: plan.featured ? '#fff' : plan.color,
                  borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer', textDecoration: 'none',
                  boxShadow: plan.featured ? `0 0 24px rgba(${plan.colorRgb},0.3)` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {plan.cta} <ArrowRight size={15} />
              </motion.a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem', marginTop: 28 }}
        >
          Todos los precios son orientativos. El presupuesto final depende del alcance específico. Diagnóstico inicial gratuito.
        </motion.p>
      </div>

      <style>{`@media (max-width: 860px) { .pricing-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; } }`}</style>
    </section>
  );
}
