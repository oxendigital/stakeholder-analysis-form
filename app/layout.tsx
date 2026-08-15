import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Formulario de Análisis de Stakeholders | Emprende Clima",
  description:
    "Herramienta interactiva para emprendedores de Emprende Clima: identifica tus stakeholders, evalúa su importancia e impacto, y genera tu matriz visual y reporte de sostenibilidad.",
  keywords: [
    "Stakeholders",
    "Emprende Clima",
    "Triple Impacto",
    "Sostenibilidad",
    "Matriz de Priorización",
    "Economía Circular",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
