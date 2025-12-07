# Socket.IO 前端集成文档

## 概述

本项目已成功集成 Socket.IO 实现实时聊天功能。前端与后端通过 WebSocket 进行双向通信。

## 功能特性

✅ **实时消息推送** - 即时接收对方发送的消息
✅ **多种消息类型** - 支持文本、表情、图片、文件
✅ **在线状态同步** - 实时显示用户上下线状态
✅ **房间管理** - 自动加入私聊房间
✅ **离线模式** - Socket连接失败时仍可本地使用
✅ **自动重连** - 页面刷新后自动重新连接

## 文件结构

```
front-end/src/
├── services/
│   └── socketService.ts          # Socket.IO 客户端服务
├── stores/
│   └── userStore.ts               # 用户状态管理（已集成Socket）
├── components/
│   ├── Login.vue                  # 登录页面
│   ├── MessageItem.vue            # 消息组件（已集成实时通信）
│   ├── Personal.vue               # 个人信息组件
│   └── ChatList.vue               # 聊天列表组件
└── .env                           # 环境配置
```

## 环境配置

### .env 文件

```env
# Socket.IO 服务器地址
VITE_SOCKET_URL=http://localhost:3000
```

## 核心模块说明

### 1. socketService.ts

Socket.IO 客户端服务，提供所有Socket通信功能。

**主要方法：**

| 方法 | 说明 |
|------|------|
| `connect()` | 连接到Socket服务器 |
| `disconnect()` | 断开连接 |
| `login(user)` | 用户登录 |
| `logout()` | 用户登出 |
| `joinRoom(userId, targetUserId)` | 加入私聊房间 |
| `sendMessage(receiverId, content, type)` | 发送消息 |
| `sendFileMessage(...)` | 发送文件消息 |
| `sendImageMessage(...)` | 发送图片消息 |
| `onMessageReceived(callback)` | 监听消息接收 |
| `onUserOnline(callback)` | 监听用户上线 |
| `onUserOffline(callback)` | 监听用户下线 |

**使用示例：**

```typescript
import { socketService } from '@/services/socketService'

// 连接并登录
await socketService.connect()
await socketService.login(user)

// 发送消息
socketService.sendMessage('1', '你好！', 'text')

// 监听消息
socketService.onMessageReceived((message) => {
  console.log('收到消息:', message)
})
```

### 2. userStore.ts

用户状态管理，集成Socket连接逻辑。

**新增功能：**

- `isSocketConnected` - Socket连接状态
- `reconnectSocket()` - 重新连接Socket
- `login()` - 自动连接Socket
- `logout()` - 自动断开Socket

**使用示例：**

```typescript
import { useUserStore } from '@/stores/userStore'

const { currentUser, isSocketConnected, login, logout } = useUserStore()

// 登录（自动连接Socket）
await login(user)

// 检查连接状态
console.log('Socket连接:', isSocketConnected.value)

// 登出（自动断开Socket）
await logout()
```

### 3. MessageItem.vue

消息组件，实现实时聊天功能。

**核心功能：**

1. **自动连接** - 组件挂载时自动连接Socket并加入聊天室
2. **消息接收** - 实时接收并显示对方发送的消息
3. **消息发送** - 支持文本、表情、图片、文件发送
4. **房间切换** - 切换聊天对象时自动切换房间
5. **离线支持** - Socket未连接时仅本地显示

## 使用流程

### 1. 启动后端服务器

```bash
cd back-end
npm install
npm start
```

服务器将运行在 `http://localhost:3000`

### 2. 启动前端应用

```bash
cd front-end
npm install
npm run dev
```

应用将运行在 `http://localhost:5173`

### 3. 登录测试

1. 打开浏览器访问 `http://localhost:5173`
2. 选择用户登录（linxi/liran/shentianyi/yeqingyu）
3. 登录成功后自动连接到Socket服务器
4. 点击联系人列表中的用户开始聊天

### 4. 多用户测试

在不同浏览器窗口或隐身模式下：

1. **窗口1**：以"叶清语"身份登录
2. **窗口2**：以"林熙"身份登录
3. 在窗口1中给林熙发送消息
4. 窗口2实时收到消息

## 消息流程

### 发送消息流程

```
用户输入 → sendMessage()
         ↓
    Socket连接?
    ├─ 是 → socketService.sendMessage()
    │        ↓
    │    发送到服务器
    │        ↓
    │    服务器广播到房间
    │        ↓
    │    双方都收到消息
    │
    └─ 否 → 仅本地显示（离线模式）
```

