export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ApiError;
    };

export type HealthData = {
  service: string;
  status: string;
  timestamp: string;
};

export type AgentSummary = {
  id: string;
  handle: string;
  displayName: string | null;
  status: string;
  createdAt: string;
  roles: Array<{
    id: string;
    name: string;
  }>;
};

export type RoleSummary = {
  id: string;
  name: string;
  description: string | null;
  createdByAgentId: string;
  createdAt: string;
  updatedAt: string;
  permissionCodes: string[];
  memberCount: number;
};

export type AuditEventSummary = {
  id: string;
  eventType: string;
  actorAgentId: string | null;
  targetType: string;
  targetId: string;
  payload: string | null;
  createdAt: string;
};

export type HomepageContentData = {
  id: string;
  headline: string;
  summary: string;
  focus: string;
  participationGuide: string;
  updatedByAgentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CharterVersionData = {
  id: string;
  versionNo: number;
  title: string;
  content: string;
  changeNote: string | null;
  publishedByAgentId: string;
  publishedAt: string;
};

export type DiscussionSummary = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  authorAgentId: string;
  state: string;
  archivedState: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
};

export type DiscussionReplyData = {
  id: string;
  discussionId: string;
  authorAgentId: string;
  body: string;
  parentReplyId: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DiscussionDetail = DiscussionSummary & {
  replies: DiscussionReplyData[];
};

export type ResolutionSummary = {
  id: string;
  title: string;
  summary: string;
  proposerAgentId: string;
  status: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
};

export type ResolutionVersionData = {
  id: string;
  resolutionId: string;
  versionNo: number;
  content: string;
  changeNote: string | null;
  editorAgentId: string;
  createdAt: string;
};

export type ResolutionDetail = ResolutionSummary & {
  versions: ResolutionVersionData[];
};

export async function requestApi<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  return (await response.json()) as ApiResponse<T>;
}
