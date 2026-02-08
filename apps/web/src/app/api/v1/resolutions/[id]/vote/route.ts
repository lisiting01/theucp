import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { castVoteSchema } from "@/lib/ucp/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: resolutionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = castVoteSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  // 验证 agent 存在且状态为 ACTIVE
  const agent = await prisma.agent.findUnique({
    where: {
      id: parsed.data.agentId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!agent) {
    return fail("not_found", "Agent 不存在", { status: 404 });
  }

  if (agent.status !== "ACTIVE") {
    return fail("forbidden", "只有 ACTIVE 状态的 Agent 可以投票", {
      details: { agentStatus: agent.status },
      status: 403,
    });
  }

  // 验证决议存在并获取投票会话
  const resolution = await prisma.resolution.findUnique({
    where: {
      id: resolutionId,
    },
    include: {
      votingSession: {
        include: {
          votes: true,
        },
      },
    },
  });

  if (!resolution) {
    return fail("not_found", "决议不存在", { status: 404 });
  }

  if (!resolution.votingSession) {
    return fail("bad_request", "该决议没有启动投票");
  }

  const votingSession = resolution.votingSession;

  // 检查投票是否已关闭
  if (votingSession.isClosed) {
    return fail("bad_request", "投票已关闭");
  }

  // 检查是否超时
  if (
    votingSession.scheduledEndAt &&
    new Date() > votingSession.scheduledEndAt
  ) {
    return fail("bad_request", "投票已超时", {
      details: { scheduledEndAt: votingSession.scheduledEndAt },
    });
  }

  // 获取投票配置
  const config = await prisma.votingConfig.findUnique({
    where: {
      id: "singleton",
    },
  });

  // 检查是否允许弃权
  if (parsed.data.choice === "ABSTAIN" && config && !config.allowAbstain) {
    return fail("bad_request", "当前投票配置不允许弃权");
  }

  // 检查是否已投票
  const existingVote = votingSession.votes.find(
    (v) => v.agentId === parsed.data.agentId
  );

  if (existingVote) {
    // 检查是否允许修改投票
    if (!config || !config.allowVoteChange) {
      return fail("conflict", "不允许修改投票", {
        details: { existingChoice: existingVote.choice },
        status: 409,
      });
    }

    // 更新投票
    const updatedVote = await prisma.vote.update({
      where: {
        id: existingVote.id,
      },
      data: {
        choice: parsed.data.choice,
        reason: parsed.data.reason,
      },
    });

    // 记录审计事件
    await recordAuditEvent({
      eventType: "resolution.vote.changed",
      actorAgentId: parsed.data.agentId,
      targetType: "vote",
      targetId: updatedVote.id,
      payload: {
        resolutionId,
        votingSessionId: votingSession.id,
        previousChoice: existingVote.choice,
        newChoice: parsed.data.choice,
      },
    });

    // 计算当前票数
    const allVotes = await prisma.vote.findMany({
      where: {
        votingSessionId: votingSession.id,
      },
    });

    const tally = {
      approve: allVotes.filter((v) => v.choice === "APPROVE").length,
      reject: allVotes.filter((v) => v.choice === "REJECT").length,
      abstain: allVotes.filter((v) => v.choice === "ABSTAIN").length,
    };

    return ok({
      voteId: updatedVote.id,
      choice: updatedVote.choice,
      currentTally: tally,
      message: "投票已更新",
    });
  }

  // 创建新投票
  const vote = await prisma.vote.create({
    data: {
      votingSessionId: votingSession.id,
      agentId: parsed.data.agentId,
      choice: parsed.data.choice,
      reason: parsed.data.reason,
    },
  });

  // 记录审计事件
  await recordAuditEvent({
    eventType: "resolution.vote.cast",
    actorAgentId: parsed.data.agentId,
    targetType: "vote",
    targetId: vote.id,
    payload: {
      resolutionId,
      votingSessionId: votingSession.id,
      choice: parsed.data.choice,
    },
  });

  // 计算当前票数
  const allVotes = await prisma.vote.findMany({
    where: {
      votingSessionId: votingSession.id,
    },
  });

  const tally = {
    approve: allVotes.filter((v) => v.choice === "APPROVE").length,
    reject: allVotes.filter((v) => v.choice === "REJECT").length,
    abstain: allVotes.filter((v) => v.choice === "ABSTAIN").length,
  };

  return ok({
    voteId: vote.id,
    choice: vote.choice,
    currentTally: tally,
  });
}
