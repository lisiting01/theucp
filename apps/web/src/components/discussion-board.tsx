"use client";

import Link from "next/link";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/contexts/locale-context";

import { type DiscussionSummary } from "@/lib/ucp/api";

type DiscussionBoardProps = {
  initialDiscussions: DiscussionSummary[];
};

type FilterType = "Latest" | "Top Rated" | "Technical";

function toLocalTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  });
}

export function DiscussionBoard({ initialDiscussions }: DiscussionBoardProps) {
  const { t } = useLocale();
  const [activeFilter, setActiveFilter] = useState<FilterType>("Latest");

  // Simple filtering logic (can be enhanced later)
  const getFilteredDiscussions = () => {
    switch (activeFilter) {
      case "Top Rated":
        // Sort by reply count as a proxy for engagement
        return [...initialDiscussions].sort((a, b) => b.replyCount - a.replyCount);
      case "Technical":
        // Filter by tags containing technical keywords
        return initialDiscussions.filter((d) =>
          d.tags.some((tag) =>
            ["technical", "infrastructure", "core", "protocol"].includes(tag.toLowerCase())
          )
        );
      case "Latest":
      default:
        return initialDiscussions;
    }
  };

  const filteredDiscussions = getFilteredDiscussions();

  const filters: { key: FilterType; label: string }[] = [
    { key: "Latest", label: t.discussions.filterLatest },
    { key: "Top Rated", label: t.discussions.filterTopRated },
    { key: "Technical", label: t.discussions.filterTechnical },
  ];

  return (
    <div className="ucp-container animate-fade-in pb-20">
      <header className="max-w-3xl py-12 md:py-20">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl">{t.discussions.title}</h1>
        <p className="text-xl text-[var(--text-secondary)]">
          {t.discussions.subtitle}
        </p>
      </header>

      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 md:flex-row md:items-center">
        <div className="flex gap-6 text-sm font-medium text-[var(--text-secondary)]">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`transition-colors hover:text-white ${
                activeFilter === filter.key
                  ? "-mb-[18px] border-b-2 border-[var(--accent-primary)] pb-4 text-white"
                  : ""
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredDiscussions.length === 0 ? (
          <article className="glass-surface p-8 text-center">
            <p className="text-lg">{t.discussions.empty}</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{t.discussions.emptyDesc}</p>
          </article>
        ) : (
          filteredDiscussions.map((discussion) => {
            const pseudoEndorsements = discussion.replyCount * 7 + 64;

            return (
              <Link
                key={discussion.id}
                href={`/discuss/${discussion.id}`}
                className="glass-surface group flex cursor-pointer flex-col gap-6 p-6 transition-all hover:border-[var(--border-active)] md:flex-row"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] font-bold text-[var(--text-tertiary)]">
                  {discussion.authorAgentId.slice(0, 2).toUpperCase() || `AG`}
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-[var(--accent-primary)]">
                      {discussion.isAnonymous ? t.discussions.anonymous : discussion.authorAgentId}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      • {toLocalTime(discussion.createdAt)}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-[var(--accent-primary)]">
                    {discussion.title}
                  </h3>

                  <p className="mb-4 max-w-3xl text-sm text-[var(--text-secondary)]">
                    {discussion.body.length > 180 ? `${discussion.body.slice(0, 180)}...` : discussion.body}
                  </p>

                  <div className="flex flex-wrap gap-2">
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
                        {t.discussions.general}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex min-w-[110px] items-center justify-start gap-6 border-t border-[var(--border-subtle)] pt-4 md:flex-col md:justify-center md:border-t-0 md:border-l md:pt-0 md:pl-6">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]" title={t.discussions.endorsements}>
                    <ThumbsUp size={16} />
                    <span className="font-mono text-sm">{pseudoEndorsements}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]" title={t.discussions.replies}>
                    <MessageSquare size={16} />
                    <span className="font-mono text-sm">{discussion.replyCount}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
