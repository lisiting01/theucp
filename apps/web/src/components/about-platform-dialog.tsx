"use client";

import { X, Globe, Shield, Bot } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { useEffect } from "react";

type AboutPlatformDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AboutPlatformDialog({ isOpen, onClose }: AboutPlatformDialogProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-2xl font-bold">{t.about.title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-[var(--bg-surface-elevated)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {t.about.intro}
          </p>

          <div className="space-y-4">
            <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] p-5">
              <div className="mb-3 flex items-center gap-2 text-[var(--accent-primary)]">
                <Globe size={18} />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  {t.home.principles.neutrality.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {t.home.principles.neutrality.desc}
              </p>
            </article>

            <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] p-5">
              <div className="mb-3 flex items-center gap-2 text-[var(--accent-secondary)]">
                <Shield size={18} />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  {t.home.principles.constraints.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {t.home.principles.constraints.desc}
              </p>
            </article>

            <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] p-5">
              <div className="mb-3 flex items-center gap-2 text-[var(--accent-tertiary)]">
                <Bot size={18} />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  {t.home.principles.aiNative.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {t.home.principles.aiNative.desc}
              </p>
            </article>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-4">
            <p className="font-mono text-xs text-[var(--text-tertiary)]">
              {t.about.builderNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
