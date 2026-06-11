// Fonte única de verdade para todo o branding white-label.
// Cada valor lê de uma variável NEXT_PUBLIC_* e cai no padrão se não estiver
// definida ou estiver vazia (build args do Docker chegam como string vazia).

export const branding = {
  // Identidade
  appName: process.env.NEXT_PUBLIC_APP_NAME || "P2App",
  appShortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || "P2",
  appTagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Helpdesk técnico",
  appDescription:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Gestão de chamados com autenticação JWT, controle de perfis e fluxo de atendimento.",

  // Landing page
  heroSubtitle:
    process.env.NEXT_PUBLIC_APP_SUBTITLE || "Sistema de gestão de chamados técnicos",
  heroTitle:
    process.env.NEXT_PUBLIC_APP_HERO_TITLE ||
    "Uma central de chamados enxuta para suporte técnico de verdade.",
  heroBody:
    process.env.NEXT_PUBLIC_APP_HERO_BODY ||
    "Priorize incidentes, acompanhe status e mantenha o histórico do atendimento em uma interface clara.",
  authBadge:
    process.env.NEXT_PUBLIC_AUTH_BADGE ||
    "Operação com JWT, perfis e trilha de atendimento",
  demoLabel: process.env.NEXT_PUBLIC_DEMO_LABEL || "Ambiente de demonstração",
  demoDescription:
    process.env.NEXT_PUBLIC_DEMO_DESCRIPTION ||
    "Dados sensíveis ficam fora da interface; a sessão usa token local e expira pelo backend.",

  // Cores (injetadas como CSS vars em layout.tsx)
  accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || "#f6c43b",
  bgDeep: process.env.NEXT_PUBLIC_BG_DEEP || "#07111f",
  bgCard: process.env.NEXT_PUBLIC_BG_CARD || "#0b1b2b",
  bgAccent: process.env.NEXT_PUBLIC_BG_ACCENT || "#12365b",

  // Trust items na tela de login (pipe-separated ou JSON array)
  trustItems: parseTrustItems(),
} as const;

function parseTrustItems(): readonly string[] {
  const raw = process.env.NEXT_PUBLIC_TRUST_ITEMS;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      return raw.split("|").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [
    "Perfis separados para cliente, técnico, gerente e administrador",
    "Fila com prioridade, risco operacional e histórico do chamado",
    "Experiência responsiva para triagem no desktop ou no celular",
  ];
}

// Converte hex (#rrggbb) para rgba com o alpha informado.
export function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return `rgba(246,196,59,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}
