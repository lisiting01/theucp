import { ok } from "@/lib/ucp/http";
import { getAgentSummaries } from "@/lib/ucp/server-data";

export async function GET() {
  const agents = await getAgentSummaries();
  return ok(agents);
}
