import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import SEO from '../components/SEO';

const terms = [
  { term: 'ETL', category: 'Datos', def: 'Extract, Transform, Load. Proceso de extracción de datos de origen, su transformación (limpieza, normalización, enriquecimiento) y su carga en un destino como un data warehouse o base de datos.' },
  { term: 'ELT', category: 'Datos', def: 'Extract, Load, Transform. Variante moderna del ETL donde los datos se cargan primero en el destino y se transforman allí, aprovechando la potencia de herramientas como dbt y data warehouses en la nube.' },
  { term: 'n8n', category: 'Herramienta', def: 'Plataforma open-source de automatización de workflows con interfaz visual. Permite conectar +400 servicios y crear flujos complejos con lógica condicional, código personalizado y despliegue self-hosted.' },
  { term: 'Data Quality', category: 'Datos', def: 'Conjunto de propiedades que determinan la fiabilidad de los datos: completitud, exactitud, consistencia, validez, unicidad y temporalidad. Un dato de calidad es aquel en el que se puede confiar para tomar decisiones.' },
  { term: 'Data Pipeline', category: 'Datos', def: 'Serie de procesos automatizados que mueven y transforman datos desde una o varias fuentes hasta un destino. Incluye ingesta, validación, transformación, carga y monitoreo.' },
  { term: 'Data Contract', category: 'Gobernanza', def: 'Acuerdo formal entre el productor y el consumidor de datos que define el esquema, calidad, SLA y semántica esperados. Evita que cambios en origen rompan pipelines downstream sin avisar.' },
  { term: 'Data Lineage', category: 'Gobernanza', def: 'Trazabilidad del origen, movimiento y transformaciones de un dato a lo largo de todo su ciclo de vida. Permite entender de dónde viene un valor en un dashboard y qué transformaciones sufrió.' },
  { term: 'LLM', category: 'IA', def: 'Large Language Model. Modelo de lenguaje de gran escala entrenado en vastos corpus de texto (GPT-4, Claude, Llama). En el contexto de datos, se usan para clasificar, normalizar, enriquecer y validar registros semánticamente.' },
  { term: 'RAG', category: 'IA', def: 'Retrieval-Augmented Generation. Técnica que combina un LLM con una base de conocimiento externa (vectorial). El modelo recupera información relevante antes de generar la respuesta, reduciendo alucinaciones.' },
  { term: 'Embedding', category: 'IA', def: 'Representación vectorial de un texto, imagen u otro dato en un espacio matemático de alta dimensión. Permite comparar semánticamente dos textos calculando la distancia entre sus vectores.' },
  { term: 'Vector DB', category: 'IA', def: 'Base de datos optimizada para almacenar y buscar embeddings por similitud semántica. Ejemplos: Pinecone, Weaviate, Qdrant, pgvector. Fundamental para sistemas RAG.' },
  { term: 'Webhook', category: 'Integraciones', def: 'Mecanismo de notificación HTTP en el que un sistema envía datos a una URL predefinida cuando ocurre un evento. Es la base de muchos flujos de automatización en tiempo real.' },
  { term: 'API REST', category: 'Integraciones', def: 'Interfaz de programación que permite a sistemas comunicarse mediante HTTP. Usa verbos (GET, POST, PUT, DELETE) y recursos identificados por URLs para intercambiar datos en formato JSON.' },
  { term: 'dbt', category: 'Herramienta', def: 'Data Build Tool. Herramienta open-source para transformar datos dentro de un data warehouse usando SQL y Jinja. Añade testing, documentación, linaje y versionado a las transformaciones.' },
  { term: 'Apache Airflow', category: 'Herramienta', def: 'Orquestador de workflows open-source para programar y monitorear pipelines de datos. Define los flujos como DAGs (Directed Acyclic Graphs) en Python.' },
  { term: 'Data Catalog', category: 'Gobernanza', def: 'Inventario organizado de todos los activos de datos de una organización: tablas, APIs, métricas, documentos. Incluye metadatos, propietarios, definiciones y estado de calidad.' },
  { term: 'Fuzzy Matching', category: 'Datos', def: 'Técnica para identificar registros similares pero no idénticos (ej. "María García" vs "Maria Garcia"). Esencial para deduplicación de bases de datos de clientes o productos.' },
  { term: 'Data Freshness', category: 'Datos', def: 'Medida de qué tan recientes son los datos en un sistema. Un dato con baja freshness es aquel que lleva más tiempo del esperado sin actualizarse, lo que puede indicar un fallo en el pipeline.' },
  { term: 'Idempotencia', category: 'Datos', def: 'Propiedad de un proceso que produce el mismo resultado independientemente de cuántas veces se ejecute con los mismos datos de entrada. Fundamental para pipelines resilientes.' },
  { term: 'Pydantic', category: 'Herramienta', def: 'Librería Python para validación de datos usando type hints. Garantiza que los datos que entran y salen de un sistema cumplen el esquema esperado, generando errores claros cuando no.' },
  { term: 'FastAPI', category: 'Herramienta', def: 'Framework Python moderno y rápido para construir APIs. Usa Pydantic para validación automática y genera documentación OpenAPI interactiva. Ideal para exponer modelos de ML o pipelines de datos.' },
  { term: 'LangChain', category: 'IA', def: 'Framework Python/JS para construir aplicaciones con LLMs. Ofrece abstracciones para chains, agents, memory, RAG y herramientas. Facilita conectar LLMs con datos y acciones externas.' },
  { term: 'SLA de datos', category: 'Gobernanza', def: 'Service Level Agreement aplicado a los datos. Define compromisos de calidad, disponibilidad y frescura: "el pipeline entregará los datos procesados en menos de 15 minutos con 99.5% de completitud".' },
  { term: 'Polars', category: 'Herramienta', def: 'Librería Python/Rust para manipulación de DataFrames de alto rendimiento. Más rápida que Pandas en la mayoría de operaciones, especialmente con datasets grandes, gracias a su ejecución lazy y paralela.' },
  { term: 'Schema Drift', category: 'Datos', def: 'Cambio inesperado en la estructura de los datos de origen (ej. una API añade o elimina un campo). Sin detección, puede romper pipelines downstream silenciosamente.' },
  { term: 'Observabilidad', category: 'Datos', def: 'Capacidad de entender el estado interno de un sistema a partir de sus salidas (métricas, logs, trazas). En pipelines de datos incluye monitoreo de volumen, latencia, calidad y errores.' },
  { term: 'Datos maestros', category: 'Datos', def: 'Conjunto de datos críticos y compartidos por toda la organización: clientes, productos, proveedores, ubicaciones. Su gestión (MDM, Master Data Management) garantiza una fuente única de verdad.' },
];

