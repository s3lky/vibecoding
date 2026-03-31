import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Calendar } from 'lucide-react';

export default function CtaBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section style={{
      background: 'linear-gradient(135deg, rgba(99,179,237,0.08) 0%, rgba(159,122,234,0.08) 100%)',
      borderTop: '1px solid rgba(99,179,237,0.15)',
      borderBottom: '1px solid rgba(99,179,237,0.15)',
      padding: '72px 0',
    }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: 1160, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 40, flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, marginBottom: 10 }}>
            ¿Tus datos trabajan para ti?
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: 500, lineHeight: 1.65 }}>
            Agenda una llamada de diagnóstico gratuita de 30 minutos y descubramos
            cómo automatizar tus procesos de datos.
          </p>
        </div>
        <motion.a
          href="#contacto"
          whileHover={{ scale: 1.04, boxShadow: '0 0 48px rgba(99,179,237,0.5)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#fff', padding: '16px 32px', borderRadius: 'var(--radius)',
            fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap',
            boxShadow: '0 0 32px rgba(99,179,237,0.3)',
            textDecoration: 'none',
          }}
        >
          <Calendar size={18} />
          Agenda tu llamada gratis →
        </motion.a>
      </motion.div>
    </section>
  );
}
