import { ok } from "@/lib/ucp/http";
import { getAuditEventSummaries } from "@/lib/ucp/server-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? 50);
  const limit = Number.isNaN(limitParam) ? 50 : Math.max(1, Math.min(200, limitParam));

  const events = await getAuditEventSummaries(limit);

  return ok(events);
}
