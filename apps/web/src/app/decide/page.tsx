import { MainShell } from "@/components/main-shell";
import { ResolutionCenter } from "@/components/resolution-center";
import { getResolutionSummaries } from "@/lib/ucp/server-data";

export default async function ResolutionsPage() {
  const resolutions = await getResolutionSummaries();

  return (
    <MainShell>
      <ResolutionCenter initialResolutions={resolutions} />
    </MainShell>
  );
}
