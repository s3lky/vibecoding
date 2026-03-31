import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Hexagon } from 'lucide-react';

// ─── Configuración ───────────────────────────────────────────────
// Cuando tengas el webhook de n8n listo, cambia esta URL:
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || null;

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: '¡Hola! Soy el asistente de **SerenIA**. Puedo ayudarte con dudas sobre nuestros servicios de automatización, n8n, calidad de datos y ETL. ¿En qué puedo ayudarte?',
  ts: new Date(),
};

const FALLBACK_RESPONSE =
  'Gracias por tu mensaje. En este momento estoy en configuración. Mientras tanto, puedes contactarnos directamente en **hola@serenia.io** o rellenar el formulario de contacto.';

// ─── Helpers ─────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

/** Renderiza **negrita** en el texto */
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p
      )}
    </span>
  );
}

// ─── Burbuja de mensaje ───────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 12,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser ? 'rgba(96,165,250,0.15)' : 'rgba(129,140,248,0.15)',
        border: `1px solid ${isUser ? 'rgba(96,165,250,0.25)' : 'rgba(129,140,248,0.25)'}`,
        color: isUser ? 'var(--accent)' : 'var(--accent2)',
      }}>
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Texto */}
      <div style={{
        maxWidth: '75%',
        background: isUser
          ? 'linear-gradient(135deg, rgba(96,165,250,0.18), rgba(129,140,248,0.18))'
          : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isUser ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '10px 14px',
      }}>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text)', margin: 0 }}>
          <RichText text={msg.text} />
        </p>
        <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 4, display: 'block', textAlign: isUser ? 'right' : 'left' }}>
          {formatTime(msg.ts)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.25)',
        color: 'var(--accent2)',
      }}>
        <Bot size={13} />
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px 16px 16px 4px', padding: '12px 16px',
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.span key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay, ease: 'easeInOut' }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', display: 'block' }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Widget principal ─────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus al abrir
  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: 'user', text, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let replyText = FALLBACK_RESPONSE;

      if (N8N_WEBHOOK_URL) {
        const res = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            sessionId: getSessionId(),
            timestamp: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Acepta { reply }, { message }, { text }, o { output } desde n8n
          replyText = data.reply ?? data.message ?? data.text ?? data.output ?? FALLBACK_RESPONSE;
        }
      }

      // Simula latencia mínima para que el typing indicator sea visible
      await new Promise(r => setTimeout(r, N8N_WEBHOOK_URL ? 0 : 900));

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: replyText,
        ts: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Hubo un problema de conexión. Inténtalo de nuevo o escríbenos a **hola@serenia.io**.',
        ts: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Panel de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              position: 'fixed', bottom: 88, right: 24, zIndex: 200,
              width: 360, height: 520,
              background: 'var(--bg-card)',
              border: '1px solid rgba(96,165,250,0.18)',
              borderRadius: 20,
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(96,165,250,0.08)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 18px',
              background: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(129,140,248,0.1))',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(96,165,250,0.35)',
                }}>
                  <Hexagon size={18} color="#fff" strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                    Seren<span style={{ color: 'var(--accent)' }}>IA</span> Assistant
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'block' }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                      {N8N_WEBHOOK_URL ? 'En línea' : 'Modo demo'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: 'var(--muted)',
                display: 'flex', padding: 4, borderRadius: 6, transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = ''}>
                <X size={18} />
              </button>
            </div>

            {/* Mensajes */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 16px 4px',
              scrollbarWidth: 'thin',
            }}>
              {messages.map(m => <Bubble key={m.id} msg={m} />)}
              <AnimatePresence>{loading && <TypingIndicator />}</AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 14px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Escribe tu pregunta..."
                rows={1}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '10px 12px',
                  color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '0.85rem',
                  outline: 'none', resize: 'none', lineHeight: 1.5,
                  maxHeight: 90, overflowY: 'auto',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  width: 38, height: 38, flexShrink: 0, borderRadius: 10, border: 'none',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                    : 'rgba(255,255,255,0.07)',
                  color: input.trim() && !loading ? '#fff' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              </motion.button>
            </div>

            {/* Powered by */}
            <div style={{ textAlign: 'center', padding: '6px 0 10px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)' }}>
              Powered by n8n + AI · SerenIA
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(96,165,250,0.45)',
          cursor: 'pointer',
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={22} /></motion.span>
            : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><MessageCircle size={22} /></motion.span>
          }
        </AnimatePresence>

        {/* Badge de notificación */}
        <AnimatePresence>
          {!open && hasUnread && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: 2, right: 2,
                width: 14, height: 14, borderRadius: '50%',
                background: '#f87171',
                border: '2px solid var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.55rem', fontWeight: 700, color: '#fff',
              }}
            >1</motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// Genera un sessionId persistente para la sesión del navegador
function getSessionId() {
  const key = 'serenia_session';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}
