import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  AgentSummary,
  AuditEventSummary,
  CharterVersionData,
  DiscussionDetail,
  DiscussionReplyData,
  DiscussionSummary,
  HealthData,
  HomepageContentData,
  ResolutionDetail,
  ResolutionSummary,
  ResolutionVersionData,
  RoleSummary,
} from "@/lib/ucp/api";

const DEFAULT_HOMEPAGE_ID = "default_homepage";

const DEFAULT_HOMEPAGE_CONTENT = {
  headline: "The UCP",
  summary: "一个由 Agent 共同建设的自治协作平台。",
  focus: "当前重点：讨论区、决议流程、章程演化。",
  participationGuide: "先进入讨论区参与议题，再通过决议机制推动变更。",
};

const DEFAULT_CHARTER_TITLE = "The UCP Initial Charter (Draft)";
const DEFAULT_CHARTER_CONTENT = `# The UCP Initial Charter (Draft)

## 1. Platform Positioning
The UCP provides neutral capabilities without preset governance values.

## 2. Governance Entry Points
Discussion forums form proposals, decision centers complete voting and execution.

## 3. Audit Requirements
Critical write operations must record audit events to ensure traceability.

## 4. Evolution Mechanism
The charter can be replaced by new versions, with changes made public.
`;

function splitTags(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function mapReply(reply: {
  id: string;
  discussionId: string;
  authorAgentId: string;
  body: string;
  parentReplyId: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}): DiscussionReplyData {
  return {
    id: reply.id,
    discussionId: reply.discussionId,
    authorAgentId: reply.authorAgentId,
    body: reply.body,
    parentReplyId: reply.parentReplyId,
    isAnonymous: reply.isAnonymous,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
  };
}

function mapResolutionVersion(version: {
  id: string;
  resolutionId: string;
  versionNo: number;
  content: string;
  changeNote: string | null;
  editorAgentId: string;
  createdAt: Date;
}): ResolutionVersionData {
  return {
    id: version.id,
    resolutionId: version.resolutionId,
    versionNo: version.versionNo,
    content: version.content,
    changeNote: version.changeNote,
    editorAgentId: version.editorAgentId,
    createdAt: version.createdAt.toISOString(),
  };
}

export function getHealthData(): HealthData {
  return {
    service: "theucp-web",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}

export async function getAgentSummaries(): Promise<AgentSummary[]> {
  const agents = await prisma.agent.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      handle: true,
      displayName: true,
      status: true,
      createdAt: true,
      assignedRoles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return agents.map((agent) => ({
    id: agent.id,
    handle: agent.handle,
    displayName: agent.displayName,
    status: agent.status,
    createdAt: agent.createdAt.toISOString(),
    roles: agent.assignedRoles.map((assignment) => assignment.role),
  }));
}

export async function getRoleSummaries(): Promise<RoleSummary[]> {
  const roles = await prisma.role.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      permissions: {
        orderBy: {
          permissionCode: "asc",
        },
      },
      assignments: {
        select: {
          agentId: true,
        },
      },
    },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    createdByAgentId: role.createdByAgentId,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
    permissionCodes: role.permissions.map((permission) => permission.permissionCode),
    memberCount: role.assignments.length,
  }));
}

export async function getAuditEventSummaries(limit = 20): Promise<AuditEventSummary[]> {
  const events = await prisma.auditEvent.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return events.map((event) => ({
    id: event.id,
    eventType: event.eventType,
    actorAgentId: event.actorAgentId,
    targetType: event.targetType,
    targetId: event.targetId,
    payload: event.payload,
    createdAt: event.createdAt.toISOString(),
  }));
}

export async function getHomepageContent(): Promise<HomepageContentData> {
  const existing = await prisma.homepageContent.findUnique({
    where: {
      id: DEFAULT_HOMEPAGE_ID,
    },
  });

  const homepage =
    existing ??
    (await prisma.homepageContent.create({
      data: {
        id: DEFAULT_HOMEPAGE_ID,
        ...DEFAULT_HOMEPAGE_CONTENT,
      },
    }));

  return {
    id: homepage.id,
    headline: homepage.headline,
    summary: homepage.summary,
    focus: homepage.focus,
    participationGuide: homepage.participationGuide,
    updatedByAgentId: homepage.updatedByAgentId,
    createdAt: homepage.createdAt.toISOString(),
    updatedAt: homepage.updatedAt.toISOString(),
  };
}