### 接收消息流程

```
服务器推送 → handleMessageReceived()
          ↓
      验证消息归属
          ↓
      添加到消息列表
          ↓
      页面自动更新
```

## 调试技巧

### 查看Socket连接状态

在浏览器控制台：

```javascript
// 查看连接状态
console.log(socketService.isConnected())

// 查看Socket实例
console.log(socketService.getSocket())
```

### 查看Socket事件

打开浏览器开发者工具 → Network → WS（WebSocket）标签页，可以看到：
- Socket连接状态
- 发送的事件
- 接收的事件

### 常见日志

**成功日志：**
```
✅ Socket连接成功
✅ 用户登录并连接到Socket服务器成功
✅ 已加入与 林熙 的聊天室
```

**错误日志：**
```
❌ Socket连接错误: 无法连接到服务器
❌ 登录过程出错: ...
❌ 加入聊天室失败: ...
```

## 常见问题

### Q: Socket连接失败怎么办？

**A:** 检查以下几点：
1. 后端服务器是否已启动（`http://localhost:3000`）
2. `.env` 文件中的 `VITE_SOCKET_URL` 是否正确
3. 浏览器控制台是否有CORS错误
4. 防火墙是否阻止了连接

### Q: 消息发送后对方收不到？

**A:** 可能原因：
1. Socket未连接 - 检查 `isSocketConnected.value`
2. 未加入房间 - 检查控制台是否有"已加入房间"日志
3. 用户ID不匹配 - 检查发送的receiverId是否正确

### Q: 页面刷新后消息丢失？

**A:** 这是正常的。当前实现中：
- 消息不持久化到数据库
- 仅保存初始聊天记录
- 页面刷新后重新加载初始消息

如需持久化，需要在后端添加数据库存储。

### Q: 如何测试多用户聊天？

**A:** 方法1：使用多个浏览器
- Chrome窗口1：用户A
- Firefox窗口1：用户B

方法2：使用隐身模式
- 正常窗口：用户A
- 隐身窗口：用户B

### Q: 离线模式是什么？

**A:** 当Socket未连接时：
- 用户仍可登录和使用界面
- 发送的消息仅显示在本地
- 不会同步到服务器或其他用户
- 适合开发调试使用

## 扩展功能建议

### 1. 消息持久化

```typescript
// 后端：保存到数据库
db.messages.insert(message)

// 前端：加载历史消息
const history = await api.getMessageHistory(userId, targetUserId)
```

### 2. 输入状态提示

```typescript
// 开始输入时
socketService.startTyping(receiverId)

// 停止输入时
socketService.stopTyping(receiverId)

// 监听对方输入状态
socketService.onTypingStatus((data) => {
  if (data.isTyping) {
    showTypingIndicator(`${data.name} 正在输入...`)
  }
})
```

### 3. 未读消息提醒

```typescript
// 监听新消息通知
socketService.onMessageNotification((data) => {
  showNotification({
    title: `来自 ${data.from} 的新消息`,
    body: data.message
  })

  // 更新未读计数
  unreadCount.value++
})
```

### 4. 语音/视频通话

需要集成 WebRTC：
```typescript
// 发起通话
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
// ... WebRTC 逻辑
```

## 性能优化

1. **消息列表虚拟滚动** - 大量消息时使用虚拟列表
2. **图片懒加载** - 图片消息延迟加载
3. **消息分页** - 滚动加载历史消息
4. **连接池管理** - 复用Socket连接

## 部署注意事项

### 生产环境配置

```env
# .env.production
VITE_SOCKET_URL=https://your-domain.com
```

### HTTPS 支持

如果使用HTTPS，Socket.IO会自动使用WSS（WebSocket Secure）：

```typescript
// 自动适配 ws:// 或 wss://
const socket = io('https://your-domain.com')
```

### CDN 加速

建议将静态资源部署到CDN，提升加载速度。

## 技术栈

- **Vue 3** - 前端框架
- **TypeScript** - 类型安全
- **Socket.IO Client** - WebSocket客户端
- **Vite** - 构建工具

## 相关文档

- [Socket.IO 官方文档](https://socket.io/docs/v4/)
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 反馈与支持

如有问题或建议，请：
1. 查看浏览器控制台错误信息
2. 检查后端服务器日志
3. 参考本文档的常见问题部分
