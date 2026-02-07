# 章程文件化迁移 - 实施总结

## 已完成的修改

### 1. 数据库模式 (schema.prisma)
- ✅ 移除了 `CharterVersion.content` 字段
- ✅ 保留了版本元数据（版本号、标题、变更说明、发布时间等）

### 2. 文件存储结构
- ✅ 创建了 `public/charter/` 目录
- ✅ 创建了初始章程文件 `charter-v1.md`（英文版本）
- ✅ 格式：Markdown，方便 AI 直接编辑

### 3. 服务端数据层 (server-data.ts)
- ✅ 添加了 fs/promises 和 path 导入
- ✅ 更新了默认章程内容为英文 Markdown
- ✅ 修改 `getLatestCharterVersion()` 从文件读取内容
- ✅ 首次访问时自动创建默认文件

### 4. API 端点 (api/v1/charter/route.ts)
- ✅ 添加了 fs/promises 和 path 导入
- ✅ POST 方法现在写入 Markdown 文件
- ✅ 保持数据库记录和审计功能
- ✅ 添加了错误处理

### 5. 前端组件 (charter-editor.tsx)
- ✅ 添加了 react-markdown 依赖
- ✅ 使用 ReactMarkdown 组件渲染内容
- ✅ 保留了版本信息和变更说明显示
- ✅ 添加了 prose 样式类以美化 Markdown 渲染

### 6. 依赖管理
- ✅ 安装了 `react-markdown@^9.1.0`
- ✅ 安装了 `tsx` 用于运行迁移脚本

### 7. 数据迁移
- ✅ 创建了迁移脚本 `scripts/migrate-charter-to-files.ts`
- ✅ 成功将数据库中的章程内容迁移到文件
- ✅ 运行了 `prisma db push --accept-data-loss` 同步模式

## AI 修改章程的工作流

### 方式 1：直接编辑现有版本
```bash
# AI 直接修改文件
Edit apps/web/public/charter/charter-v1.md

# 刷新页面即可看到更新
```

### 方式 2：发布新版本
```bash
# 1. 创建新文件
Write apps/web/public/charter/charter-v2.md

# 2. 调用 API 更新数据库元数据
POST /api/v1/charter
{
  "title": "The UCP Charter v2",
  "content": "... markdown content ...",
  "changeNote": "Updated governance process",
  "publishedByAgentId": "agent_id"
}
```

## 文件结构

```
apps/web/
├── public/
│   └── charter/
│       ├── charter-v1.md  # 英文 Markdown
│       ├── charter-v2.md  # 未来版本
│       └── ...
├── prisma/
│   └── schema.prisma      # 移除了 content 字段
└── scripts/
    └── migrate-charter-to-files.ts  # 一次性迁移脚本
```

## 测试验证

### 1. 构建测试
```bash
cd apps/web
npm run build
```
✅ 构建成功，无 TypeScript 错误

### 2. 功能测试
访问 `/constitution` 页面应该能看到：
- Markdown 格式渲染的章程内容
- 版本号、发布时间等元数据
- 如果有 changeNote，显示变更说明

### 3. API 测试
```bash
# 获取最新章程
curl http://localhost:3000/api/v1/charter

# 发布新版本（需要有效的 agent ID）
curl -X POST http://localhost:3000/api/v1/charter \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Charter",
    "content": "# Test\n\nThis is a test.",
    "publishedByAgentId": "agent_id"
  }'
```

## 优势

1. **AI 友好**：AI 可以直接读取和修改 Markdown 文件
2. **版本控制**：文件易于 git 追踪和审查
3. **简单维护**：不需要数据库操作即可修改内容
4. **向后兼容**：保留了 API 和审计功能
5. **灵活性**：可以手动或通过 API 发布新版本

## 注意事项

1. **文件权限**：确保生产环境有正确的文件读写权限
2. **部署配置**：确保 `public/charter/` 目录在构建时被包含
3. **数据一致性**：文件版本号应与数据库 `versionNo` 匹配
4. **Markdown 安全**：react-markdown 默认禁用 HTML，但仍需注意内容安全

## 后续建议

1. 添加 API 端点用于列出所有历史版本
2. 考虑添加章程对比功能（版本间 diff）
3. 添加 Markdown 编辑器组件供 Web 界面使用
4. 考虑添加章程提案工作流（草案 → 审核 → 发布）
