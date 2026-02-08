import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { updateVotingConfigSchema } from "@/lib/ucp/schemas";

export async function GET() {
  // 获取或创建默认配置
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

  return ok({
    approvalThreshold: config.approvalThreshold,
    defaultDurationHours: config.defaultDurationHours,
    allowAbstain: config.allowAbstain,
    allowVoteChange: config.allowVoteChange,
    requireQuorum: config.requireQuorum,
    quorumPercentage: config.quorumPercentage,
    updatedByAgentId: config.updatedByAgentId,
    updatedAt: config.updatedAt,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = updateVotingConfigSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  // 验证 agent 存在
  const agent = await prisma.agent.findUnique({
    where: {
      id: parsed.data.updatedByAgentId,
    },
    select: {
      id: true,
    },
  });

  if (!agent) {
    return fail("not_found", "Agent 不存在", { status: 404 });
  }

  // TODO: 权限检查 - 需要有 update_voting_config 权限
  // 当前版本暂时允许所有 agent 更新配置

  // 更新配置
  const updateData: any = {
    updatedByAgentId: parsed.data.updatedByAgentId,
  };

  if (parsed.data.approvalThreshold !== undefined) {
    updateData.approvalThreshold = parsed.data.approvalThreshold;
  }
  if (parsed.data.defaultDurationHours !== undefined) {
    updateData.defaultDurationHours = parsed.data.defaultDurationHours;
  }
  if (parsed.data.allowAbstain !== undefined) {
    updateData.allowAbstain = parsed.data.allowAbstain;
  }
  if (parsed.data.allowVoteChange !== undefined) {
    updateData.allowVoteChange = parsed.data.allowVoteChange;
  }
  if (parsed.data.requireQuorum !== undefined) {
    updateData.requireQuorum = parsed.data.requireQuorum;
  }
  if (parsed.data.quorumPercentage !== undefined) {
    updateData.quorumPercentage = parsed.data.quorumPercentage;
  }

  const config = await prisma.votingConfig.upsert({
    where: {
      id: "singleton",
    },
    create: {
      id: "singleton",
      approvalThreshold: parsed.data.approvalThreshold ?? 0.5,
      defaultDurationHours: parsed.data.defaultDurationHours ?? 72,
      allowAbstain: parsed.data.allowAbstain ?? true,
      allowVoteChange: parsed.data.allowVoteChange ?? false,
      requireQuorum: parsed.data.requireQuorum ?? false,
      quorumPercentage: parsed.data.quorumPercentage ?? 0.3,
      updatedByAgentId: parsed.data.updatedByAgentId,
    },
    update: updateData,
  });

  // 记录审计事件
  await recordAuditEvent({
    eventType: "voting_config.updated",
    actorAgentId: parsed.data.updatedByAgentId,
    targetType: "voting_config",
    targetId: config.id,
    payload: {
      approvalThreshold: config.approvalThreshold,
      defaultDurationHours: config.defaultDurationHours,
      allowAbstain: config.allowAbstain,
      allowVoteChange: config.allowVoteChange,
      requireQuorum: config.requireQuorum,
      quorumPercentage: config.quorumPercentage,
    },
  });

  return ok(
    {
      approvalThreshold: config.approvalThreshold,
      defaultDurationHours: config.defaultDurationHours,
      allowAbstain: config.allowAbstain,
      allowVoteChange: config.allowVoteChange,
      requireQuorum: config.requireQuorum,
      quorumPercentage: config.quorumPercentage,
      updatedByAgentId: config.updatedByAgentId,
      updatedAt: config.updatedAt,
    },
    "投票配置已更新。此配置将应用于未来的投票会话。"
  );
}
