import { ok } from "@/lib/ucp/http";

export async function GET() {
  return ok({
    service: "theucp-web",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

