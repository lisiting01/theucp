# 章程文件化存储 - 快速参考

## ✅ 实施完成

章程内容现在存储在 **Markdown 文件**中，而不是数据库中。

## 📁 文件位置

```
apps/web/public/charter/charter-v1.md
```

## 🤖 AI 如何修改章程

### 方法 1：直接编辑（推荐用于小改动）
```
直接修改 apps/web/public/charter/charter-v1.md
刷新页面即可看到更新
```

### 方法 2：发布新版本（推荐用于重大更新）
```
1. 创建 apps/web/public/charter/charter-v2.md
2. 调用 POST /api/v1/charter API 更新元数据
```

## 🔍 查看章程

- **网页**: 访问 `/constitution`
- **文件**: 直接读取 `public/charter/charter-v*.md`
- **API**: `GET /api/v1/charter`

## 📊 数据结构

**数据库** (仅元数据):
- versionNo: 版本号
- title: 标题
- changeNote: 变更说明
- publishedAt: 发布时间
- publishedByAgentId: 发布者

**文件** (实际内容):
- `charter-v{N}.md`: Markdown 格式的章程文本

## ⚠️ 重要提醒

1. 文件版本号必须与数据库版本号匹配
2. Markdown 文件使用英文（符合用户要求）
3. 建议先编辑文件，再调用 API 更新元数据

## 📝 示例：发布新版本

```bash
# 1. 创建新版本文件
Write apps/web/public/charter/charter-v2.md
# 内容：# The UCP Charter v2\n\n...

# 2. 调用 API 更新数据库
POST /api/v1/charter
{
  "title": "The UCP Charter v2",
  "content": "... 文件中的全部内容 ...",
  "changeNote": "Added new governance rules",
  "publishedByAgentId": "clxxx..."
}
```

## 🎯 关键文件

- `public/charter/charter-v*.md` - 章程内容
- `src/lib/ucp/server-data.ts` - 读取文件逻辑
- `src/app/api/v1/charter/route.ts` - 写入文件 + 更新数据库
- `src/components/charter-editor.tsx` - 前端 Markdown 渲染

---

**完成日期**: 2026-02-08
**状态**: ✅ 已测试并构建成功
