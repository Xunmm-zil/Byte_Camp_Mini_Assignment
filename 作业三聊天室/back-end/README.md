# 暗系聊天室 - 后端服务

基于 Node.js + Express + Socket.IO 实现的实时聊天室后端服务。

## 项目简介

本项目是暗系聊天室的后端服务，负责处理用户连接、消息传输、用户状态管理等核心功能，通过 WebSocket 协议实现实时双向通信。

## 功能特性

- 实时通信 - 基于 WebSocket 的双向通信
- 用户管理 - 在线状态、用户列表维护
- 私聊功能 - 一对一实时聊天
- 多种消息类型 - 文本、表情、图片、文件
- 消息通知 - 新消息提醒推送
- 输入状态 - 对方正在输入提示

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 应用框架
- **Socket.IO** - 实时通信库
- **CORS** - 跨域资源共享中间件

## 项目结构

```
back-end/
├── server.js                 # 服务器主文件
├── test-server.js            # 测试服务器
├── package.json              # 项目依赖配置
├── sockets/
│   └── chatHandler.js        # Socket.IO 事件处理逻辑
├── utils/
│   ├── userManager.js        # 用户管理模块
│   └── messageHandler.js     # 消息处理模块
└── README.md                 # 项目说明文档
```

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 1. 安装依赖

```bash
cd back-end
npm install
```

### 2. 启动服务器

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

### 3. 配置说明

服务器默认配置：
- 端口：3000
- 允许的跨域地址：http://localhost:5173
- 运行环境：development

## API 文��

### HTTP 接口

#### 健康检查

```http
GET /health
```

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2025-12-02T10:00:00.000Z",
  "uptime": 123.45
}
```

### Socket.IO 事件

#### 客户端 → 服务器事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `user:login` | `{ userId, username, name, avatar }` | 用户登录 |
| `user:logout` | - | 用户登出 |
| `room:join` | `{ userId, targetUserId }` | 加入私聊房间 |
| `message:send` | `{ receiverId, content, type }` | 发送消息 |
| `message:file` | `{ receiverId, fileName, fileSize, fileType }` | 发送文件 |
| `message:image` | `{ receiverId, content, fileName, fileSize }` | 发送图片 |
| `typing:start` | `{ receiverId }` | 开始输入 |
| `typing:stop` | `{ receiverId }` | 停止输入 |
| `users:get` | - | 获取在线用户列表 |

#### 服务器 → 客户端事件

| 事件名 | 数据 | 说明 |
|--------|------|------|
| `user:login:success` | `{ success, user }` | 登录成功响应 |
| `user:online` | `{ userId, name, avatar, status }` | 用户上线通知 |
| `user:offline` | `{ userId, name, status }` | 用户下线通知 |
| `users:list` | `[{ userId, name, avatar, status }]` | 在线用户列表 |
| `room:joined` | `{ success, roomId, targetUserId }` | 加入房间成功 |
| `message:received` | `{ id, senderId, senderName, content, type, time, avatar }` | 接收消息 |
| `message:notification` | `{ from, message, senderId }` | 新消息通知 |
| `message:error` | `{ error }` | 消息错误 |
| `typing:status` | `{ userId, name, isTyping }` | 输入状态变化 |

## 核心模块说明

### 用户管理模块 (userManager.js)

负责管理在线用户的状态和信息。

**主要功能：**
- `addUser(socketId, userData)` - 添加在线用户
- `removeUser(socketId)` - 移除用户
- `getUserByUserId(userId)` - 根据用户ID获取用户信息
- `getAllUsers()` - 获取所有在线用户列表
- `getOtherUsers(excludeUserId)` - 获取除指定用户外的其他在线用户

### 消息处理模块 (messageHandler.js)

负责消息的创建、格式化和验证。

**主要功能：**
- `createMessage(data)` - 创建文本消息
- `createFileMessage(data)` - 创建文件消息
- `createImageMessage(data)` - 创建图片消息
- `validateMessage(message)` - 验证消息内容
- `formatTime(date)` - 格式化消息时间戳

### Socket 事件处理 (chatHandler.js)

处理所有 Socket.IO 相关的事件逻辑。

**主要功能：**
- 用户登录/登出处理
- 房间管理（创建、加入私聊房间）
- 消息发送和接收
- 输入状态广播
- 用户状态变更通知

## 开发指南

### 添加新消息类型

1. 在 [utils/messageHandler.js](utils/messageHandler.js) 中添加消息创建方法
2. 在 [sockets/chatHandler.js](sockets/chatHandler.js) 中添加对应的事件监听
3. 更新 API 文档

### 修改服务器配置

编辑 [server.js](server.js) 文件中的相关配置：

```javascript
const PORT = 3000;  // 修改端口
const CLIENT_URL = 'http://localhost:5173';  // 修改允许的跨域地址
```

### 调试技巧

在 [server.js](server.js) 中可以启用详细日志：

```javascript
const io = new Server(server, {
  logger: true,
  transports: ['websocket', 'polling']
})
```

## 常见问题

**Q: 如何修改服务器端口？**
A: 修改 [server.js](server.js) 文件中的 `PORT` 常量

**Q: 如何添加用户认证？**
A: 在 `user:login` 事件处理中添加认证逻辑，验证用户凭证

**Q: 消息无法发送怎么办？**
A: 检查用户是否已登录、房间ID是否正确、查看服务器日志

**Q: 如何实现群聊功能？**
A: 修改房间逻辑，支持多用户加入同一房间，并调整消息广播逻辑

## 许可

ISC License
