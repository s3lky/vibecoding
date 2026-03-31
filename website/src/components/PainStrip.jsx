import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const pains = [
  { emoji: '⏱️', text: 'Tu equipo pierde horas pegando datos entre hojas de cálculo' },
  { emoji: '🔴', text: 'Los reportes llegan tarde o con errores que nadie detecta a tiempo' },
  { emoji: '🔀', text: 'Tienes 5 herramientas que no se hablan entre sí' },
  { emoji: '🧹', text: 'Limpiar los datos antes de analizarlos te lleva más tiempo que el análisis' },
  { emoji: '📉', text: 'No confías en tus propios dashboards porque los datos cambian solos' },
  { emoji: '🤷', text: 'Nadie sabe exactamente de dónde viene cada número en el informe' },
];

export default function PainStrip() {
  return (
    <section style={{ padding: '80px 0 0', position: 'relative' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 100, padding: '5px 16px', marginBottom: 20,
          }}>
            <AlertCircle size={13} color="#f87171" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ¿Te suena alguno de estos?
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>
            Los problemas que resolvemos{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>cada semana</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
            Si reconoces más de dos, probablemente podemos recuperarte entre 10 y 30 horas a la semana.
          </p>
        </motion.div>

        {/* Pain cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 48,
        }} className="pain-grid">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              style={{
                background: 'rgba(248,113,113,0.04)',
                border: '1px solid rgba(248,113,113,0.12)',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <span style={{ fontSize: '1.3rem', flexShrink: 0, lineHeight: 1.3 }}>{pain.emoji}</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{pain.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Transition arrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', paddingBottom: 16 }}
        >
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Así lo resolvemos
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ color: 'var(--accent)', opacity: 0.7 }}
            >↓</motion.div>
          </div>
        </motion.div>

      </div>
      <style>{`@media (max-width: 720px) { .pain-grid { grid-template-columns: 1fr !important; } } @media (min-width: 721px) and (max-width: 960px) { .pain-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </section>
  );
}
