"use client";

import { useEffect, useRef, useState } from "react";

const FIRST_MESSAGE =
  "¡Hola! Soy NOVA 👋 la asistente virtual de Mundo Ejecutivo. ¿En qué puedo ayudarte hoy: conocer nuestros medios, la Cumbre 1000, Mundo Academy o nuestras soluciones de inteligencia artificial?";

function Avatar({ small }) {
  return <div className={small ? "avatar sm" : "avatar"}>N</div>;
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: FIRST_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  function autoGrow(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        throw new Error("bad response");
      }

      // Añade burbuja vacía del agente que iremos llenando con el stream.
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      setLoading(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      setLoading(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Lo siento, tuve un problema de conexión. ¿Podrías intentarlo de nuevo?",
        },
      ]);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className="widget">
      <header className="header">
        <Avatar />
        <div className="header-text">
          <span className="header-title">MUNDO EJECUTIVO</span>
          <span className="header-subtitle">Tu asistente empresarial</span>
        </div>
        <span className="status-dot" aria-label="En línea" />
      </header>

      <div className="messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`row ${m.role === "user" ? "user" : "agent"}`}>
            {m.role === "assistant" && <Avatar small />}
            <div className={`bubble ${m.role === "user" ? "user" : "agent"}`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="row agent">
            <Avatar small />
            <div className="bubble agent">
              <div className="typing" aria-label="NOVA está escribiendo">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="composer">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          placeholder="Escribe tu mensaje…"
          onChange={(e) => {
            setInput(e.target.value);
            autoGrow(e.target);
          }}
          onKeyDown={onKeyDown}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Enviar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </section>
  );
}
