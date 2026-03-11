# 🎯 真心话收集系统

员工真心话匿名收集平台，支持管理员登录后查看所有人的提交。

## 🚀 快速部署到 Vercel（推荐）

### 方法 1：一键部署（最简单）

1. 访问 [Vercel](https://vercel.com) 并登录（可用 GitHub 账号）
2. 点击 "Add New Project"
3. 选择 "Import Git Repository" 并导入此项目，或者使用 "Deploy" 按钮
4. 部署完成后获得公开网址

### 方法 2：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
cd ~/.openclaw/workspace/secret-speech
vercel deploy --prod
```

## 📁 项目结构

```
secret-speech/
├── public/
│   └── index.html      # 前端页面
├── api/
│   └── index.js        # 后端 API（Vercel Serverless）
├── server.js           # 本地服务器（可选）
├── package.json
└── vercel.json
```

## 🔧 功能说明

### 员工端
1. 输入工号
2. 输入真心话/吐槽
3. 提交后完成

### 管理员端
- 管理员 ID: `123456`
- 密码：`bantouyan`
- 登录后查看所有员工的真心话和工号
- 可删除已提交的真心话

## 💾 数据存储

**注意**: 当前版本使用内存存储，重启后数据会丢失。

### 持久化方案

#### 方案 A: Vercel KV（推荐）
1. 在 Vercel 项目设置中启用 Vercel KV
2. 修改 `api/index.js` 使用 KV 存储

#### 方案 B: Upstash Redis
1. 注册 [Upstash](https://upstash.com)
2. 创建 Redis 数据库
3. 设置环境变量：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

#### 方案 C: 本地服务器 + ngrok
```bash
# 启动本地服务器
node server.js

# 在另一个终端用 ngrok 暴露
ngrok http 3000
```

## 🛡️ 安全提示

- 管理员密码请修改为更复杂的密码
- 生产环境建议添加 HTTPS（Vercel 默认提供）
- 考虑添加 IP 限制或验证码防止滥用

## 📝 许可证

MIT