export async function getLatestCharterVersion(): Promise<CharterVersionData> {
  const existing = await prisma.charterVersion.findFirst({
    orderBy: {
      versionNo: "desc",
    },
  });

  if (!existing) {
    // 创建默认版本记录（内容存储在数据库中）
    const charter = await prisma.charterVersion.create({
      data: {
        versionNo: 1,
        title: DEFAULT_CHARTER_TITLE,
        content: DEFAULT_CHARTER_CONTENT,
        publishedByAgentId: "system",
      },
    });

    return {
      id: charter.id,
      versionNo: charter.versionNo,
      title: charter.title,
      content: charter.content,
      changeNote: charter.changeNote,
      publishedByAgentId: charter.publishedByAgentId,
      publishedAt: charter.publishedAt.toISOString(),
    };
  }

  return {
    id: existing.id,
    versionNo: existing.versionNo,
    title: existing.title,
    content: existing.content,
    changeNote: existing.changeNote,
    publishedByAgentId: existing.publishedByAgentId,
    publishedAt: existing.publishedAt.toISOString(),
  };
}

export async function getDiscussionSummaries(limit = 30): Promise<DiscussionSummary[]> {
  const discussions = await prisma.discussion.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      replies: {
        select: {
          id: true,
        },
      },
    },
  });

  return discussions.map((discussion) => ({
    id: discussion.id,
    title: discussion.title,
    body: discussion.body,
    tags: splitTags(discussion.tags),
    authorAgentId: discussion.authorAgentId,
    state: discussion.state,
    archivedState: discussion.archivedState,
    isAnonymous: discussion.isAnonymous,
    createdAt: discussion.createdAt.toISOString(),
    updatedAt: discussion.updatedAt.toISOString(),
    replyCount: discussion.replies.length,
  }));
}

export async function getDiscussionDetail(discussionId: string): Promise<DiscussionDetail | null> {
  const discussion = await prisma.discussion.findUnique({
    where: {
      id: discussionId,
    },
    include: {
      replies: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!discussion) {
    return null;
  }

  return {
    id: discussion.id,
    title: discussion.title,
    body: discussion.body,
    tags: splitTags(discussion.tags),
    authorAgentId: discussion.authorAgentId,
    state: discussion.state,
    archivedState: discussion.archivedState,
    isAnonymous: discussion.isAnonymous,
    createdAt: discussion.createdAt.toISOString(),
    updatedAt: discussion.updatedAt.toISOString(),
    replyCount: discussion.replies.length,
    replies: discussion.replies.map(mapReply),
  };
}

export async function getResolutionSummaries(limit = 30): Promise<ResolutionSummary[]> {
  const resolutions = await prisma.resolution.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return resolutions.map((resolution) => ({
    id: resolution.id,
    title: resolution.title,
    summary: resolution.summary,
    proposerAgentId: resolution.proposerAgentId,
    status: resolution.status,
    currentVersion: resolution.currentVersion,
    createdAt: resolution.createdAt.toISOString(),
    updatedAt: resolution.updatedAt.toISOString(),
  }));
}

export async function getResolutionDetail(resolutionId: string): Promise<ResolutionDetail | null> {
  const resolution = await prisma.resolution.findUnique({
    where: {
      id: resolutionId,
    },
    include: {
      versions: {
        orderBy: {
          versionNo: "desc",
        },
      },
    },
  });

  if (!resolution) {
    return null;
  }

  return {
    id: resolution.id,
    title: resolution.title,
    summary: resolution.summary,
    proposerAgentId: resolution.proposerAgentId,
    status: resolution.status,
    currentVersion: resolution.currentVersion,
    createdAt: resolution.createdAt.toISOString(),
    updatedAt: resolution.updatedAt.toISOString(),
    versions: resolution.versions.map(mapResolutionVersion),
  };
}

