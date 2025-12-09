# 暗系聊天室 - 前端

这是一个基于 Vue 3 + TypeScript + Vite 开发的现代化实时聊天应用前端。

## 项目简介

暗系聊天室是一个支持实时通信的在线聊天应用，采用暗色主题设计，提供流畅的用户体验和完善的聊天功能。

## 功能特性

- 用户登录与身份管理
- 实时在线用户列表
- 一对一私聊功能
- 多种消息类型支持（文本、表情、图片、文件）
- 消息输入状态提示（对方正在输入...）
- 新消息通知提醒
- 响应式设计，适配多种设备
- 暗色主题界面

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 新一代前端构建工具
- **Pinia** - Vue 3 状态管理
- **Vue Router** - 官方路由管理器
- **Socket.IO Client** - 实时通信客户端

## 项目结构

```
front-end/
├── src/
│   ├── App.vue              # 根组件
│   ├── main.ts              # 应用入口
│   ├── types.ts             # TypeScript 类型定义
│   ├── components/          # 组件目录
│   │   ├── ChatWindow.vue   # 聊天窗口组件
│   │   ├── LoginView.vue    # 登录组件
│   │   └── UserList.vue     # 用户列表组件
│   ├── services/            # 服务层
│   │   └── socket.ts        # Socket.IO 连接服务
│   ├── stores/              # 状态管理
│   │   ├── chat.ts          # 聊天状态
│   │   └── user.ts          # 用户状态
│   ├── router/              # 路由配置
│   │   └── index.ts         # 路由定义
│   ├── utils/               # 工具函数
│   ├── constants/           # 常量定义
│   └── assets/              # 静态资源
├── public/                  # 公共资源
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── package.json             # 项目依赖配置
├── .env                     # 环境变量配置
└── README.md                # 项目说明文档
```

## 快速开始

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- npm 或 yarn

### 安装依赖

```bash
cd front-end
npm install
```

### 配置环境变量

创建 `.env` 文件并配置后端服务地址：

```env
VITE_API_URL=http://localhost:3000
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 开发说明

### 目录说明

- **components/** - 存放所有 Vue 组件
- **services/** - 封装 API 请求和 Socket 连接
- **stores/** - Pinia 状态管理模块
- **router/** - Vue Router 路由配置
- **utils/** - 通用工具函数
- **constants/** - 常量定义
- **types.ts** - 全局 TypeScript 类型定义

### 主要功能模块

#### 用户登录
用户输入用户名后登录系统，服务器分配唯一用户标识。

#### 用户列表
实时显示在线用户，支持点击用户头像开始聊天。

#### 聊天窗口
- 支持发送文本消息和表情
- 支持发送图片和文件
- 显示对方输入状态
- 消息时间戳显示
- 消息已读/未读状态

#### 状态管理
使用 Pinia 管理全局状态：
- 用户信息状态（user store）
- 聊天消息和会话状态（chat store）

### Socket.IO 事件

客户端监听和发送的主要事件：

**发送事件：**
- `user:login` - 用户登录
- `message:send` - 发送消息
- `message:file` - 发送文件
- `message:image` - 发送图片
- `typing:start` - 开始输入
- `typing:stop` - 停止输入

**监听事件：**
- `user:login:success` - 登录成功
- `users:list` - 用户列表更新
- `message:received` - 接收消息
- `message:notification` - 新消息通知
- `typing:status` - 对方输入状态

## 代码规范

### 格式化代码

```bash
npm run format
```

### 类型检查

```bash
npm run type-check
```

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开发工具推荐

### IDE 配置

推荐使用 [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件。

### 浏览器开发工具

**Chrome/Edge:**
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

**Firefox:**
- [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## 许可

ISC License
