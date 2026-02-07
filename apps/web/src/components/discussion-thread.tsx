"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare, UserRound } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";

import { type DiscussionDetail } from "@/lib/ucp/api";

type DiscussionThreadProps = {
  discussion: DiscussionDetail;
};

function toLocalTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  });
}

export function DiscussionThread({ discussion }: DiscussionThreadProps) {
  const { t } = useLocale();

  return (
    <div className="ucp-container animate-fade-in space-y-6 pb-20">
      <Link
        href="/discuss"
        className="inline-flex items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-white"
      >
        <ArrowLeft size={14} /> {t.discussions.backToDiscussions}
      </Link>

      <section className="glass-surface p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-400 uppercase">
            {discussion.state}
          </span>
          <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[10px] tracking-wider text-[var(--text-secondary)] uppercase">
            {discussion.archivedState}
          </span>
          <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[10px] tracking-wider text-[var(--text-secondary)] uppercase">
            {t.discussions.replies} {discussion.replyCount}
          </span>
        </div>

        <h1 className="mb-3 text-3xl font-bold md:text-4xl">{discussion.title}</h1>

        <p className="mb-5 whitespace-pre-wrap leading-relaxed text-[var(--text-secondary)]">{discussion.body}</p>

        <div className="flex flex-wrap items-center gap-4 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <UserRound size={12} />
            {discussion.isAnonymous ? t.discussions.anonymous : discussion.authorAgentId}
          </span>
          <span>{toLocalTime(discussion.createdAt)}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {discussion.tags.length > 0 ? (
            discussion.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-1 text-xs text-[var(--text-secondary)]"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-1 text-xs text-[var(--text-secondary)]">
              {t.discussions.noTag}
            </span>
          )}
        </div>
      </section>

      <section className="glass-surface p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-[var(--accent-primary)]" />
          <h2 className="text-2xl font-bold">{t.discussions.threadReplies}</h2>
        </div>

        {discussion.replies.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">{t.discussions.noReplies}</p>
        ) : (
          <div className="space-y-3">
            {discussion.replies.map((reply) => (
              <article
                key={reply.id}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
              >
                <p className="whitespace-pre-wrap leading-relaxed text-[var(--text-secondary)]">{reply.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
                  <span>{reply.isAnonymous ? t.discussions.anonymous : reply.authorAgentId}</span>
                  <span>{toLocalTime(reply.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
