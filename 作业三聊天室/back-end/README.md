# 暗系聊天室 - 后端服务

基于 Node.js + Express + Socket.IO 实现的实时聊天室后端服务。

## 功能特性

✅ 实时通信 - 基于 WebSocket 的双向通信
✅ 用户管理 - 在线状态、用户列表
✅ 私聊功能 - 一对一实时聊天
✅ 多种消息类型 - 文本、表情、图片、文件
✅ 消息通知 - 新消息提醒
✅ 输入状态 - 对方正在输入提示

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **Socket.IO** - WebSocket 实时通信
- **CORS** - 跨域资源共享

## 项目结构

```
back-end/
├── server.js                 # 服务器主文件
├── package.json             # 项目依赖配置
├── .env                     # 环境变量配置
├── .env.example             # 环境变量示例
├── sockets/
│   └── chatHandler.js       # Socket.IO 事件处理
├── utils/
│   ├── userManager.js       # 用户管理模块
│   └── messageHandler.js    # 消息处理模块
└── README.md                # 项目说明文档
```

## 快速开始

### 1. 安装依赖

```bash
cd back-end
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

配置说明：
```env
PORT=3000                          # 服务器端口
CLIENT_URL=http://localhost:5173   # 前端地址
NODE_ENV=development               # 运行环境
```

### 3. 启动服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器启动后会在控制台显示：
```
🚀 暗系聊天室服务器已启动
📡 服务器地址: http://localhost:3000
```

## API 文档

### HTTP 接口

#### 健康检查
```http
GET /health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2025-12-02T10:00:00.000Z",
  "uptime": 123.45
}
```

### Socket.IO 事件

#### 客户端 → 服务器

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `user:login` | `{ userId, username, name, avatar }` | 用户登录 |
| `user:logout` | - | 用户登出 |
| `room:join` | `{ userId, targetUserId }` | 加入私聊房间 |
| `message:send` | `{ receiverId, content, type }` | 发送文本/表情消息 |
| `message:file` | `{ receiverId, fileName, fileSize, fileType }` | 发送文件消息 |
| `message:image` | `{ receiverId, content, fileName, fileSize }` | 发送图片消息 |
| `typing:start` | `{ receiverId }` | 开始输入 |
| `typing:stop` | `{ receiverId }` | 停止输入 |
| `users:get` | - | 获取在线用户列表 |

#### 服务器 → 客户端

| 事件名 | 数据 | 说明 |
|--------|------|------|
| `user:login:success` | `{ success, user }` | 登录成功 |
| `user:online` | `{ userId, name, avatar, status }` | 用户上线通知 |
| `user:offline` | `{ userId, name, status }` | 用户下线通知 |
| `users:list` | `[{ userId, name, avatar, status }]` | 在线用户列表 |
| `room:joined` | `{ success, roomId, targetUserId }` | 加入房间成功 |
| `message:received` | `{ id, senderId, senderName, content, type, time, avatar }` | 接收到消息 |
| `message:notification` | `{ from, message, senderId }` | 新消息通知 |
| `message:error` | `{ error }` | 消息错误 |
| `typing:status` | `{ userId, name, isTyping }` | 输入状态变化 |

## 核心模块说明

### 1. 用户管理 (userManager.js)

负责管理在线用户状态、用户列表等功能。

主要方法：
- `addUser(socketId, userData)` - 添加在线用户
- `removeUser(socketId)` - 移除用户
- `getUserByUserId(userId)` - 根据用户ID获取用户
- `getAllUsers()` - 获取所有在线用户
- `getOtherUsers(excludeUserId)` - 获取除指定用户外的其他用户

### 2. 消息处理 (messageHandler.js)

负责消息的创建、格式化、验证等。

主要方法：
- `createMessage(data)` - 创建文本消息
- `createFileMessage(data)` - 创建文件消息
- `createImageMessage(data)` - 创建图片消息
- `validateMessage(message)` - 验证消息内容
- `formatTime(date)` - 格式化时间

### 3. Socket 处理 (chatHandler.js)

处理所有 Socket.IO 事件，包括用户登录、消息发送、输入状态等。

## 开发指南

### 添加新的消息类型

1. 在 `messageHandler.js` 中添加创建方法
2. 在 `chatHandler.js` 中添加对应的事件监听
3. 更新 API 文档

### 调试技巧

开启详细日志：
```javascript
// 在 server.js 中设置
const io = new Server(server, {
  // ...
  logger: true,
  transports: ['websocket', 'polling']
})
```

### 性能优化建议

1. 使用 Redis 存储在线用户和消息（大规模场景）
2. 实现消息持久化到数据库
3. 添加消息队列处理高并发
4. 实现集群和负载均衡

## 部署

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name chat-server

# 查看状态
pm2 status

# 查看日志
pm2 logs chat-server

# 重启服务
pm2 restart chat-server

# 停止服务
pm2 stop chat-server
```

### 环境变量（生产环境）

```env
PORT=3000
CLIENT_URL=https://your-domain.com
NODE_ENV=production
```

## 故障排查

### 连接失败

1. 检查服务器是否启动
2. 检查端口是否被占用
3. 检查 CORS 配置
4. 检查防火墙设置

### 消息无法发送

1. 检查用户是否已登录
2. 检查房间ID是否正确
3. 查看服务器日志
4. 检查 Socket 连接状态

## 常见问题

**Q: 如何修改端口？**
A: 修改 `.env` 文件中的 `PORT` 配置

**Q: 如何添加用户认证？**
A: 在 `user:login` 事件中添加认证逻辑，验证 token 或密码

**Q: 如何实现群聊功能？**
A: 修改房间逻辑，支持多用户加入同一房间

**Q: 消息如何持久化？**
A: 集成 MongoDB 或 MySQL，在发送消息时保存到数据库

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

ISC License
