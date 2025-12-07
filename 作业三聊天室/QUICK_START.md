# 暗系聊天室 - 快速启动指南

## 🚀 5分钟快速启动

### 前置要求

- Node.js 16+ 已安装
- npm 或 yarn 已安装

### 第一步：启动后端服务器

```bash
# 进入后端目录
cd back-end

# 安装依赖（首次运行）
npm install

# 启动服务器
npm start
```

**预期输出：**
```
=================================
🚀 暗系聊天室服务器已启动
📡 服务器地址: http://localhost:3000
🌐 客户端地址: http://localhost:5173
⏰ 启动时间: 2025-12-02 ...
=================================
```

### 第二步：启动前端应用

**打开新的终端窗口**，执行：

```bash
# 进入前端目录
cd front-end

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

**预期输出：**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 第三步：访问应用

1. 打开浏览器访问：`http://localhost:5173`
2. 选择一个用户登录（点击用户卡片或输入用户名）
3. 登录成功后进入聊天室

## 🧪 测试实时通信

### 单用户测试

1. 登录应用
2. 点击联系人列表中的任意用户
3. 发送消息（会显示在聊天窗口中）

### 双用户测试（推荐）

**唯一正确的方法：在同一浏览器中打开多个标签页**

1. **第一个标签页**：访问 `http://localhost:5173`，以"叶清语"身份登录
2. **第二个标签页**：新建标签页访问 `http://localhost:5173`，以"林熙"身份登录
3. 在第一个标签页中点击"林熙"，发送消息
4. 第二个标签页实时收到消息 ✨

> ⚠️ **重要说明**：由于应用使用 localStorage 存储用户信息，localStorage 在同一浏览器的不同标签页之间是共享的，因此**无法使用不同浏览器或隐身模式测试多用户通信**。必须在同一浏览器的多个标签页中分别登录不同用户。

**为什么不能跨浏览器测试？**
- localStorage 是浏览器级别隔离的
- Chrome 和 Firefox 各有独立的 localStorage
- 隐身模式也有独立的 localStorage
- 因此只能在同一浏览器的不同标签页测试

### 预期效果

- ✅ 消息实时推送，无需刷新
- ✅ 双方都能看到对方发送的消息
- ✅ 消息显示发送者头像、姓名和时间
- ✅ 支持文本、表情、图片、文件

## 📋 可用用户列表

| 用户名 | 姓名 | 头像 |
|--------|------|------|
| `yeqingyu` | 叶清语 | 头像4 |
| `linxi` | 林熙 | 头像1 |
| `liran` | 李苒 | 头像2 |
| `shentianyi` | 沈天亦 | 头像3 |

## 🔍 验证Socket连接

打开浏览器开发者工具 (F12)：

### 1. 控制台日志

登录成功后应该看到：
```
✅ Socket连接成功
✅ 用户登录并连接到Socket服务器成功
✅ 已加入与 林熙 的聊天室
```

### 2. Network标签

- 切换到 **WS**（WebSocket）标签
- 应该看到一个活跃的WebSocket连接
- URL: `ws://localhost:3000/socket.io/...`
- Status: `101 Switching Protocols` （绿色）

### 3. 消息收发

发送消息时，在WS标签中可以看到：
- ⬆️ 发送: `message:send`
- ⬇️ 接收: `message:received`

## 🛠️ 常见问题

### Q: 后端启动失败，提示端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法：**

Windows:
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换PID）
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
# 查找并结束进程
lsof -ti:3000 | xargs kill -9
```

或者修改端口：
```bash
# 编辑 back-end/.env
PORT=3001
```

### Q: 前端连接不到后端

**解决方法：**

1. 确认后端已启动
2. 检查 `front-end/.env` 配置：
```env
VITE_SOCKET_URL=http://localhost:3000
```

3. 检查浏览器控制台是否有CORS错误
4. 重启前端开发服务器

### Q: Socket连接失败

**控制台错误：**
```
❌ Socket连接错误: ...
```

**解决方法：**

1. **确认后端服务器运行正常**
   ```bash
   curl http://localhost:3000/health
   ```
   应该返回: `{"status":"ok",...}`

2. **检查防火墙设置**
   - Windows: 允许Node.js通过防火墙
   - Mac: 系统偏好设置 → 安全性与隐私 → 防火墙

3. **清除浏览器缓存**
   - Chrome: Ctrl+Shift+Delete
   - 清除所有缓存和Cookie

### Q: 消息发送了但对方收不到

**检查步骤：**

1. 确认双方都已登录
2. 查看控制台是否有"已加入房间"日志
3. 检查Network → WS标签，确认Socket连接正常
4. 重新登录尝试

## 📊 性能检查

### 后端服务器状态

访问健康检查接口：
```bash
curl http://localhost:3000/health
```

**正常响应：**
```json
{
  "status": "ok",
  "timestamp": "2025-12-02T...",
  "uptime": 123.45
}
```

### Socket连接测试

运行后端测试脚本：
```bash
cd back-end
node test-server.js
```

**预期输出：**
```
✅ 客户端1已连接
✅ 用户1登录成功: 林熙
✅ 客户端2已连接
✅ 用户2登录成功: 叶清语
✅ 加入房间成功: 1_4
📤 已发送测试消息
📨 收到消息: { from: '林熙', content: '你好！...', ... }
✅ 所有测试通过！
```

## 🎯 功能清单

### 已实现功能

- [x] 用户登录/登出
- [x] Socket实时连接
- [x] 私聊房间
- [x] 文本消息发送
- [x] 表情消息发送
- [x] 图片消息发送
- [x] 文件消息发送
- [x] 消息实时推送
- [x] 用户在线状态
- [x] 多用户支持
- [x] 离线模式支持
- [x] 自动重连

### 可扩展功能

- [ ] 消息持久化
- [ ] 历史消息加载
- [ ] 未读消息提醒
- [ ] 输入状态提示
- [ ] 消息已读回执
- [ ] 语音/视频通话
- [ ] 群聊功能
- [ ] 消息搜索

## 📁 项目结构

```
作业三聊天室/
├── back-end/              # 后端服务（Node.js + Socket.IO）
│   ├── server.js          # 服务器主文件
│   ├── sockets/           # Socket事件处理
│   ├── utils/             # 工具函数
│   └── package.json       # 依赖配置
│
├── front-end/             # 前端应用（Vue 3 + TypeScript）
│   ├── src/
│   │   ├── components/    # Vue组件
│   │   ├── services/      # Socket服务
│   │   ├── stores/        # 状态管理
│   │   └── types.ts       # 类型定义
│   └── package.json       # 依赖配置
│
├── QUICK_START.md         # 本文档
└── README.md              # 项目说明
```

## 📖 详细文档

- **后端文档**: `back-end/README.md`
- **前端集成**: `front-end/SOCKET_INTEGRATION.md`
- **API文档**: 见后端README

## 🎉 开始使用

现在你已经准备好了！按照上面的步骤启动应用，开始体验实时聊天功能吧！

有任何问题？查看：
1. 浏览器控制台日志
2. 后端终端日志
3. 常见问题部分

祝你使用愉快！✨
