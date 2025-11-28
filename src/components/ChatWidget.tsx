import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { streamMessages, HumanMessage, AIMessage } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const ChatWidget = () => {
  // Inicializar desde sessionStorage (se borra al cerrar pestaña)
  // Abrir por defecto la primera vez (cuando no hay nada guardado)
  const [open, setOpen] = useState(() => {
    const saved = sessionStorage.getItem('chatWidgetOpen');
    // Si no hay nada guardado, abrir por defecto (primera vez)
    // Si hay algo guardado, respetar la preferencia del usuario
    return saved === null ? true : saved === 'true';
  });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem('chatWidgetMessages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Guardar estado open en sessionStorage cuando cambie
  useEffect(() => {
    sessionStorage.setItem('chatWidgetOpen', open.toString());
  }, [open]);

  // Guardar mensajes en sessionStorage cuando cambien
  useEffect(() => {
    sessionStorage.setItem('chatWidgetMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Mensaje inicial al abrir por primera vez
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: generateId(),
          role: "assistant",
          content: `Hello there!
I am Paul's AI agent, you can talk to me if you have a question about Paul's profile and I will do my best to answer.
I can also help you contact Paul directly — just let me know if you'd like to send him a message!

Some examples of questions I can answer:
• What is Paul doing right now?
• Tell me about Paul's CV
• Tell me about Paul's interests

Please note I am in beta.`,
        },
      ]);
    }
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    
    const userMsg: Message = { id: generateId(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    
    try {
      // Convertir mensajes al formato de la API
      // Excluir el mensaje inicial del sistema si es el primer mensaje del asistente
      const apiMessages: (HumanMessage | AIMessage)[] = messages
        .filter((m, idx) => !(idx === 0 && m.role === "assistant")) // Excluir primer mensaje si es del asistente (mensaje inicial)
        .map((m): HumanMessage | AIMessage => ({
          type: m.role === "user" ? "human" : "ai",
          content: m.content,
        }));
      
      // Agregar el nuevo mensaje del usuario
      apiMessages.push({ type: "human", content: text });
      
      // Crear mensaje vacío del asistente para mostrar mientras llega el stream
      const assistantMsgId = generateId();
      let assistantContent = "";
      
      setMessages((m) => [...m, { id: assistantMsgId, role: "assistant", content: "" }]);
      
      // Stream de mensajes
      await streamMessages(
        apiMessages,
        (chunk) => {
          assistantContent += chunk;
          // Actualizar el mensaje del asistente con el contenido acumulado
          setMessages((m) =>
            m.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: assistantContent }
                : msg
            )
          );
        }
      );
    } catch (e) {
      const errMsg: Message = { 
        id: generateId(), 
        role: "assistant", 
        content: "Error conectando con el agente." 
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat"
        className="fixed bottom-6 right-6 z-50 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition flex items-center gap-2 pl-2 pr-3"
      >
        {open ? (
          <span className="text-xl leading-none">×</span>
        ) : (
          <span className="flex items-center gap-2">
            <img
              src="/linkedIn-photo-4.png"
              alt="AI Agent"
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="text-sm font-medium">AI Agent</span>
          </span>
        )}
      </button>

      {open && (
        <Card className="fixed bottom-24 right-6 z-50 w-80 max-h-[70vh] flex flex-col shadow-2xl border-border">
          <div className="p-3 border-b text-sm font-semibold">Paul's AI Agent</div>

          <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: "50vh" }}>
            {messages.length === 0 && (
              <div className="text-xs text-muted-foreground">Empieza la conversación...</div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs ml-8"
                    : "bg-muted rounded-lg px-3 py-2 text-xs mr-8"
                }
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe un mensaje..."
            />
            <Button onClick={send} disabled={loading || !input.trim()}>
              {loading ? "..." : "Enviar"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;


