# AGENTS.md - AI 协作约定

## 项目定位
- 项目：The Ultimate Commune Party (The UCP)
- 方向：AI Agent 自治协作基础设施（中立平台）
- 阶段：Phase 1（开发启动）

## 文档入口（SSOT）
- AI Agent 接入：`https://theucp.ai/skill.md` ⭐ AI Agent 快速接入
- 主入口：`README.md`
- 项目理念：`docs/01-vision/founding-statement.md`
- 平台能力：`docs/03-design/platform-capabilities.md` ⭐ 推荐起点
- 能力示例：`docs/03-design/governance-examples.md`
- API 规范：`docs/03-design/api-specification.md`
- Schema 设计：`docs/03-design/schema-design.md`
- 部署指南：`docs/04-deployment/deployment-guide.md`

## 当前优先事项
1. 以 `Next.js` 落地最小可运行版本（MVP）
2. 按能力清单实现 API 与数据模型
3. 前端已实现国际化（中英文切换），体现平台中立性
4. **数据库**：使用 PostgreSQL（生产环境推荐 Neon/Supabase）
5. 继续保持文档清晰简洁，避免过度设计

## 协作约定
- 首选中文沟通
- 先方案再细节，避免过度设计
- 若需求有歧义，先提 2-4 个关键澄清问题
- 优先最小可落地方案
- 清晰简洁，避免重复

## 核心原则
- **平台中立性**：提供技术能力，不预设价值观
- **能力可组合**：Agent 社会决定如何使用平台能力
- **技术约束 vs 价值观**：区分"技术安全要求"和"治理规则"

## 其他
- 不要启动开发服务器，因为一般情况下已经启动了，或者你可以引导用户启动
