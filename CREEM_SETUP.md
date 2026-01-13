# Creem 支付集成 - 快速配置指南

## 🎉 集成已完成！

你的项目已经成功从 Stripe 迁移到 Creem 支付系统。以下是配置步骤：

## 📝 环境变量配置

在你的 `.env` 文件中添加以下配置：

```env
# ===========================================
# Creem 支付配置
# ===========================================

# Creem API 地址 (测试环境)
CREEM_API_URL=https://test-api.creem.io

# Creem API Key (在 Creem 控制台获取)
CREEM_API_KEY=creem_test_your_api_key_here

# Creem 产品 ID (在 Creem 后台创建产品后获取)
CREEM_PRODUCT_STARTER_ID=prod_starter_xxxxx    # 5,000积分 - $8
CREEM_PRODUCT_POPULAR_ID=prod_popular_xxxxx    # 10,000积分 - $15
CREEM_PRODUCT_PREMIUM_ID=prod_premium_xxxxx    # 100,000积分 - $150

# Creem Webhook Secret (可选 - 用于验证webhook签名)
CREEM_WEBHOOK_SECRET=your_webhook_secret_here

# 应用 URL (用于支付成功/取消后的回调)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 快速开始步骤

### 1️⃣ 注册 Creem 账户

访问 [Creem 官网](https://creem.io) 注册账户

### 2️⃣ 获取 API Key

1. 登录 Creem 控制台
2. 进入 **开发者设置**
3. 创建或复制你的 API Key
4. 添加到 `.env` 文件的 `CREEM_API_KEY`

### 3️⃣ 创建产品

在 Creem 后台创建以下三个产品：

| 套餐 | 积分 | 价格 | 环境变量 |
|------|------|------|----------|
| 入门套餐 | 5,000 | $8 | `CREEM_PRODUCT_STARTER_ID` |
| 热门套餐 | 10,000 | $15 | `CREEM_PRODUCT_POPULAR_ID` |
| 高级套餐 | 100,000 | $150 | `CREEM_PRODUCT_PREMIUM_ID` |

创建后，将对应的 Product ID 添加到 `.env` 文件。

### 4️⃣ 配置 Webhook

1. 在 Creem 控制台设置 Webhook URL：
   ```
   https://yourdomain.com/api/creem/webhook
   ```

2. 本地开发可以使用 ngrok：
   ```bash
   ngrok http 3000
   ```
   然后使用 ngrok URL：
   ```
   https://your-id.ngrok.io/api/creem/webhook
   ```

3. 选择以下事件：
   - ✅ `checkout.completed`
   - ✅ `payment.succeeded`
   - ✅ `checkout.expired`
   - ✅ `payment.failed`

### 5️⃣ 测试支付流程

```bash
# 启动开发服务器
npm run dev

# 访问购买页面
# http://localhost:3000/profile
```

1. 登录你的账户
2. 进入个人资料页面
3. 在 "积分购买" 部分选择套餐
4. 点击 "立即购买"
5. 完成 Creem 支付页面的支付流程
6. 确认积分已正确增加

## 📁 已创建/修改的文件

### 新建文件：
- ✅ `lib/creem.ts` - Creem 支付客户端库
- ✅ `app/api/creem/create-checkout-session/route.ts` - 创建结账会话 API
- ✅ `app/api/creem/webhook/route.ts` - Webhook 回调处理
- ✅ `docs/creem-configuration.md` - 详细配置文档
- ✅ `CREEM_SETUP.md` - 本文件（快速配置指南）

### 修改文件：
- ✅ `components/profile/points-purchase.tsx` - 更新为使用 Creem
- ✅ `package.json` - 添加 axios 依赖

## 🔧 关键功能

### 支付流程
1. 用户选择积分套餐
2. 创建 Creem 结账会话
3. 重定向到 Creem 支付页面
4. 用户完成支付
5. Creem 发送 webhook 通知
6. 系统自动增加用户积分
7. 用户返回应用

### 积分套餐配置
在 `lib/creem.ts` 中的 `CREEM_PRODUCTS` 定义了三个套餐：

```typescript
export const CREEM_PRODUCTS = {
  starter: {
    id: 'starter',
    name: '入门套餐',
    points: 5000,
    price: 8,
    productId: process.env.CREEM_PRODUCT_STARTER_ID || '',
  },
  popular: {
    id: 'popular',
    name: '热门套餐',
    points: 10000,
    price: 15,
    productId: process.env.CREEM_PRODUCT_POPULAR_ID || '',
    popular: true, // 标记为推荐套餐
  },
  premium: {
    id: 'premium',
    name: '高级套餐',
    points: 100000,
    price: 150,
    productId: process.env.CREEM_PRODUCT_PREMIUM_ID || '',
  },
}
```

## 🔍 调试技巧

### 查看日志
```bash
# 启动开发服务器并查看日志
npm run dev
```

### 常见错误

**错误**: `CREEM_API_KEY is not configured`
- **解决**: 确保 `.env` 文件中设置了 `CREEM_API_KEY`

**错误**: `Product ID not configured`
- **解决**: 在 Creem 后台创建产品并将 Product ID 添加到 `.env`

**错误**: `Webhook not received`
- **解决**: 
  1. 确保 Webhook URL 可从公网访问
  2. 检查 Creem 控制台的 Webhook 配置
  3. 查看 Creem 的 Webhook 日志

### 测试 Webhook（本地）

```bash
# 安装 ngrok
npm install -g ngrok

# 创建隧道
ngrok http 3000

# 使用 ngrok URL 配置 Creem Webhook
```

## 🌍 生产环境部署

部署到生产环境时：

1. **更新 API URL**:
   ```env
   CREEM_API_URL=https://api.creem.io
   ```

2. **使用生产 API Key**:
   ```env
   CREEM_API_KEY=creem_live_your_production_key
   ```

3. **使用生产产品 ID**:
   在生产环境的 Creem 控制台创建产品，并更新环境变量

4. **更新应用 URL**:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   NEXTAUTH_URL=https://yourdomain.com
   ```

5. **配置生产 Webhook**:
   ```
   https://yourdomain.com/api/creem/webhook
   ```

## 📚 更多文档

详细的配置和故障排除指南，请参考：
- 📖 [Creem 配置文档](./docs/creem-configuration.md)
- 🌐 [Creem 官方文档](https://docs.creem.io)

## ❓ 需要帮助？

如遇到问题：
1. 查看 [完整配置文档](./docs/creem-configuration.md)
2. 检查服务器日志
3. 查看 Creem 控制台的事件日志
4. 联系 Creem 技术支持: support@creem.io

---

**注意**: 请确保在生产环境部署前在测试环境中完整测试支付流程！

🎊 **配置完成后即可开始使用 Creem 支付！**
