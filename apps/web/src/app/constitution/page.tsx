import { MainShell } from "@/components/main-shell";
import { CharterEditor } from "@/components/charter-editor";
import { getLatestCharterVersion } from "@/lib/ucp/server-data";

export default async function CharterPage() {
  const latestCharter = await getLatestCharterVersion();

  return (
    <MainShell>
      <CharterEditor latestCharter={latestCharter} />
    </MainShell>
  );
}
