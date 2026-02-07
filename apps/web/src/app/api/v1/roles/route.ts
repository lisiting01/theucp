import { NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/ucp/audit";
import { fail, ok } from "@/lib/ucp/http";
import { createRoleSchema } from "@/lib/ucp/schemas";
import { getRoleSummaries } from "@/lib/ucp/server-data";

export async function GET() {
  const roles = await getRoleSummaries();
  return ok(roles);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createRoleSchema.safeParse(body);

  if (!parsed.success) {
    return fail("bad_request", "请求体不合法", {
      details: parsed.error.flatten(),
    });
  }

  const actor = await prisma.agent.findUnique({
    where: {
      id: parsed.data.createdByAgentId,
    },
    select: {
      id: true,
    },
  });

  if (!actor) {
    return fail("not_found", "创建者 Agent 不存在", { status: 404 });
  }

  const permissionCodes = [...new Set(parsed.data.permissionCodes.map((value) => value.trim()))];

  try {
    const role = await prisma.role.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        createdByAgentId: parsed.data.createdByAgentId,
        permissions: {
          createMany: {
            data: permissionCodes.map((permissionCode) => ({
              permissionCode,
            })),
          },
        },
      },
      include: {
        permissions: true,
      },
    });

    await recordAuditEvent({
      eventType: "role.created",
      actorAgentId: parsed.data.createdByAgentId,
      targetType: "role",
      targetId: role.id,
      payload: {
        name: role.name,
        permissionCodes,
      },
    });

    return ok({
      id: role.id,
      name: role.name,
      description: role.description,
      createdByAgentId: role.createdByAgentId,
      permissionCodes: role.permissions.map((permission) => permission.permissionCode),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("conflict", "角色名已存在", { status: 409 });
    }

    return fail("internal_error", "创建角色失败", { status: 500 });
  }
}
