# NOVA — Chat widget de IA para Revista Mundo Empresarial

Widget de chat con streaming construido en **Next.js (App Router)** + **OpenAI (gpt-4o-mini)**, listo para desplegar en **Vercel**.

## Características

- Asistente NOVA con personalidad y flujo de ventas definidos en el system prompt.
- Respuestas en streaming (token por token) vía Edge Runtime.
- Diseño dark: fondo `#0A0A0A`, acento `#F0C000`, ancho máx. 420px, alto completo.
- La API key vive solo en el servidor (`OPENAI_API_KEY`), nunca se expone al cliente.

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # y coloca tu OPENAI_API_KEY
npm run dev                         # http://localhost:3000
```

## Variable de entorno

| Nombre           | Descripción                  |
| ---------------- | ---------------------------- |
| `OPENAI_API_KEY` | API key de OpenAI (servidor) |

## Estructura

```
app/
  api/chat/route.js   # endpoint de streaming + system prompt de NOVA
  layout.js           # metadata y <html>
  page.js             # monta el widget
  globals.css         # estilos del widget
components/
  Chat.js             # UI del chat (cliente) con manejo del stream
```

## Deploy en Vercel

1. Sube el repo a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio.
3. Agrega la variable de entorno `OPENAI_API_KEY` (Production + Preview + Development).
4. Deploy. Vercel detecta Next.js automáticamente.
