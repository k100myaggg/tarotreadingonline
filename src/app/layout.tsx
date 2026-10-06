import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arcana 3D | Sacred 3D AI Tarot Reading",
  description: "An authentic, real-time 3D AI tarot sanctuary. Ask your question, shuffle the floating deck in 3D, and receive a streamed hermetic reading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#06050b] text-slate-100 antialiased min-h-screen flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
