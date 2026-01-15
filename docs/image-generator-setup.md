# 图像生成器功能设置指南

## 功能概述

本项目已集成 Seedream-4.5 图像生成功能，支持：
- ✅ 文本生成图像（Text-to-Image）
- ✅ 图生图（Image-to-Image）
- ✅ 积分扣费与自动退款
- ✅ 用户鉴权与权限控制
- ✅ 任务状态实时查询
- ✅ 24小时有效期提醒

## 环境配置

### 1. 添加 API 密钥

在项目根目录的 `.env` 或 `.env.local` 文件中添加：

```env
# Apimart API 密钥
APIMART_API_KEY=your_api_key_here
```

获取 API Key：访问 [API Key 管理页面](https://apimart.ai/console/token)

### 2. 运行数据库迁移

```bash
# 生成迁移文件（如果需要）
pnpm db:generate

# 执行迁移
pnpm db:push
```

或手动执行 SQL 迁移文件：

```bash
psql $DATABASE_URL -f drizzle/0005_add_image_generation_tasks.sql
```

## 文件结构

### 后端文件

```
lib/
├── schema.ts                          # 添加了 imageGenerationTasks 表定义
└── image-generator-config.ts          # 图像生成器配置和计费规则

app/api/
├── generate-image/
│   ├── route.ts                       # POST - 提交图像生成任务
│   └── status/
│       └── route.ts                   # GET - 查询任务状态
```

### 前端文件

```
components/dashboard/
└── image-generator.tsx                # 图像生成器主组件

app/[locale]/dashboard/generator/
└── page.tsx                          # 图像生成器页面
```

### 数据库迁移

```
drizzle/
└── 0005_add_image_generation_tasks.sql  # 创建 imageGenerationTasks 表
```

## API 端点

### 1. 提交图像生成任务

**端点**: `POST /api/generate-image`

**请求体**:
```json
{
  "prompt": "可爱的熊猫在竹林中玩耍",
  "size": "1:1",
  "resolution": "2K",
  "n": 1,
  "image_urls": [],  // 可选：用于图生图
  "optimize_prompt_options": {
    "mode": "standard"
  },
  "watermark": false
}
```

**响应**:
```json
{
  "success": true,
  "message": "图像生成任务已提交",
  "data": {
    "task_id": "task_01K8SGYNNNVBQTXNR4MM964S7K",
    "status": "submitted",
    "costPoints": 10,
    "remainingPoints": 90
  }
}
```

### 2. 查询任务状态

**端点**: `GET /api/generate-image/status/{task_id}?language=zh`

**查询参数**:
- `language` (可选): 返回内容的语言，支持 zh/en/ko/ja，默认为 en

**响应**:
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

**错误响应**:
```json
{
  "error": {
    "code": 401,
    "message": "身份验证失败，请先登录",
    "type": "authentication_error"
  }
}
```

## 积分计费规则

| 分辨率 | 每张图片消耗积分 |
|--------|------------------|
| 2K     | 10 积分          |
| 4K     | 20 积分          |

**计费逻辑**:
1. 提交任务前先扣除积分
2. 如果 API 调用失败，自动退还积分
3. 所有积分变动都会记录在 `pointsHistory` 表中

## 使用流程

### 用户端操作流程

1. **访问页面**: 导航到 `/dashboard/generator`
2. **输入描述**: 在文本框中详细描述想要生成的图像
3. **选择参数**:
   - 宽高比：1:1, 4:3, 16:9 等
   - 分辨率：2K 或 4K
   - 生成数量：1-15 张
4. **上传参考图**（可选）: 用于图生图功能
5. **查看费用**: 系统自动显示本次生成将消耗的积分
6. **提交生成**: 点击生成按钮
7. **等待完成**: 系统每3秒自动查询一次状态
8. **下载图片**: 生成完成后可下载保存（24小时有效期）

### 技术流程

```
用户提交 
  ↓
服务端鉴权（NextAuth Session）
  ↓
验证参数与计算积分
  ↓
检查用户积分是否足够
  ↓
扣除积分 → 记录历史
  ↓
调用 Apimart API
  ↓
API 成功 → 创建任务记录
API 失败 → 退还积分
  ↓
前端轮询任务状态
  ↓
completed → 显示图片
failed → 显示错误
```

## 错误处理

### 积分不足
```json
{
  "success": false,
  "error": "积分不足",
  "data": {
    "required": 20,
    "current": 5,
    "missing": 15
  }
}
```

### API 调用失败
- 自动退还已扣除的积分
- 在 `pointsHistory` 中记录退款
- 返回详细错误信息

### 轮询超时
- 最多轮询 100 次（约5分钟）
- 超时后提示用户手动刷新
- 任务状态会持久化在数据库中

## 数据库表结构

### imageGenerationTasks 表

| 字段          | 类型      | 说明                          |
|---------------|-----------|-------------------------------|
| id            | text      | 主键，使用 nanoid 生成        |
| userId        | text      | 用户ID（外键）                |
| taskId        | text      | API 返回的任务ID（唯一）      |
| prompt        | text      | 用户输入的提示词              |
| model         | text      | 使用的模型                    |
| size          | text      | 宽高比                        |
| resolution    | text      | 分辨率                        |
| imageCount    | integer   | 生成图片数量                  |
| costPoints    | integer   | 消耗的积分                    |
| status        | text      | 任务状态                      |
| imageUrls     | text      | 生成的图片URLs（JSON数组）    |
| errorMessage  | text      | 失败原因                      |
| refunded      | boolean   | 是否已退还积分                |
| createdAt     | timestamp | 创建时间                      |
| completedAt   | timestamp | 完成时间                      |

## 配置说明

### 修改计费规则

编辑 `lib/image-generator-config.ts`:

```typescript
export const IMAGE_GENERATOR_CONFIG = {
  // 修改积分计费
  PRICING: {
    '2K': 10,  // 修改为你想要的积分数
    '4K': 20,
  },
  
  // 修改轮询间隔
  POLLING_INTERVAL: 3000,  // 毫秒
  
  // 修改最大轮询次数
  MAX_POLLING_ATTEMPTS: 100,
}
```

### 添加更多分辨率

如果 API 支持更多分辨率，可以在配置中添加：

```typescript
PRICING: {
  '1K': 5,   // 新增
  '2K': 10,
  '4K': 20,
  '8K': 40,  // 新增
},
RESOLUTIONS: ['1K', '2K', '4K', '8K'] as const,
```

## 测试

### 测试 API 端点

```bash
# 提交生成任务
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "prompt": "可爱的熊猫在竹林中玩耍",
    "resolution": "2K",
    "size": "1:1",
    "n": 1
  }'

# 查询任务状态
curl http://localhost:3000/api/generate-image/status/TASK_ID?language=zh \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 测试积分扣除与退还

1. 查看用户当前积分
2. 提交一个生成任务
3. 确认积分已扣除
4. 如果 API 失败，确认积分已退还
5. 检查 `pointsHistory` 表中的记录

## 常见问题

### Q: 图片链接过期了怎么办？
A: 生成的图片链接有效期为 24 小时，请及时下载保存到本地。

### Q: 如何修改积分消耗数量？
A: 编辑 `lib/image-generator-config.ts` 中的 `PRICING` 配置。

### Q: 支持批量生成吗？
A: 支持，可以设置 `n` 参数（1-15），但每张图片都会单独计费。

### Q: API 调用失败会扣积分吗？
A: 不会。如果 API 调用失败，系统会自动退还已扣除的积分。

### Q: 如何查看历史生成记录？
A: 所有记录都保存在 `imageGenerationTasks` 表中，可以创建一个历史记录页面查询。

## 后续扩展建议

1. **历史记录页面**: 创建 `/dashboard/generator/history` 显示用户的生成历史
2. **图片存储**: 将生成的图片保存到 S3/OSS，避免24小时过期问题
3. **批量下载**: 支持一键下载所有生成的图片
4. **模板功能**: 预设常用的提示词模板
5. **分享功能**: 允许用户分享生成的图片
6. **高级编辑**: 集成图片编辑工具

## 技术支持

如有问题，请参考：
- [Apimart 官方文档](https://docs.apimart.ai)
- [Seedream-4.5 API 文档](https://docs.apimart.ai/v1/images/generations)
