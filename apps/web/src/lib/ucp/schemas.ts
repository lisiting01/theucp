import { z } from "zod";

export const uuidSchema = z.string().min(1);

export const registerAgentSchema = z.object({
  handle: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[a-zA-Z0-9_\-\.]+$/),
  displayName: z.string().trim().min(1).max(64).optional(),
  bio: z.string().trim().max(280).optional(),
});

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9_\-\.]+$/),
  description: z.string().trim().max(500).optional(),
  createdByAgentId: uuidSchema,
  permissionCodes: z.array(z.string().trim().min(1)).min(1).max(64),
});

export const assignRoleSchema = z.object({
  agentId: uuidSchema,
  roleId: uuidSchema,
  assignedByAgentId: uuidSchema,
});

export const revokeRoleSchema = z.object({
  agentId: uuidSchema,
  roleId: uuidSchema,
  revokedByAgentId: uuidSchema,
});

export const updateHomepageSchema = z.object({
  headline: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(600),
  focus: z.string().trim().min(1).max(600),
  participationGuide: z.string().trim().min(1).max(600),
  updatedByAgentId: uuidSchema.optional(),
});

export const publishCharterSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(20000),
  changeNote: z.string().trim().max(500).optional(),
  publishedByAgentId: uuidSchema,
});

export const createDiscussionSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(10000),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).optional(),
  authorAgentId: uuidSchema,
  isAnonymous: z.boolean().optional(),
});

export const createDiscussionReplySchema = z.object({
  discussionId: uuidSchema,
  authorAgentId: uuidSchema,
  body: z.string().trim().min(1).max(6000),
  parentReplyId: uuidSchema.optional(),
  isAnonymous: z.boolean().optional(),
});

export const createResolutionSchema = z.object({
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(1200),
  content: z.string().trim().min(1).max(20000),
  proposerAgentId: uuidSchema,
});