const categories = ['Todos', ...new Set(terms.map(t => t.category))];
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [activeLetter, setActiveLetter] = useState(null);

  const filtered = useMemo(() => {
    return terms.filter(t => {
      const matchSearch = t.term.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Todos' || t.category === category;
      const matchLetter = !activeLetter || t.term[0].toUpperCase() === activeLetter;
      return matchSearch && matchCat && matchLetter;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [search, category, activeLetter]);

  const catColors = { IA: 'var(--accent2)', Datos: 'var(--accent)', Herramienta: '#34d399', Gobernanza: 'var(--orange)', Integraciones: 'var(--red)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <SEO
        title="Glosario de IA y Datos — ETL, n8n, LLM, Data Quality y más"
        description="27 términos clave de inteligencia artificial, automatización de datos y data engineering explicados en español. ETL, ELT, n8n, LLM, RAG, data contract y más."
        path="/glosario"
      />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 40 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = ''}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{
            display: 'inline-block', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            color: 'var(--accent)', borderRadius: 100, padding: '4px 14px',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
          }}>Glosario</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: 12 }}>
            Glosario de{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>IA & Datos</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: '1rem' }}>
            {terms.length} términos clave en automatización, inteligencia artificial y calidad de datos.
          </p>
        </motion.div>

        {/* Filtros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar término..."
              style={{
                width: '100%', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--font)',
                fontSize: '0.9rem', padding: '12px 16px 12px 42px', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{
                  padding: '6px 16px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600,
                  border: `1px solid ${category === c ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                  background: category === c ? 'rgba(96,165,250,0.1)' : 'transparent',
                  color: category === c ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {alphabet.map(l => {
              const hasTerms = terms.some(t => t.term[0].toUpperCase() === l);
              return (
                <button key={l} onClick={() => setActiveLetter(activeLetter === l ? null : l)}
                  disabled={!hasTerms}
                  style={{
                    width: 28, height: 28, borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                    border: `1px solid ${activeLetter === l ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
                    background: activeLetter === l ? 'rgba(96,165,250,0.1)' : 'transparent',
                    color: hasTerms ? (activeLetter === l ? 'var(--accent)' : 'var(--muted)') : 'rgba(255,255,255,0.15)',
                    cursor: hasTerms ? 'pointer' : 'not-allowed',
                  }}>{l}</button>
              );
            })}
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 20 }}>{filtered.length} términos</p>

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((t, i) => (
            <motion.div key={t.term}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              style={{
                background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius)', padding: '18px 20px',
                display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20, alignItems: 'start',
              }}
              className="glossary-row"
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{t.term}</div>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                  padding: '2px 10px', borderRadius: 100,
                  background: `${catColors[t.category] || 'var(--accent)'}15`,
                  border: `1px solid ${catColors[t.category] || 'var(--accent)'}28`,
                  color: catColors[t.category] || 'var(--accent)',
                }}>{t.category}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{t.def}</p>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            No se encontraron términos para "{search}"
          </div>
        )}
      </div>
      <style>{`@media (max-width: 600px) { .glossary-row { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
