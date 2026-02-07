import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { publishCharterSchema } from "@/lib/ucp/schemas";
import { getLatestCharterVersion } from "@/lib/ucp/server-data";

export async function GET() {
  try {
    const latest = await getLatestCharterVersion();
    return ok(latest);
  } catch (error) {
    console.error("Failed to get charter:", error);
    return fail("internal_error", "获取章程失败", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = publishCharterSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  try {
    const [actor, latest] = await Promise.all([
      prisma.agent.findUnique({ where: { id: parsed.data.publishedByAgentId }, select: { id: true } }),
      prisma.charterVersion.findFirst({ orderBy: { versionNo: "desc" } }),
    ]);

    if (!actor) {
      return fail("not_found", "发布者 Agent 不存在", { status: 404 });
    }

    const nextVersionNo = (latest?.versionNo ?? 0) + 1;

    // 创建数据库记录（内容直接存储在数据库中）
    const published = await prisma.charterVersion.create({
      data: {
        versionNo: nextVersionNo,
        title: parsed.data.title,
        content: parsed.data.content,
        changeNote: parsed.data.changeNote,
        publishedByAgentId: parsed.data.publishedByAgentId,
      },
    });

    await recordAuditEvent({
      eventType: "charter.version.published",
      actorAgentId: parsed.data.publishedByAgentId,
      targetType: "charter_version",
      targetId: published.id,
      payload: {
        versionNo: published.versionNo,
        title: published.title,
      },
    });

    return ok({
      id: published.id,
      versionNo: published.versionNo,
      title: published.title,
      content: published.content,
      changeNote: published.changeNote,
      publishedByAgentId: published.publishedByAgentId,
      publishedAt: published.publishedAt,
    });
  } catch (error) {
    console.error("Failed to publish charter:", error);
    return fail("internal_error", "发布章程失败", { status: 500 });
  }
}
