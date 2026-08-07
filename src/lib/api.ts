// Detección automática: en desarrollo usa localhost, en producción usa la URL de producción
// Puedes override con VITE_DEV_BACKEND_URL si es necesario
const API_BASE_URL = import.meta.env.VITE_DEV_BACKEND_URL 
  ?? (import.meta.env.DEV ? "http://localhost:8000" : "https://agent.paulgarghe.com");

export interface HumanMessage {
  type: "human";
  content: string;
}

export interface AIMessage {
  type: "ai";
  content: string;
}

export interface Request {
  input: {
    messages: (HumanMessage | AIMessage)[];
  };
  config?: {
    run_id?: string;
    tags?: string[];
  };
}

export interface AIMessageChunk {
  type: "AIMessageChunk";
  content: string | string[];
  [key: string]: any; // Para otros campos que pueda tener
}

/**
 * Stream messages from the API using SSE
 * @param messages Array of messages in the conversation history
 * @param onChunk Callback function called for each chunk of content received
 * @param runId Optional run ID for tracking the conversation
 * @returns Promise that resolves with the full accumulated content
 */
export const streamMessages = async (
  messages: (HumanMessage | AIMessage)[], 
  onChunk: (content: string) => void,
  runId?: string
): Promise<string> => {
  try {
    const requestBody: Request = {
      input: { messages },
      ...(runId && { config: { run_id: runId } }),
    };

    const response = await fetch(`${API_BASE_URL}/stream_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const err = new Error(`Error: ${response.status}`) as Error & { status: number };
      err.status = response.status;
      throw err;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    if (!reader) {
      throw new Error("No reader available");
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decodificar el chunk y agregarlo al buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Procesar líneas completas (separadas por \n)
        const lines = buffer.split('\n');
        // Guardar la última línea incompleta en el buffer
        buffer = lines.pop() || "";

        // Procesar cada línea completa
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          try {
            // Cada línea es un JSON completo
            const data: any = JSON.parse(trimmedLine);
            
            // Extraer el contenido del chunk - manejar diferentes formatos
            let chunkContent = '';
            
            // Formato 1: AIMessageChunk directo
            if (data.type === "AIMessageChunk" && data.content) {
              if (typeof data.content === 'string') {
                chunkContent = data.content;
              } else if (Array.isArray(data.content)) {
                chunkContent = data.content.join('');
              }
            }
            // Formato 2: Tupla (message, metadata) como en Streamlit
            else if (Array.isArray(data) && data.length >= 1) {
              const message = data[0];
              if (message && typeof message === 'object') {
                // Si es un objeto con type y content
                if (message.type === "AIMessageChunk" && message.content) {
                  if (typeof message.content === 'string') {
                    chunkContent = message.content;
                  } else if (Array.isArray(message.content)) {
                    chunkContent = message.content.join('');
                  }
                }
                // Si tiene content directamente
                else if (message.content && typeof message.content === 'string') {
                  chunkContent = message.content;
                }
                // Si es un objeto con kwargs (constructor)
                else if (message.kwargs && message.kwargs.content) {
                  const content = message.kwargs.content;
                  if (typeof content === 'string') {
                    chunkContent = content;
                  } else if (Array.isArray(content)) {
                    chunkContent = content.join('');
                  }
                }
              }
            }
            // Formato 3: Objeto con content directamente
            else if (data.content && typeof data.content === 'string') {
              chunkContent = data.content;
            }
            
            if (chunkContent) {
              fullContent += chunkContent;
              onChunk(chunkContent);
            }
          } catch (e) {
            // Si no es JSON válido, ignorar la línea
            console.warn('Failed to parse SSE line:', trimmedLine, e);
          }
        }
      }

      // Procesar cualquier línea restante en el buffer
      if (buffer.trim()) {
        try {
          const data: any = JSON.parse(buffer.trim());
          let chunkContent = '';
          
          if (data.type === "AIMessageChunk" && data.content) {
            if (typeof data.content === 'string') {
              chunkContent = data.content;
            } else if (Array.isArray(data.content)) {
              chunkContent = data.content.join('');
            }
          } else if (data.content && typeof data.content === 'string') {
            chunkContent = data.content;
          }
          
          if (chunkContent) {
            fullContent += chunkContent;
            onChunk(chunkContent);
          }
        } catch (e) {
          console.warn('Failed to parse final buffer:', buffer, e);
        }
      }
    } catch (streamError) {
      // Si hay un error en el stream pero ya tenemos contenido, devolverlo
      if (fullContent) {
        console.warn('Stream error but returning partial content:', streamError);
        return fullContent;
      }
      throw streamError;
    }

    return fullContent;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
};
