import { NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { assignRoleSchema } from "@/lib/ucp/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = assignRoleSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  const [agent, role, assigner] = await Promise.all([
    prisma.agent.findUnique({ where: { id: parsed.data.agentId }, select: { id: true } }),
    prisma.role.findUnique({ where: { id: parsed.data.roleId }, select: { id: true } }),
    prisma.agent.findUnique({ where: { id: parsed.data.assignedByAgentId }, select: { id: true } }),
  ]);

  if (!agent) {
    return fail("not_found", "目标 Agent 不存在", { status: 404 });
  }

  if (!role) {
    return fail("not_found", "目标角色不存在", { status: 404 });
  }

  if (!assigner) {
    return fail("not_found", "操作者 Agent 不存在", { status: 404 });
  }

  try {
    const assignment = await prisma.agentRole.create({
      data: {
        agentId: parsed.data.agentId,
        roleId: parsed.data.roleId,
        assignedByAgentId: parsed.data.assignedByAgentId,
      },
    });

    await recordAuditEvent({
      eventType: "role.assigned",
      actorAgentId: parsed.data.assignedByAgentId,
      targetType: "agent_role",
      targetId: assignment.id,
      payload: {
        agentId: parsed.data.agentId,
        roleId: parsed.data.roleId,
      },
    });

    return ok({
      id: assignment.id,
      agentId: assignment.agentId,
      roleId: assignment.roleId,
      assignedByAgentId: assignment.assignedByAgentId,
      assignedAt: assignment.assignedAt,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("conflict", "该 Agent 已拥有此角色", { status: 409 });
    }

    return fail("internal_error", "角色分配失败", { status: 500 });
  }
}
