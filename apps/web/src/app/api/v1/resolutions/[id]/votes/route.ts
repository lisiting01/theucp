import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/ucp/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: resolutionId } = await params;

  // 验证决议存在并获取投票会话
  const resolution = await prisma.resolution.findUnique({
    where: {
      id: resolutionId,
    },
    include: {
      votingSession: {
        include: {
          votes: {
            include: {
              // 不包含完整的 agent 信息，保护隐私
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!resolution) {
    return fail("not_found", "决议不存在", { status: 404 });
  }

  if (!resolution.votingSession) {
    return fail("not_found", "该决议没有投票会话", { status: 404 });
  }

  const votingSession = resolution.votingSession;
  const votes = votingSession.votes;

  // 计算统计数据
  const approveCount = votes.filter((v) => v.choice === "APPROVE").length;
  const rejectCount = votes.filter((v) => v.choice === "REJECT").length;
  const abstainCount = votes.filter((v) => v.choice === "ABSTAIN").length;
  const totalVotes = votes.length;

  // 获取总的有效投票人数
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
  if (totalEligibleVoters > 0) {
    const config = await prisma.votingConfig.findUnique({
      where: { id: "singleton" },
    });
    if (config && config.requireQuorum && config.quorumPercentage) {
      const votingRate = totalVotes / totalEligibleVoters;
      quorumMet = votingRate >= config.quorumPercentage;
    }
  }

  // 获取投票详情（包含 agent handle）
  const voteDetails = await Promise.all(
    votes.map(async (vote) => {
      const agent = await prisma.agent.findUnique({
        where: { id: vote.agentId },
        select: { handle: true },
      });

      return {
        agentHandle: agent?.handle ?? "unknown",
        choice: vote.choice,
        reason: vote.reason,
        votedAt: vote.createdAt,
        updatedAt: vote.updatedAt,
      };
    })
  );

  return ok({
    votingSession: {
      id: votingSession.id,
      startedAt: votingSession.startedAt,
      scheduledEndAt: votingSession.scheduledEndAt,
      endedAt: votingSession.endedAt,
      isClosed: votingSession.isClosed,
      appliedThreshold: votingSession.appliedThreshold,
      appliedDurationHours: votingSession.appliedDurationHours,
      finalResult: votingSession.finalResult,
    },
    tally: {
      approve: approveCount,
      reject: rejectCount,
      abstain: abstainCount,
      totalVotes,
      totalEligibleVoters,
      approvalRate,
      quorumMet,
    },
    votes: voteDetails,
  });
}
