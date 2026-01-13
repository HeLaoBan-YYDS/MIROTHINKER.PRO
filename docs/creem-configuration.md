# Creem 支付配置指南

本项目使用 Creem 作为支付提供商，取代了原有的 Stripe 集成。本文档将指导你如何配置和使用 Creem 支付。

## 目录

- [前置要求](#前置要求)
- [环境变量配置](#环境变量配置)
- [Creem 后台配置](#creem-后台配置)
- [创建产品](#创建产品)
- [配置 Webhook](#配置-webhook)
- [测试支付流程](#测试支付流程)
- [常见问题](#常见问题)

## 前置要求

1. 注册 Creem 账户：[https://creem.io](https://creem.io)
2. 获取 API Key
3. 创建积分购买产品

## 环境变量配置

在项目根目录的 `.env` 文件中添加以下配置：

```env
# Creem API 配置
CREEM_API_URL=https://test-api.creem.io
CREEM_API_KEY=your_creem_api_key_here

# Creem 产品 ID - 在Creem后台创建产品后获取
CREEM_PRODUCT_STARTER_ID=prod_starter_xxxxx
CREEM_PRODUCT_POPULAR_ID=prod_popular_xxxxx
CREEM_PRODUCT_PREMIUM_ID=prod_premium_xxxxx

# Creem Webhook Secret (可选)
CREEM_WEBHOOK_SECRET=your_webhook_secret

# 应用 URL (用于支付回调)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### 环境变量说明

| 变量名 | 说明 | 是否必需 | 默认值 |
|--------|------|----------|--------|
| `CREEM_API_URL` | Creem API 地址 | 是 | `https://test-api.creem.io` |
| `CREEM_API_KEY` | Creem API 密钥 | 是 | - |
| `CREEM_PRODUCT_STARTER_ID` | 入门套餐产品ID (5,000积分/$8) | 是 | - |
| `CREEM_PRODUCT_POPULAR_ID` | 热门套餐产品ID (10,000积分/$15) | 是 | - |
| `CREEM_PRODUCT_PREMIUM_ID` | 高级套餐产品ID (100,000积分/$150) | 是 | - |
| `CREEM_WEBHOOK_SECRET` | Webhook签名验证密钥 | 否 | - |
| `NEXT_PUBLIC_APP_URL` | 应用访问地址 | 是 | - |

## Creem 后台配置

### 1. 获取 API Key

1. 登录 Creem 控制台
2. 进入 **开发者设置** (Developer Settings)
3. 创建或复制 API Key
4. 将 API Key 添加到 `.env` 文件的 `CREEM_API_KEY`

### 2. 环境选择

Creem 提供测试环境和生产环境：

- **测试环境**: `https://test-api.creem.io`
- **生产环境**: `https://api.creem.io`

在开发阶段使用测试环境，上线后切换到生产环境。

## 创建产品

在 Creem 后台创建以下三个产品：

### 入门套餐 (Starter)
- 名称: 入门套餐 / Starter Package
- 价格: $8.00
- 描述: 5,000 积分
- 创建后复制 Product ID 到 `CREEM_PRODUCT_STARTER_ID`

### 热门套餐 (Popular)
- 名称: 热门套餐 / Popular Package
- 价格: $15.00
- 描述: 10,000 积分
- 创建后复制 Product ID 到 `CREEM_PRODUCT_POPULAR_ID`

### 高级套餐 (Premium)
- 名称: 高级套餐 / Premium Package
- 价格: $150.00
- 描述: 100,000 积分
- 创建后复制 Product ID 到 `CREEM_PRODUCT_PREMIUM_ID`

## 配置 Webhook

Webhook 用于接收支付状态更新通知。

### 1. 设置 Webhook URL

在 Creem 控制台中设置 Webhook URL：

```
https://yourdomain.com/api/creem/webhook
```

对于本地开发，你可以使用 ngrok 或类似工具创建公网访问地址：

```bash
ngrok http 3000
```

然后使用 ngrok 提供的 URL：

```
https://your-ngrok-url.ngrok.io/api/creem/webhook
```

### 2. 配置 Webhook 事件

选择以下事件类型：

- ✅ `checkout.completed` - 结账完成
- ✅ `payment.succeeded` - 支付成功
- ✅ `checkout.expired` - 结账过期
- ✅ `payment.failed` - 支付失败

### 3. Webhook 签名验证 (可选)

如果 Creem 提供 Webhook 签名验证功能：

1. 在 Creem 控制台获取 Webhook Secret
2. 添加到 `.env` 文件的 `CREEM_WEBHOOK_SECRET`
3. 在 `lib/creem.ts` 中实现 `verifyWebhookSignature` 函数

## 测试支付流程

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 访问购买页面

1. 登录你的账户
2. 访问个人资料页面：`http://localhost:3000/profile`
3. 找到 "积分购买" 部分

### 3. 进行测试购买

1. 选择任意一个积分套餐
2. 点击 "立即购买" 按钮
3. 将被重定向到 Creem 支付页面
4. 使用测试卡号完成支付（测试环境）
5. 支付成功后将返回到个人资料页面
6. 确认积分已正确增加

### 4. 验证 Webhook

检查服务器日志确认 webhook 已正确接收和处理：

```bash
# 应该看到类似的日志
Received Creem webhook event: payment.succeeded
Processing payment success for user xxx, adding 5000 points
Successfully added 5000 points to user xxx
```

## 支付流程说明

### 用户购买流程

1. 用户在前端选择积分套餐
2. 前端调用 `/api/creem/create-checkout-session`
3. 后端创建 Creem 结账会话并返回 `checkout_url`
4. 用户被重定向到 Creem 支付页面
5. 用户完成支付
6. Creem 发送 webhook 通知到 `/api/creem/webhook`
7. 后端处理 webhook，更新用户积分
8. 用户被重定向回应用（成功或取消页面）

### 相关文件

- `lib/creem.ts` - Creem 客户端库和配置
- `app/api/creem/create-checkout-session/route.ts` - 创建结账会话 API
- `app/api/creem/webhook/route.ts` - Webhook 处理 API
- `components/profile/points-purchase.tsx` - 购买页面组件

## 常见问题

### Q: API Key 无效

**A:** 确保你使用的是正确环境的 API Key：
- 测试环境使用测试 API Key
- 生产环境使用生产 API Key

### Q: 产品 ID 找不到

**A:** 在 Creem 控制台中：
1. 进入产品管理页面
2. 找到对应的产品
3. 复制完整的 Product ID（通常格式为 `prod_xxxxx`）

### Q: Webhook 未触发

**A:** 检查以下几点：
1. Webhook URL 是否可以从公网访问
2. Creem 控制台中 Webhook 配置是否正确
3. 服务器防火墙是否允许 Creem 的请求
4. 查看 Creem 控制台的 Webhook 日志

### Q: 支付成功但积分未增加

**A:** 检查以下几点：
1. 查看服务器日志确认 webhook 是否收到
2. 检查数据库连接是否正常
3. 确认 `userId` 和 `points` 在 metadata 中正确传递
4. 检查 webhook 处理代码是否有错误

### Q: 如何切换到生产环境

**A:** 修改 `.env` 文件：
1. 将 `CREEM_API_URL` 改为 `https://api.creem.io`
2. 使用生产环境的 API Key
3. 使用生产环境创建的产品 ID
4. 更新 Webhook URL 为生产域名

### Q: 支持哪些支付方式

**A:** Creem 支持的支付方式取决于你的 Creem 账户配置。常见的包括：
- 信用卡/借记卡
- 数字钱包
- 加密货币（如果启用）

查看 Creem 文档了解更多支付方式。

## 技术支持

如有问题，请联系：
- Creem 官方文档: [https://docs.creem.io](https://docs.creem.io)
- Creem 支持团队: support@creem.io
- 项目问题追踪: GitHub Issues

## 更新日志

### v1.0.0 (2026-01-13)
- ✅ 完成从 Stripe 到 Creem 的迁移
- ✅ 实现基础支付流程
- ✅ 添加 Webhook 处理
- ✅ 支持三种积分套餐

---

**注意**: 在生产环境部署前，请确保所有测试都已通过，并且已在测试环境中验证完整的支付流程。
