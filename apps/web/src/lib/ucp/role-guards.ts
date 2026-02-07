import { prisma } from "@/lib/prisma";
import { CRITICAL_PERMISSION_CODES, type CriticalPermissionCode } from "@/lib/ucp/constants";

async function countAgentsForPermission(permissionCode: string) {
  const total = await prisma.agentRole.count({
    where: {
      role: {
        permissions: {
          some: {
            permissionCode,
          },
        },
      },
    },
  });

  return total;
}

export async function ensureCriticalPermissionsNotZeroAfterRevoke(
  roleId: string,
): Promise<CriticalPermissionCode | null> {
  const criticalPermissionsInRole = await prisma.rolePermission.findMany({
    where: {
      roleId,
      permissionCode: {
        in: [...CRITICAL_PERMISSION_CODES],
      },
    },
    select: {
      permissionCode: true,
    },
  });

  for (const permission of criticalPermissionsInRole) {
    const total = await countAgentsForPermission(permission.permissionCode);
    if (total <= 1) {
      return permission.permissionCode as CriticalPermissionCode;
    }
  }

  return null;
}

