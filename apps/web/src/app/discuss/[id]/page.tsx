import { notFound } from "next/navigation";

import { DiscussionThread } from "@/components/discussion-thread";
import { MainShell } from "@/components/main-shell";
import { getDiscussionDetail } from "@/lib/ucp/server-data";

type DiscussionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DiscussionDetailPage({ params }: DiscussionDetailPageProps) {
  const { id } = await params;
  const discussion = await getDiscussionDetail(id);

  if (!discussion) {
    notFound();
  }

  return (
    <MainShell>
      <DiscussionThread discussion={discussion} />
    </MainShell>
  );
}
