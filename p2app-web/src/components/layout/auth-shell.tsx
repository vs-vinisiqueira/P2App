import Link from "next/link";
import { ReactNode } from "react";
import { CheckCircle2, LockKeyhole, Ticket } from "lucide-react";

import { branding } from "@/config/branding";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main
      className="grid min-h-screen text-white lg:grid-cols-[0.88fr_1.12fr]"
      style={{ backgroundColor: `var(--brand-bg-deep, #07111f)` }}
    >
      <section
        className="hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between"
        style={{
          background: `linear-gradient(135deg, var(--brand-bg-deep, #07111f), var(--brand-bg-card, #0b1b2b) 58%, var(--brand-bg-accent, #12365b))`,
        }}
      >
        <BrandLogo />

        <div className="max-w-xl">
          <p
            className="mb-4 inline-flex rounded-full px-3 py-1 text-sm"
            style={{
              border: `1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)`,
              color: `var(--brand-accent)`,
            }}
          >
            {branding.authBadge}
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            {branding.heroTitle}
          </h1>
          <p className="mt-4 text-slate-300">{branding.heroBody}</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-200">
            {branding.trustItems.map((text) => (
              <TrustItem key={text} text={text} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm text-slate-300">
          <div className="mb-2 flex items-center gap-2" style={{ color: `var(--brand-accent)` }}>
            <LockKeyhole className="size-4" />
            {branding.demoLabel}
          </div>
          {branding.demoDescription}
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <BrandLogo />
          </Link>

          <div className="rounded-lg border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-black/25 dark:bg-[#0B1B2B] dark:text-white">
            <div className="mb-6">
              <p className="text-sm font-semibold" style={{ color: `var(--brand-accent)` }}>
                Acesso seguro
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div
        className="flex size-10 items-center justify-center rounded-lg text-slate-950 shadow-lg"
        style={{
          backgroundColor: `var(--brand-accent)`,
          boxShadow: `0 10px 15px -3px color-mix(in srgb, var(--brand-accent) 20%, transparent)`,
        }}
      >
        <Ticket className="size-5" />
      </div>
      <div>
        <p className="text-lg font-semibold">{branding.appName}</p>
        <p className="text-xs text-slate-400">{branding.appTagline}</p>
      </div>
    </Link>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-white/[0.06] p-3 ring-1 ring-white/10">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: `var(--brand-accent)` }} />
      <span>{text}</span>
    </div>
  );
}
