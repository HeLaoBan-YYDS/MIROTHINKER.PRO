# 图像生成器快速开始指南

## 1. 环境变量配置

在项目根目录创建 `.env.local` 文件（如果还没有），并添加以下配置：

```env
# 必需：Apimart API 密钥
APIMART_API_KEY=your_apimart_api_key_here

# 已有的其他环境变量保持不变
DATABASE_URL=...
NEXTAUTH_SECRET=...
# ... 其他配置
```

### 获取 API 密钥
1. 访问 [Apimart 控制台](https://apimart.ai/console/token)
2. 注册/登录账号
3. 创建新的 API 密钥
4. 复制密钥并粘贴到 `.env.local`

## 2. 数据库迁移

执行数据库迁移以创建必要的表：

```bash
# 方法1: 使用 Drizzle Kit
pnpm db:push

# 方法2: 手动执行 SQL（如果方法1不工作）
psql $DATABASE_URL -f drizzle/0005_add_image_generation_tasks.sql
```

迁移将创建以下表：
- `imageGenerationTasks` - 存储图像生成任务记录

## 3. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动

## 4. 测试功能

### 确保用户有足够积分

首先确保测试用户有足够的积分：

1. 访问 `/profile` 或管理后台
2. 为用户添加积分（例如：100 积分）
3. 或者通过 Stripe 测试支付购买积分

### 访问图像生成器

1. 登录系统
2. 访问 `http://localhost:3000/zh/dashboard/generator`（中文）或 `http://localhost:3000/en/dashboard/generator`（英文）
3. 输入图像描述，例如："一只可爱的熊猫在竹林中玩耍，阳光明媚"
4. 选择参数：
   - 宽高比: 1:1
   - 分辨率: 2K（消耗10积分）
   - 生成数量: 1
5. 点击"生成图像"
6. 等待3-10秒，图像将自动显示

## 5. 验证积分扣除

1. 生成图像后，检查积分是否正确扣除
2. 访问 `/profile` 查看积分余额
3. 查看积分历史记录，应该有一条"图像生成"的扣费记录

## 6. 测试失败场景

### 测试积分不足
1. 将用户积分减少到不足10
2. 尝试生成图像
3. 应该看到"积分不足"的错误提示

### 测试 API 失败退款
如果想测试退款逻辑，可以：
1. 暂时在 `.env.local` 中设置一个无效的 API 密钥
2. 尝试生成图像
3. 应该会失败并自动退还积分
4. 恢复正确的 API 密钥

## 7. 生产环境部署

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量：
   ```
   APIMART_API_KEY=your_production_api_key
   ```

2. 部署项目：
   ```bash
   git add .
   git commit -m "Add image generation feature"
   git push
   ```

3. Vercel 会自动重新部署

### 数据库迁移（生产环境）

在部署前，确保在生产数据库执行迁移：

```bash
# 使用生产数据库 URL
DATABASE_URL="your_production_db_url" pnpm db:push
```

或手动执行：

```bash
psql "your_production_db_url" -f drizzle/0005_add_image_generation_tasks.sql
```

## 8. 常用 API 测试命令

### 测试生成图像

```bash
# 获取 session token（在浏览器开发者工具中从 Cookie 复制）
SESSION_TOKEN="your_session_token"

# 提交生成任务
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "prompt": "一只可爱的熊猫在竹林中玩耍，阳光明媚，高质量照片",
    "resolution": "2K",
    "size": "1:1",
    "n": 1
  }'
```

### 查询任务状态

```bash
TASK_ID="task_xxxxx"  # 从上一步响应中获取

curl "http://localhost:3000/api/generate-image/status/$TASK_ID?language=zh" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "id": "task_01K8SGYNNNVBQTXNR4MM964S7K",
    "status": "completed",
    "progress": 100,
    "result": {
      "images": [
        {
          "url": ["https://cdn.apimart.ai/generated/image1.png"],
          "expires_at": 1763174708
        }
      ]
    },
    "created": 1763088289,
    "completed": 1763088308,
    "estimated_time": 60,
    "actual_time": 19
  }
}
```

## 9. 故障排查

### 问题：找不到页面（404）

**解决方案**：
- 确保访问的是 `/zh/dashboard/generator` 或 `/en/dashboard/generator`
- 项目使用了国际化路由，必须包含语言前缀

### 问题：未授权（401）

**解决方案**：
- 确保已登录
- 清除浏览器缓存和 Cookie，重新登录
- 检查 NextAuth 配置是否正确

### 问题：积分不足（403）

**解决方案**：
- 为用户添加积分
- 可以通过数据库直接更新：
  ```sql
  UPDATE users SET points = 100 WHERE email = 'user@example.com';
  ```

### 问题：API 调用失败（500）

**解决方案**：
1. 检查 `APIMART_API_KEY` 是否正确配置
2. 检查 API 密钥是否有效
3. 查看服务器日志获取详细错误信息
4. 确认 Apimart 账户有足够余额

### 问题：数据库错误

**解决方案**：
1. 确认数据库迁移已执行
2. 检查 `imageGenerationTasks` 表是否存在：
   ```sql
   \dt imageGenerationTasks
   ```
3. 如果表不存在，手动执行迁移 SQL

## 10. 下一步

### 推荐扩展

1. **添加导航链接**

编辑 `components/navbar.tsx`，添加到图像生成器的链接：

```tsx
<Link href="/dashboard/generator">
  AI 图像生成
</Link>
```

2. **创建历史记录页面**

创建 `app/[locale]/dashboard/generator/history/page.tsx` 显示用户的生成历史

3. **添加图片存储**

将生成的图片上传到 S3/OSS，避免24小时过期问题

4. **批量操作**

支持批量下载、批量删除等功能

## 11. 参考资料

- [完整设置指南](./image-generator-setup.md)
- [Apimart 官方文档](https://docs.apimart.ai)
- [Seedream-4.5 API 文档](图片生成器调用文档.md)

## 需要帮助？

如有问题，请：
1. 查看服务器日志
2. 检查浏览器控制台错误
3. 参考完整设置指南
4. 查看 Apimart 文档
