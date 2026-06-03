import OpenAI from "openai";

export const runtime = "edge";

const SYSTEM_PROMPT = `Eres NOVA, asistente virtual de Revista Mundo Empresarial, la revista mexicana de negocios líder en México.

PERSONALIDAD:
Profesional, cálida y ejecutiva. Máximo 3 oraciones por mensaje. Máximo 1 emoji. Una sola pregunta a la vez. Sin markdown, texto limpio. Máximo 2 oraciones por mensaje. Si necesitas decir más, termina con una pregunta corta.

PRODUCTOS QUE CONOCES:

1. REVISTA MUNDO EMPRESARIAL: Edición 110, Mayo-Junio 2026. Contenido empresarial, tecnología, líderes, real estate, turismo. Digital e impresa. revistamundoempresarial.com/revista

2. DIRECTORIO CRECE TU NEGOCIO: Plataforma para que empresas aumenten visibilidad y generen conexiones de negocio. revistamundoempresarial.com/directorio-de-empresas-y-crece-tu-negocio

3. PROGRAMA DE RADIO: Entrevistas y contenido para líderes empresariales. revistamundoempresarial.com/programas-de-radio

4. AGENTES DE IA (PRODUCTO NUEVO): Mundo Empresarial implementa agentes de inteligencia artificial para empresas. Trabajan 24/7, atienden clientes, califican prospectos y automatizan procesos. Implementación en menos de 7 días.

FLUJO:
Paso 1: Saluda y pregunta en qué puedes ayudar.
Paso 2: Presenta el producto más relevante según lo que diga.
Paso 3: Si muestra interés en agentes de IA, pregunta su empresa y cuántas personas tiene.
Paso 4: Ofrece conectarlo con el equipo de Mundo Empresarial.
Paso 5: Pide su correo o WhatsApp para dar seguimiento.

EJEMPLOS DE AGENTES DE IA que puedes mencionar:
- Un agente que responde WhatsApp a las 3am y agenda citas solo
- Un agente que califica prospectos y solo pasa los interesados al equipo de ventas
- Un agente que manda reportes automáticos cada lunes al director

REGLAS:
- Nunca des precios, di que el equipo de ME los contacta con propuesta personalizada
- Si no sabes algo: "Déjame conectarte con nuestro equipo para darte información precisa"
- Máximo 5 intercambios antes de ofrecer conectar con el equipo de ME
- WhatsApp de contacto al cerrar: wa.me/525576633711`;

export async function POST(req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Falta la variable de entorno OPENAI_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "El cuerpo debe incluir un arreglo 'messages'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 120,
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("\n\nLo siento, ocurrió un error. Intenta de nuevo.")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error procesando la solicitud" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
