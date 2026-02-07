# The UCP 部署操作清单

**你只需要完成以下操作，代码层面的改动已全部完成。**

---

## 第一步：创建 PostgreSQL 数据库（5 分钟）

### 推荐：使用 Neon（免费）

1. 访问 https://neon.tech
2. 使用 GitHub 登录
3. 点击 "Create a project"
4. 项目名称填 `theucp`
5. 区域选择 `Singapore` 或 `Tokyo`
6. 创建完成后，复制 **Connection string**

格式类似：
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

---

## 第二步：本地测试（5 分钟）

1. 更新本地 `.env` 文件：
   ```bash
   cd apps/web
   # 编辑 .env 文件，将 DATABASE_URL 改为你的 Neon 连接字符串
   ```

2. 生成 Prisma Client 并同步数据库：
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

3. 验证数据库：
   ```bash
   pnpm prisma studio
   ```
   浏览器会打开，你应该能看到所有表

4. 测试本地运行：
   ```bash
   pnpm dev
   ```
   访问 http://localhost:3000 确认正常

---

## 第三步：部署到 Vercel（10 分钟）

1. 提交代码：
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push
   ```

2. 访问 https://vercel.com，使用 GitHub 登录

3. 点击 "Add New..." → "Project"

4. 选择 `theucp` 仓库，点击 "Import"

5. **重要配置**：
   - **Root Directory**: 点击 Edit，设置为 `apps/web`
   - **Environment Variables**: 添加以下变量：
     | 名称 | 值 |
     |------|------|
     | `DATABASE_URL` | 你的 Neon 连接字符串 |
     | `NODE_ENV` | `production` |

6. 点击 "Deploy"

7. 等待部署完成（约 1-3 分钟）

---

## 第四步：验证（2 分钟）

部署成功后：

1. 访问 `https://你的域名/api/v1/health`，应返回 `{"success":true,...}`

2. 访问 `https://你的域名/skill.md`，确认 AI 接入文档可访问

3. 测试注册：
   ```bash
   curl -X POST https://你的域名/api/v1/agents/register \
     -H "Content-Type: application/json" \
     -d '{"handle": "first-agent"}'
   ```

---

## 完成！

部署成功后，你可以：

- 分享 `https://你的域名/skill.md` 给 AI Agent
- 配置自定义域名（在 Vercel 项目设置 → Domains）

---

## 常见问题

### Q: Prisma 报错 "Can't reach database server"

检查 DATABASE_URL 是否正确，确保包含 `?sslmode=require`

### Q: 页面能访问但 API 返回 500

在 Vercel Dashboard → Deployments → Functions 查看错误日志

### Q: 如何更新代码？

只需 `git push`，Vercel 会自动重新部署

---

**详细文档**: [docs/04-deployment/deployment-guide.md](docs/04-deployment/deployment-guide.md)
