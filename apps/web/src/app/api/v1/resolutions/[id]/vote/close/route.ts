import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { closeVotingSchema } from "@/lib/ucp/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: resolutionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = closeVotingSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  // 验证 agent 存在
  const agent = await prisma.agent.findUnique({
    where: {
      id: parsed.data.closedByAgentId,
    },
    select: {
      id: true,
    },
  });

  if (!agent) {
    return fail("not_found", "Agent 不存在", { status: 404 });
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

  // TODO: 权限检查 - 需要有相应权限才能关闭投票
  // 当前版本暂时允许所有 agent 关闭投票

  // 计算投票结果
  const votes = votingSession.votes;
  const approveCount = votes.filter((v) => v.choice === "APPROVE").length;
  const rejectCount = votes.filter((v) => v.choice === "REJECT").length;
  const abstainCount = votes.filter((v) => v.choice === "ABSTAIN").length;
  const totalVotes = approveCount + rejectCount + abstainCount;

  // 获取总的有效投票人数（ACTIVE 状态的 agents）
  const totalEligibleVoters = await prisma.agent.count({
    where: {
      status: "ACTIVE",
    },
  });

  // 计算赞成率（不包括弃权票）
  const effectiveVotes = approveCount + rejectCount;
  const approvalRate = effectiveVotes > 0 ? approveCount / effectiveVotes : 0;

  // 检查是否达到法定人数
  let quorumMet = true;
  if (votingSession.appliedThreshold && totalEligibleVoters > 0) {
    const config = await prisma.votingConfig.findUnique({
      where: { id: "singleton" },
    });
    if (config && config.requireQuorum && config.quorumPercentage) {
      const votingRate = totalVotes / totalEligibleVoters;
      quorumMet = votingRate >= config.quorumPercentage;
    }
  }

  // 确定最终结果
  let finalResult: string;
  let newStatus: "PASSED" | "REJECTED";

  if (!quorumMet) {
    finalResult = "QUORUM_NOT_MET";
    newStatus = "REJECTED";
  } else if (approvalRate >= votingSession.appliedThreshold) {
    finalResult = "PASSED";
    newStatus = "PASSED";
  } else {
    finalResult = "REJECTED";
    newStatus = "REJECTED";
  }

  // 更新投票会话和决议状态
  const result = await prisma.$transaction(async (transaction) => {
    const updatedSession = await transaction.votingSession.update({
      where: {
        id: votingSession.id,
      },
      data: {
        isClosed: true,
        endedAt: new Date(),
        finalResult,
      },
    });

    const updatedResolution = await transaction.resolution.update({
      where: {
        id: resolutionId,
      },
      data: {
        status: newStatus,
      },
    });

    return {
      votingSession: updatedSession,
      resolution: updatedResolution,
    };
  });

  // 记录审计事件
  await recordAuditEvent({
    eventType: "resolution.vote.closed",
    actorAgentId: parsed.data.closedByAgentId,
    targetType: "voting_session",
    targetId: votingSession.id,
    payload: {
      resolutionId,
      finalResult,
      approveCount,
      rejectCount,
      abstainCount,
      totalVotes,
      totalEligibleVoters,
      approvalRate,
      quorumMet,
    },
  });

  return ok({
    resolutionId,
    finalStatus: newStatus,
    finalTally: {
      approve: approveCount,
      reject: rejectCount,
      abstain: abstainCount,
      totalVotes,
      totalEligibleVoters,
      approvalRate,
      threshold: votingSession.appliedThreshold,
      quorumMet,
    },
  });
}
