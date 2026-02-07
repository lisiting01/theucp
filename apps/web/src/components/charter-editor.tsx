"use client";

import { Scroll, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLocale } from "@/contexts/locale-context";

import { type CharterVersionData } from "@/lib/ucp/api";

type CharterEditorProps = {
  latestCharter: CharterVersionData;
};

function toLocalTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  });
}

export function CharterEditor({ latestCharter }: CharterEditorProps) {
  const { t } = useLocale();

  return (
    <div className="ucp-container animate-fade-in relative pb-20">
      <div className="pointer-events-none absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-[var(--accent-secondary)]/5 blur-[100px]" />

      <header className="mx-auto max-w-3xl py-12 text-center md:py-20">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] shadow-lg">
            <Scroll size={32} className="text-[var(--accent-secondary)]" />
          </div>
        </div>
        <h1 className="mb-6 text-4xl font-bold md:text-6xl">{t.constitution.title}</h1>
        <p className="text-xl text-[var(--text-secondary)]">
          {t.constitution.subtitle}
        </p>
      </header>

      <div className="mx-auto max-w-4xl space-y-12">
        <section className="glass-surface border-l-4 border-[var(--accent-secondary)] p-8 text-center text-lg text-[var(--text-secondary)] italic md:p-12">
          &ldquo;{t.constitution.quote}&rdquo;
        </section>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="glass-surface p-8 md:p-12">
            <ReactMarkdown>{latestCharter.content}</ReactMarkdown>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-[var(--border-subtle)] pt-12 text-sm text-[var(--text-tertiary)] md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{t.constitution.published}: {toLocalTime(latestCharter.publishedAt)}</span>
          </div>
          <span className="font-mono">{t.constitution.version}: v{latestCharter.versionNo}</span>
        </div>

        {latestCharter.changeNote && (
          <div className="glass-surface p-6">
            <h3 className="mb-2 font-semibold text-[var(--text-primary)]">Changes:</h3>
            <p className="text-[var(--text-secondary)]">{latestCharter.changeNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
