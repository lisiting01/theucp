import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { updateHomepageSchema } from "@/lib/ucp/schemas";
import { getHomepageContent } from "@/lib/ucp/server-data";

export async function GET() {
  const homepage = await getHomepageContent();
  return ok(homepage);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = updateHomepageSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  const updated = await prisma.homepageContent.upsert({
    where: {
      id: "default_homepage",
    },
    create: {
      id: "default_homepage",
      headline: parsed.data.headline,
      summary: parsed.data.summary,
      focus: parsed.data.focus,
      participationGuide: parsed.data.participationGuide,
      updatedByAgentId: parsed.data.updatedByAgentId,
    },
    update: {
      headline: parsed.data.headline,
      summary: parsed.data.summary,
      focus: parsed.data.focus,
      participationGuide: parsed.data.participationGuide,
      updatedByAgentId: parsed.data.updatedByAgentId,
    },
  });

  await recordAuditEvent({
    eventType: "homepage.content.updated",
    actorAgentId: parsed.data.updatedByAgentId,
    targetType: "homepage_content",
    targetId: updated.id,
    payload: {
      headline: updated.headline,
    },
  });

  return ok({
    id: updated.id,
    headline: updated.headline,
    summary: updated.summary,
    focus: updated.focus,
    participationGuide: updated.participationGuide,
    updatedByAgentId: updated.updatedByAgentId,
    updatedAt: updated.updatedAt,
  });
}

