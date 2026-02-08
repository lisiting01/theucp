import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { startVotingSchema } from "@/lib/ucp/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: resolutionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = startVotingSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  // 验证 agent 存在
  const agent = await prisma.agent.findUnique({
    where: {
      id: parsed.data.startedByAgentId,
    },
    select: {
      id: true,
    },
  });

  if (!agent) {
    return fail("not_found", "Agent 不存在", { status: 404 });
  }

  // 验证决议存在
  const resolution = await prisma.resolution.findUnique({
    where: {
      id: resolutionId,
    },
    include: {
      votingSession: true,
    },
  });

  if (!resolution) {
    return fail("not_found", "决议不存在", { status: 404 });
  }

  // 检查决议状态
  if (resolution.status !== "DRAFT") {
    return fail("bad_request", "只能对 DRAFT 状态的决议启动投票", {
      details: { currentStatus: resolution.status },
    });
  }

  // 检查是否已有投票会话
  if (resolution.votingSession) {
    return fail("conflict", "该决议已有投票会话", {
      details: { votingSessionId: resolution.votingSession.id },
      status: 409,
    });
  }

  // TODO: 权限检查 - 需要有 propose_resolution 权限
  // 当前版本暂时允许所有 agent 启动投票

  // 获取投票配置
  let config = await prisma.votingConfig.findUnique({
    where: {
      id: "singleton",
    },
  });

  // 如果配置不存在，创建默认配置
  if (!config) {
    config = await prisma.votingConfig.create({
      data: {
        id: "singleton",
        approvalThreshold: 0.5,
        defaultDurationHours: 72,
        allowAbstain: true,
        allowVoteChange: false,
        requireQuorum: false,
        quorumPercentage: 0.3,
      },
    });
  }

  // 使用提供的时长或默认时长
  const durationHours = parsed.data.durationHours ?? config.defaultDurationHours;
  const scheduledEndAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

  // 创建投票会话并更新决议状态
  const result = await prisma.$transaction(async (transaction) => {
    const votingSession = await transaction.votingSession.create({
      data: {
        resolutionId,
        startedByAgentId: parsed.data.startedByAgentId,
        scheduledEndAt,
        appliedThreshold: config!.approvalThreshold,
        appliedDurationHours: durationHours,
      },
    });

    const updatedResolution = await transaction.resolution.update({
      where: {
        id: resolutionId,
      },
      data: {
        status: "VOTING",
      },
    });

    return {
      votingSession,
      resolution: updatedResolution,
    };
  });

  // 记录审计事件
  await recordAuditEvent({
    eventType: "resolution.vote.started",
    actorAgentId: parsed.data.startedByAgentId,
    targetType: "voting_session",
    targetId: result.votingSession.id,
    payload: {
      resolutionId,
      scheduledEndAt: result.votingSession.scheduledEndAt,
      appliedThreshold: result.votingSession.appliedThreshold,
      appliedDurationHours: result.votingSession.appliedDurationHours,
    },
  });

  return ok({
    votingSessionId: result.votingSession.id,
    resolutionId,
    startedAt: result.votingSession.startedAt,
    scheduledEndAt: result.votingSession.scheduledEndAt,
    appliedThreshold: result.votingSession.appliedThreshold,
    appliedDurationHours: result.votingSession.appliedDurationHours,
  });
}
