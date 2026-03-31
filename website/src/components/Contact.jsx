import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Mail, Clock, Globe, CheckCircle } from 'lucide-react';

const services = [
  'Automatización con n8n',
  'Calidad de Datos con IA',
  'Pipelines ETL/ELT',
  'Curado de Datos',
  'Integraciones & APIs',
  'Observabilidad & Reporting',
  'Diagnóstico general',
];

function Input({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontFamily: 'var(--font)',
  fontSize: '0.9rem',
  padding: '12px 16px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s, background 0.2s',
};

const inputFocus = {
  borderColor: 'rgba(99,179,237,0.5)',
  background: 'rgba(99,179,237,0.04)',
};

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [sent, setSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    e.target.reset();
  };

  const getFieldStyle = (name) => ({
    ...inputStyle,
    ...(focusedField === name ? inputFocus : {}),
  });

  return (
    <section id="contacto" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 72, alignItems: 'start' }} className="contact-grid">

          {/* Info */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{
              display: 'inline-block', background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.2)',
              color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20,
            }}>Contacto</span>

            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
              Hablemos de{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>tu proyecto</span>
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 36, lineHeight: 1.7 }}>
              Cuéntame el reto que tienes con tus datos y diseñamos juntos la solución más eficiente y escalable.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
              {[
                { icon: <Mail size={16} />, text: 'hola@serenia.io' },
                { icon: <Clock size={16} />, text: 'Respuesta en menos de 24h' },
                { icon: <Globe size={16} />, text: 'Remoto · España · LATAM' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['n8n Certified', 'Data Quality Expert', 'AI Integrations'].map(tag => (
                <span key={tag} style={{
                  display: 'inline-block',
                  background: 'rgba(99,179,237,0.07)', border: '1px solid rgba(99,179,237,0.18)',
                  color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
                  fontSize: '0.75rem', fontWeight: 600,
                }}>{tag}</span>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-row">
                <Input label="Nombre">
                  <input type="text" name="nombre" placeholder="Tu nombre" required
                    style={getFieldStyle('nombre')}
                    onFocus={() => setFocusedField('nombre')}
                    onBlur={() => setFocusedField(null)} />
                </Input>
                <Input label="Empresa">
                  <input type="text" name="empresa" placeholder="Tu empresa"
                    style={getFieldStyle('empresa')}
                    onFocus={() => setFocusedField('empresa')}
                    onBlur={() => setFocusedField(null)} />
                </Input>
              </div>

              <Input label="Email">
                <input type="email" name="email" placeholder="tu@empresa.com" required
                  style={getFieldStyle('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)} />
              </Input>

              <Input label="Servicio de interés">
                <select name="servicio"
                  style={{ ...getFieldStyle('servicio'), cursor: 'pointer' }}
                  onFocus={() => setFocusedField('servicio')}
                  onBlur={() => setFocusedField(null)}>
                  <option value="">Selecciona un servicio...</option>
                  {services.map(s => <option key={s}>{s}</option>)}
                </select>
              </Input>

              <Input label="Cuéntame tu reto">
                <textarea name="mensaje" rows={4} required
                  placeholder="¿Cuál es el problema con tus datos? ¿Qué proceso quieres automatizar?"
                  style={{ ...getFieldStyle('mensaje'), resize: 'vertical', minHeight: 100 }}
                  onFocus={() => setFocusedField('mensaje')}
                  onBlur={() => setFocusedField(null)} />
              </Input>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '14px',
                  background: sent
                    ? 'linear-gradient(135deg, #68d391, #38a169)'
                    : 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  color: '#fff', border: 'none', borderRadius: 'var(--radius)',
                  fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font)',
                  cursor: 'pointer', transition: 'background 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {sent ? (
                  <><CheckCircle size={18} /> ¡Mensaje enviado! Te respondo pronto.</>
                ) : (
                  'Enviar mensaje →'
                )}
              </motion.button>

              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
                Sin spam. Solo una respuesta útil en menos de 24h.
              </p>
            </form>
          </motion.div>

        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
