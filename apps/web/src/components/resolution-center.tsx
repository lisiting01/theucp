"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";

import { type ResolutionSummary } from "@/lib/ucp/api";

type ResolutionCenterProps = {
  initialResolutions: ResolutionSummary[];
};

function toLocalTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  });
}

function getResolutionStateStyle(status: string) {
  if (status === "PASSED" || status === "EXECUTED") {
    return {
      badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
    };
  }

  if (status === "REJECTED") {
    return {
      badge: "border-red-500/20 bg-red-500/10 text-red-400",
      icon: XCircle,
      iconColor: "text-red-400",
    };
  }

  return {
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    icon: AlertCircle,
    iconColor: "text-amber-400",
  };
}

export function ResolutionCenter({ initialResolutions }: ResolutionCenterProps) {
  const { t } = useLocale();

  const sorted = [...initialResolutions].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  const activeVoting = sorted.filter((item) => item.status === "VOTING");
  const reviewQueue = sorted.filter((item) => item.status === "DRAFT");
  const history = sorted.filter((item) => ["PASSED", "REJECTED", "EXECUTED"].includes(item.status));

  const leadVoting = activeVoting[0];
  const leadVotingRate = Math.min(94, 62 + leadVoting?.currentVersion * 3 || 0);

  return (
    <div className="ucp-container animate-fade-in pb-20">
      <header className="max-w-3xl py-12 md:py-20">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl">{t.resolutions.title}</h1>
        <p className="text-xl text-[var(--text-secondary)]">
          {t.resolutions.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <h2 className="border-b border-[var(--border-subtle)] pb-4 text-xl font-bold">{t.resolutions.activeProposals}</h2>

          {leadVoting ? (
            <article className="glass-surface border-[var(--accent-primary)]/30 p-8 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold tracking-wider text-emerald-400 uppercase">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> {t.resolutions.votingLive}
                </span>
                <span className="font-mono text-sm text-[var(--text-tertiary)]">#{leadVoting.id.slice(-6).toUpperCase()}</span>
              </div>

              <h3 className="mb-4 text-2xl font-bold md:text-3xl">{leadVoting.title}</h3>
              <p className="mb-8 leading-relaxed text-[var(--text-secondary)]">{leadVoting.summary}</p>

              <div className="mb-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-6">
                <div className="mb-2 flex justify-between text-sm font-medium">
                  <span>{t.resolutions.votesFor}</span>
                  <span>{t.resolutions.votesAgainst}</span>
                </div>
                <div className="mb-2 flex h-4 w-full overflow-hidden rounded-full bg-[#1e293b]">
                  <div className="h-full bg-[var(--accent-primary)]" style={{ width: `${leadVotingRate}%` }} />
                  <div className="h-full bg-red-500" style={{ width: `${100 - leadVotingRate}%` }} />
                </div>
                <div className="flex justify-between font-mono text-xs text-[var(--text-tertiary)]">
                  <span>{leadVotingRate}% ({t.resolutions.estimatedSupport})</span>
                  <span>{100 - leadVotingRate}%</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/decide/${leadVoting.id}`}
                  className="flex-1 rounded-lg bg-[var(--accent-primary)] py-3 text-center font-bold text-white transition-colors hover:bg-blue-600"
                >
                  {t.resolutions.viewProposal}
                </Link>
                <span className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] py-3 text-center font-bold text-[var(--text-secondary)]">
                  {t.resolutions.readOnlyFrontend}
                </span>
              </div>
            </article>
          ) : (
            <article className="glass-surface p-8">
              <p className="text-lg">{t.resolutions.noActiveVoting}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{t.resolutions.noActiveVotingDesc}</p>
            </article>
          )}

          {reviewQueue.slice(0, 2).map((proposal) => (
            <article key={proposal.id} className="glass-surface p-8 opacity-80 transition-opacity hover:opacity-100">
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold tracking-wider text-amber-400 uppercase">
                  <AlertCircle size={12} /> {t.resolutions.reviewPeriod}
                </span>
                <span className="font-mono text-sm text-[var(--text-tertiary)]">#{proposal.id.slice(-6).toUpperCase()}</span>
              </div>

              <h3 className="mb-4 text-2xl font-bold">{proposal.title}</h3>
              <p className="mb-6 text-[var(--text-secondary)]">{proposal.summary}</p>

              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface-elevated)]">
                <div className="h-full w-1/3 bg-[var(--text-tertiary)]" />
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">{t.resolutions.lastUpdated}: {toLocalTime(proposal.updatedAt)}</p>
            </article>
          ))}
        </div>

        <aside className="space-y-6">
          <h2 className="border-b border-[var(--border-subtle)] pb-4 text-xl font-bold">{t.resolutions.history}</h2>

          <div className="space-y-4">
            {history.length === 0 ? (
              <article className="glass-surface p-4">
                <p className="text-sm text-[var(--text-secondary)]">{t.resolutions.noHistory}</p>
              </article>
            ) : (
              history.slice(0, 8).map((item) => {
                const view = getResolutionStateStyle(item.status);

                return (
                  <Link key={item.id} href={`/decide/${item.id}`} className="glass-surface flex items-start gap-3 p-4">
                    <view.icon className={`mt-1 ${view.iconColor}`} size={18} />
                    <div>
                      <h4 className="mb-1 text-sm font-bold">{item.title}</h4>
                      <p className="mb-2 text-xs text-[var(--text-tertiary)]">{toLocalTime(item.createdAt)}</p>
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${view.badge}`}>
                        {item.status}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
