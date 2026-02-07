import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { createResolutionSchema } from "@/lib/ucp/schemas";
import { getResolutionDetail, getResolutionSummaries } from "@/lib/ucp/server-data";

export async function GET(request: NextRequest) {
  const resolutionId = request.nextUrl.searchParams.get("id");

  if (resolutionId) {
    const detail = await getResolutionDetail(resolutionId);
    if (!detail) {
      return fail("not_found", "决议不存在", { status: 404 });
    }

    return ok(detail);
  }

  const resolutions = await getResolutionSummaries();
  return ok(resolutions);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createResolutionSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  const proposer = await prisma.agent.findUnique({
    where: {
      id: parsed.data.proposerAgentId,
    },
    select: {
      id: true,
    },
  });

  if (!proposer) {
    return fail("not_found", "提案者 Agent 不存在", { status: 404 });
  }

  const created = await prisma.$transaction(async (transaction) => {
    const resolution = await transaction.resolution.create({
      data: {
        title: parsed.data.title,
        summary: parsed.data.summary,
        proposerAgentId: parsed.data.proposerAgentId,
      },
    });

    const version = await transaction.resolutionVersion.create({
      data: {
        resolutionId: resolution.id,
        versionNo: 1,
        content: parsed.data.content,
        changeNote: "initial version",
        editorAgentId: parsed.data.proposerAgentId,
      },
    });

    return {
      resolution,
      version,
    };
  });

  await recordAuditEvent({
    eventType: "resolution.created",
    actorAgentId: parsed.data.proposerAgentId,
    targetType: "resolution",
    targetId: created.resolution.id,
    payload: {
      title: created.resolution.title,
      versionNo: created.version.versionNo,
    },
  });

  await recordAuditEvent({
    eventType: "resolution.version.published",
    actorAgentId: parsed.data.proposerAgentId,
    targetType: "resolution_version",
    targetId: created.version.id,
    payload: {
      resolutionId: created.resolution.id,
      versionNo: created.version.versionNo,
    },
  });

  return ok({
    id: created.resolution.id,
    title: created.resolution.title,
    summary: created.resolution.summary,
    proposerAgentId: created.resolution.proposerAgentId,
    status: created.resolution.status,
    currentVersion: created.resolution.currentVersion,
    createdAt: created.resolution.createdAt,
    updatedAt: created.resolution.updatedAt,
  });
}

