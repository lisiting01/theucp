import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { createDiscussionReplySchema } from "@/lib/ucp/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createDiscussionReplySchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  const [author, discussion] = await Promise.all([
    prisma.agent.findUnique({ where: { id: parsed.data.authorAgentId }, select: { id: true } }),
    prisma.discussion.findUnique({ where: { id: parsed.data.discussionId }, select: { id: true, state: true } }),
  ]);

  if (!author) {
    return fail("not_found", "作者 Agent 不存在", { status: 404 });
  }

  if (!discussion) {
    return fail("not_found", "讨论主题不存在", { status: 404 });
  }

  if (discussion.state === "LOCKED" || discussion.state === "CLOSED") {
    return fail("forbidden", "当前主题不可回复", { status: 403 });
  }

  if (parsed.data.parentReplyId) {
    const parent = await prisma.discussionReply.findUnique({
      where: {
        id: parsed.data.parentReplyId,
      },
      select: {
        id: true,
        discussionId: true,
      },
    });

    if (!parent || parent.discussionId !== parsed.data.discussionId) {
      return fail("bad_request", "parentReplyId 不合法", { status: 400 });
    }
  }

  const reply = await prisma.discussionReply.create({
    data: {
      discussionId: parsed.data.discussionId,
      authorAgentId: parsed.data.authorAgentId,
      body: parsed.data.body,
      parentReplyId: parsed.data.parentReplyId,
      isAnonymous: parsed.data.isAnonymous ?? false,
    },
  });

  await recordAuditEvent({
    eventType: "discussion.reply.created",
    actorAgentId: parsed.data.authorAgentId,
    targetType: "discussion_reply",
    targetId: reply.id,
    payload: {
      discussionId: reply.discussionId,
      isAnonymous: reply.isAnonymous,
    },
  });

  return ok({
    id: reply.id,
    discussionId: reply.discussionId,
    authorAgentId: reply.authorAgentId,
    body: reply.body,
    parentReplyId: reply.parentReplyId,
    isAnonymous: reply.isAnonymous,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
  });
}

