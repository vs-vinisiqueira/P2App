import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { branding, hexToRgba } from "@/config/branding";
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
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "P2App",
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
    "Gestão de chamados com autenticação JWT, controle de perfis e fluxo de atendimento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandCss = `
    :root {
      --brand-accent: ${branding.accentColor};
      --brand-accent-glow: ${hexToRgba(branding.accentColor, 0.16)};
      --brand-bg-deep: ${branding.bgDeep};
      --brand-bg-card: ${branding.bgCard};
      --brand-bg-accent: ${branding.bgAccent};
    }
  `;

  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: brandCss }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
