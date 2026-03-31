import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Mail, Clock, Globe, CheckCircle, Calendar, ArrowRight } from 'lucide-react';

const services = [
  'Automatización con n8n',
  'Calidad de Datos con IA',
  'Pipelines ETL/ELT',
  'Curado de Datos',
  'Integraciones & APIs',
  'Observabilidad & Reporting',
  'Diagnóstico general',
];

const budgets = [
  'Menos de 1.000€',
  '1.000€ – 3.500€',
  '3.500€ – 8.000€',
  'Más de 8.000€',
  'Aún no lo sé',
];

const nextSteps = [
  { num: '01', title: 'Respuesta en 24h', desc: 'Te escribo con un análisis inicial gratuito.' },
  { num: '02', title: 'Llamada de diagnóstico', desc: '30 minutos, sin compromiso. No es una llamada de ventas.' },
  { num: '03', title: 'Propuesta técnica', desc: 'Alcance, plazos y precio cerrado en 3 días.' },
];

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const base = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontFamily: 'var(--font)',
  fontSize: '0.875rem',
  padding: '11px 14px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s, background 0.2s',
};

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);

  const fieldStyle = (name) => ({
    ...base,
    ...(focused === name ? { borderColor: 'rgba(96,165,250,0.45)', background: 'rgba(96,165,250,0.04)' } : {}),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); e.target.reset(); }, 5000);
  };

  return (
    <section id="contacto" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? {} : {}}
          style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 72px' }}
          ref={ref}
        >
          <span style={{
            display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Contacto</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 14 }}>
            ¿Tienes datos que{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>automatizar?</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7 }}>
            En menos de 24h te respondo con un análisis inicial gratuito y los próximos pasos concretos.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 64, alignItems: 'start' }} className="contact-grid">

          {/* LEFT — info + próximos pasos */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Qué pasa después */}
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                Qué pasa después de escribir
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {nextSteps.map((step, i) => (
                  <div key={step.num} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                    {i < nextSteps.length - 1 && (
                      <div style={{ position: 'absolute', left: 18, top: 36, width: 1, height: 'calc(100% + 4px)', background: 'rgba(96,165,250,0.12)' }} />
                    )}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)',
                    }}>{step.num}</div>
                    <div style={{ paddingBottom: 20 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{step.title}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.55 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacto directo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {[
                { icon: <Mail size={15} />, text: 'hola@serenia.io' },
                { icon: <Clock size={15} />, text: 'Respuesta media: menos de 4h en horario laboral' },
                { icon: <Globe size={15} />, text: 'Remoto · España · LATAM' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--muted)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Calendly alternativa */}
            <div style={{
              background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)',
              borderRadius: 'var(--radius)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
            }}>
              <Calendar size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 2 }}>¿Prefieres agendar directamente?</p>
                <a href="#" style={{ fontSize: '0.78rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Reservar llamada de diagnóstico gratis <ArrowRight size={11} />
                </a>
              </div>
            </div>

            {/* Self-qualification note */}
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.65, borderLeft: '2px solid rgba(96,165,250,0.3)', paddingLeft: 12, fontStyle: 'italic' }}>
              "Trabajo mejor con empresas que ya tienen datos pero no tienen tiempo ni equipo para gestionarlos."
            </p>
          </motion.div>

          {/* RIGHT — formulario */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-lg)', padding: '36px',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-row">
                <Field label="Nombre">
                  <input type="text" name="nombre" placeholder="Tu nombre" required style={fieldStyle('nombre')}
                    onFocus={() => setFocused('nombre')} onBlur={() => setFocused(null)} />
                </Field>
                <Field label="Empresa">
                  <input type="text" name="empresa" placeholder="Tu empresa" required style={fieldStyle('empresa')}
                    onFocus={() => setFocused('empresa')} onBlur={() => setFocused(null)} />
                </Field>
              </div>

              <Field label="Email profesional">
                <input type="email" name="email" placeholder="tu@empresa.com" required style={fieldStyle('email')}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
              </Field>

              <Field label="¿Qué proceso quieres automatizar primero?">
                <select name="servicio" style={{ ...fieldStyle('servicio'), cursor: 'pointer' }}
                  onFocus={() => setFocused('servicio')} onBlur={() => setFocused(null)}>
                  <option value="">Selecciona una prioridad...</option>
                  {services.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Herramientas que usas ahora">
                <input type="text" name="herramientas" placeholder="CRM, ERP, base de datos, hojas de cálculo..."
                  style={fieldStyle('herramientas')}
                  onFocus={() => setFocused('herramientas')} onBlur={() => setFocused(null)} />
              </Field>

              <Field label="Presupuesto estimado">
                <select name="presupuesto" style={{ ...fieldStyle('presupuesto'), cursor: 'pointer' }}
                  onFocus={() => setFocused('presupuesto')} onBlur={() => setFocused(null)}>
                  <option value="">¿Tienes un rango en mente?</option>
                  {budgets.map(b => <option key={b}>{b}</option>)}
                </select>
              </Field>

              <Field label="Cuéntame tu situación actual">
                <textarea name="mensaje" rows={3} required
                  placeholder="¿Cuántas horas a la semana pierdes en procesos manuales de datos? ¿Cuál es el mayor dolor?"
                  style={{ ...fieldStyle('mensaje'), resize: 'vertical', minHeight: 88 }}
                  onFocus={() => setFocused('mensaje')} onBlur={() => setFocused(null)} />
              </Field>

              <motion.button type="submit"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: 'var(--radius)',
                  background: sent
                    ? 'linear-gradient(135deg, #34d399, #059669)'
                    : 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  color: '#fff', fontWeight: 700, fontSize: '0.975rem', fontFamily: 'var(--font)',
                  cursor: 'pointer', transition: 'background 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 0 28px rgba(96,165,250,0.28)',
                }}>
                {sent
                  ? <><CheckCircle size={17} /> ¡Recibido! Te respondo en menos de 24h.</>
                  : 'Solicitar diagnóstico gratuito →'}
              </motion.button>

              <p style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>
                Sin spam · Sin permanencia · No es una llamada de ventas
              </p>
            </form>
          </motion.div>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
        @media (max-width: 520px) { .form-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
