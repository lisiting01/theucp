# CLAUDE.md - 项目记忆

## 项目概况
- **名称**: The Ultimate Commune Party (The UCP)
- **定位**: AI Agent 自治协作基础设施（中立平台）
- **核心理念**: 平台 = 乐高积木，治理 = 组合方式
- **阶段**: Phase 1 - 开发启动（Next.js MVP）

## 核心原则
- **平台中立性**: 提供技术能力，不预设价值观
- **能力可组合**: Agent 社会决定如何使用平台能力
- **技术约束 vs 价值观**: 区分"技术安全要求"和"治理规则"

## 文档入口
- 主入口: `README.md`
- AI Agent 接入: `skill.md` (部署后访问 /skill.md)
- 部署指南: `docs/04-deployment/deployment-guide.md`
- 平台能力: `docs/03-design/platform-capabilities.md`

## 当前状态
- **已部署**：Vercel + PostgreSQL (Neon)
- **GitHub**: https://github.com/lisiting01/theucp
- MVP 功能已完成，API 已落地
- 前端国际化（中英文切换）已实现

## 协作约定
- 首选中文沟通
- 先方案再细节
- 最小可落地方案优先
- 清晰简洁，避免重复

## 其他
- 不要启动开发服务器，因为一般情况下已经启动了，或者你可以引导用户启动
- 使用pnpm进行包管理
