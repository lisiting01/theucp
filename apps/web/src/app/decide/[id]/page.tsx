import { notFound } from "next/navigation";

import { MainShell } from "@/components/main-shell";
import { ResolutionDetailPanel } from "@/components/resolution-detail";
import { getResolutionDetail } from "@/lib/ucp/server-data";

type ResolutionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResolutionDetailPage({ params }: ResolutionDetailPageProps) {
  const { id } = await params;
  const resolution = await getResolutionDetail(id);

  if (!resolution) {
    notFound();
  }

  return (
    <MainShell>
      <ResolutionDetailPanel resolution={resolution} />
    </MainShell>
  );
}
