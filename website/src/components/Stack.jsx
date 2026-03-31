import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const techs = [
  { name: 'n8n', color: '#f97316' },
  { name: 'Python', color: '#63b3ed' },
  { name: 'dbt', color: '#68d391' },
  { name: 'OpenAI / Claude', color: '#9f7aea' },
  { name: 'PostgreSQL', color: '#fc8181' },
  { name: 'Apache Airflow', color: '#f6e05e' },
  { name: 'Pandas / Polars', color: '#63b3ed' },
  { name: 'Docker', color: '#68d391' },
  { name: 'Great Expectations', color: '#f97316' },
  { name: 'LangChain', color: '#9f7aea' },
  { name: 'Redis', color: '#fc8181' },
  { name: 'Grafana', color: '#f97316' },
  { name: 'REST / GraphQL', color: '#63b3ed' },
  { name: 'AWS / GCP', color: '#68d391' },
  { name: 'Metabase', color: '#63b3ed' },
  { name: 'Apache Kafka', color: '#fc8181' },
  { name: 'Pydantic', color: '#9f7aea' },
  { name: 'FastAPI', color: '#68d391' },
];

export default function Stack() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stack" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}
        >
          <span style={{
            display: 'inline-block', background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Stack tecnológico</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15 }}>
            Herramientas de{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>nivel enterprise</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}
        >
          {techs.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.04 }}
              whileHover={{ scale: 1.06, y: -2 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 100, padding: '10px 20px',
                fontSize: '0.875rem', fontWeight: 500,
                cursor: 'default',
                transition: 'border-color 0.2s',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: tech.color, flexShrink: 0, boxShadow: `0 0 6px ${tech.color}88` }} />
              {tech.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
