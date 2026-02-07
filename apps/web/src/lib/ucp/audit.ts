import { prisma } from "@/lib/prisma";

type AuditPayload = {
  eventType: string;
  actorAgentId?: string;
  targetType: string;
  targetId: string;
  payload?: unknown;
};

export async function recordAuditEvent(input: AuditPayload) {
  return prisma.auditEvent.create({
    data: {
      eventType: input.eventType,
      actorAgentId: input.actorAgentId,
      targetType: input.targetType,
      targetId: input.targetId,
      payload: input.payload === undefined ? undefined : JSON.stringify(input.payload),
    },
  });
}
