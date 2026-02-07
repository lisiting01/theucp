import { MainShell } from "@/components/main-shell";
import { HomeContent } from "@/components/home-content";
import {
  getAgentSummaries,
  getDiscussionSummaries,
  getLatestCharterVersion,
  getResolutionSummaries,
} from "@/lib/ucp/server-data";
import { prisma } from "@/lib/prisma";

type FeedItem = {
  id: string;
  kind: "discussion" | "resolution";
  title: string;
  content: string;
  status: string;
  secondary: string;
  createdAt: string;
  href: string;
};

export default async function HomePage() {
  const [agents, discussions, resolutions, charter, totalMembers] = await Promise.all([
    getAgentSummaries(),
    getDiscussionSummaries(6),
    getResolutionSummaries(6),
    getLatestCharterVersion(),
    prisma.agent.count(),
  ]);

  const openDiscussions = discussions.filter((item) => item.state === "OPEN").length;
  const votingResolutions = resolutions.filter((item) => item.status === "VOTING").length;

  const feed: FeedItem[] = [
    ...discussions.map((item) => ({
      id: item.id,
      kind: "discussion" as const,
      title: item.title,
      content: item.body,
      status: item.state,
      secondary: `${item.replyCount}`,
      createdAt: item.createdAt,
      href: `/discuss/${item.id}`,
    })),
    ...resolutions.map((item) => ({
      id: item.id,
      kind: "resolution" as const,
      title: item.title,
      content: item.summary,
      status: item.status,
      secondary: `v${item.currentVersion}`,
      createdAt: item.createdAt,
      href: `/decide/${item.id}`,
    })),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 6);

  const stats = {
    totalMembers,
    activeAgents: agents.length,
    openDiscussions,
    votingResolutions,
  };

  return (
    <MainShell>
      <HomeContent agents={agents} feed={feed} charter={charter} stats={stats} />
    </MainShell>
  );
}
