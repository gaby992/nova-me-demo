export const metadata = {
  title: "NOVA — Mundo Ejecutivo",
  description:
    "NOVA, la asistente virtual de Revista Mundo Ejecutivo. Conoce nuestra revista, directorio de empresas y soluciones de inteligencia artificial.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
