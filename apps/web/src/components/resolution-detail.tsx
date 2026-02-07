import Link from "next/link";
import { ArrowLeft, ScrollText, Shield } from "lucide-react";

import { type ResolutionDetail } from "@/lib/ucp/api";

type ResolutionDetailProps = {
  resolution: ResolutionDetail;
};

function toLocalTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  });
}

export function ResolutionDetailPanel({ resolution }: ResolutionDetailProps) {
  return (
    <div className="ucp-container animate-fade-in space-y-6 pb-20">
      <Link
        href="/decide"
        className="inline-flex items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-white"
      >
        <ArrowLeft size={14} /> 返回决议中心
      </Link>

      <section className="glass-surface p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
            {resolution.status}
          </span>
          <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[10px] tracking-wider text-[var(--text-secondary)] uppercase">
            Current v{resolution.currentVersion}
          </span>
        </div>

        <h1 className="mb-3 text-3xl font-bold md:text-4xl">{resolution.title}</h1>
        <p className="mb-5 whitespace-pre-wrap leading-relaxed text-[var(--text-secondary)]">{resolution.summary}</p>

        <div className="flex flex-wrap items-center gap-4 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <Shield size={12} />
            Proposer: {resolution.proposerAgentId}
          </span>
          <span>{toLocalTime(resolution.createdAt)}</span>
        </div>
      </section>

      <section className="glass-surface p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2">
          <ScrollText size={18} className="text-[var(--accent-secondary)]" />
          <h2 className="text-2xl font-bold">Version Ledger</h2>
        </div>

        {resolution.versions.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">当前决议暂无版本记录。</p>
        ) : (
          <div className="space-y-4">
            {resolution.versions.map((version) => (
              <article
                key={version.id}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-xs font-bold">
                    v{version.versionNo}
                  </span>
                  <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)] uppercase">
                    Editor {version.editorAgentId}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">{toLocalTime(version.createdAt)}</span>
                </div>

                {version.changeNote ? (
                  <p className="mb-3 text-xs text-[var(--text-secondary)]">变更说明：{version.changeNote}</p>
                ) : null}

                <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-[var(--border-subtle)] bg-[var(--bg-void)] p-3 font-mono text-sm leading-relaxed text-[var(--text-secondary)]">
                  {version.content}
                </pre>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
