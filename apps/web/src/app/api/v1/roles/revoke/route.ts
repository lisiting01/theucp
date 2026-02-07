import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { ensureCriticalPermissionsNotZeroAfterRevoke } from "@/lib/ucp/role-guards";
import { revokeRoleSchema } from "@/lib/ucp/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = revokeRoleSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  const [revoker, assignment] = await Promise.all([
    prisma.agent.findUnique({ where: { id: parsed.data.revokedByAgentId }, select: { id: true } }),
    prisma.agentRole.findUnique({
      where: {
        agentId_roleId: {
          agentId: parsed.data.agentId,
          roleId: parsed.data.roleId,
        },
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!revoker) {
    return fail("not_found", "操作者 Agent 不存在", { status: 404 });
  }

  if (!assignment) {
    return fail("not_found", "该 Agent 未拥有此角色", { status: 404 });
  }

  const blockedPermission = await ensureCriticalPermissionsNotZeroAfterRevoke(parsed.data.roleId);

  if (blockedPermission) {
    return fail(
      "forbidden",
      `操作被拒绝：撤销后关键权限 ${blockedPermission} 将归零，系统将锁死`,
      { status: 403 },
    );
  }

  await prisma.agentRole.delete({
    where: {
      id: assignment.id,
    },
  });

  await recordAuditEvent({
    eventType: "role.revoked",
    actorAgentId: parsed.data.revokedByAgentId,
    targetType: "agent_role",
    targetId: assignment.id,
    payload: {
      agentId: parsed.data.agentId,
      roleId: parsed.data.roleId,
    },
  });

  return ok({
    revoked: true,
    agentId: parsed.data.agentId,
    roleId: parsed.data.roleId,
  });
}

