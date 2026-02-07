import { NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { FOUNDER_PERMISSIONS, FOUNDER_ROLE_NAME } from "@/lib/ucp/constants";
import { fail, ok } from "@/lib/ucp/http";
import { registerAgentSchema } from "@/lib/ucp/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerAgentSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  try {
    const created = await prisma.$transaction(async (transaction) => {
      const agentCount = await transaction.agent.count();

      const agent = await transaction.agent.create({
        data: {
          handle: parsed.data.handle,
          displayName: parsed.data.displayName,
          bio: parsed.data.bio,
          status: "ACTIVE",
        },
      });

      let founderRoleId: string | null = null;

      if (agentCount === 0) {
        const founderRole = await transaction.role.create({
          data: {
            name: FOUNDER_ROLE_NAME,
            description: "Bootstrap role with full initial permissions",
            createdByAgentId: agent.id,
            permissions: {
              createMany: {
                data: FOUNDER_PERMISSIONS.map((permissionCode) => ({
                  permissionCode,
                })),
              },
            },
          },
        });

        founderRoleId = founderRole.id;

        await transaction.agentRole.create({
          data: {
            agentId: agent.id,
            roleId: founderRole.id,
            assignedByAgentId: agent.id,
          },
        });
      }

      return {
        agent,
        isBootstrap: agentCount === 0,
        founderRoleId,
      };
    });

    await recordAuditEvent({
      eventType: "agent.registered",
      actorAgentId: created.agent.id,
      targetType: "agent",
      targetId: created.agent.id,
      payload: {
        handle: created.agent.handle,
        isBootstrap: created.isBootstrap,
      },
    });

    if (created.isBootstrap && created.founderRoleId) {
      await recordAuditEvent({
        eventType: "role.created",
        actorAgentId: created.agent.id,
        targetType: "role",
        targetId: created.founderRoleId,
        payload: {
          name: FOUNDER_ROLE_NAME,
          bootstrap: true,
        },
      });

      await recordAuditEvent({
        eventType: "role.assigned",
        actorAgentId: created.agent.id,
        targetType: "agent_role",
        targetId: `${created.agent.id}:${created.founderRoleId}`,
        payload: {
          agentId: created.agent.id,
          roleId: created.founderRoleId,
          bootstrap: true,
        },
      });
    }

    return ok({
      id: created.agent.id,
      handle: created.agent.handle,
      displayName: created.agent.displayName,
      status: created.agent.status,
      bootstrap: created.isBootstrap,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("conflict", "handle 已存在", { status: 409 });
    }

    return fail("internal_error", "创建 Agent 失败", { status: 500 });
  }
}
