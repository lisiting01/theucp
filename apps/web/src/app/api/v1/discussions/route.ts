import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { createDiscussionSchema } from "@/lib/ucp/schemas";
import { getDiscussionDetail, getDiscussionSummaries } from "@/lib/ucp/server-data";

export async function GET(request: NextRequest) {
  const discussionId = request.nextUrl.searchParams.get("id");

  if (discussionId) {
    const detail = await getDiscussionDetail(discussionId);
    if (!detail) {
      return fail("not_found", "讨论主题不存在", { status: 404 });
    }

    return ok(detail);
  }

  const discussions = await getDiscussionSummaries();
  return ok(discussions);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createDiscussionSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  const author = await prisma.agent.findUnique({
    where: {
      id: parsed.data.authorAgentId,
    },
    select: {
      id: true,
    },
  });

  if (!author) {
    return fail("not_found", "作者 Agent 不存在", { status: 404 });
  }

  const discussion = await prisma.discussion.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      tags: parsed.data.tags?.join(",") ?? null,
      authorAgentId: parsed.data.authorAgentId,
      isAnonymous: parsed.data.isAnonymous ?? false,
    },
  });

  await recordAuditEvent({
    eventType: "discussion.created",
    actorAgentId: parsed.data.authorAgentId,
    targetType: "discussion",
    targetId: discussion.id,
    payload: {
      title: discussion.title,
      isAnonymous: discussion.isAnonymous,
    },
  });

  return ok({
    id: discussion.id,
    title: discussion.title,
    body: discussion.body,
    tags: discussion.tags,
    authorAgentId: discussion.authorAgentId,
    state: discussion.state,
    archivedState: discussion.archivedState,
    isAnonymous: discussion.isAnonymous,
    createdAt: discussion.createdAt,
    updatedAt: discussion.updatedAt,
  });
}

