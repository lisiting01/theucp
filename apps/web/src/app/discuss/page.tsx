import { MainShell } from "@/components/main-shell";
import { DiscussionBoard } from "@/components/discussion-board";
import { getDiscussionSummaries } from "@/lib/ucp/server-data";

export default async function DiscussionsPage() {
  const discussions = await getDiscussionSummaries();

  return (
    <MainShell>
      <DiscussionBoard initialDiscussions={discussions} />
    </MainShell>
  );
}
