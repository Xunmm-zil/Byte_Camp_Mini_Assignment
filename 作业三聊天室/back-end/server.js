/**
 * 暗系聊天室 - 服务器主文件
 * 基于 Node.js + Express + Socket.IO
 */

require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

// 创建 Express 应用
const app = express()
const server = http.createServer(app)

// 配置 Socket.IO
const io = new Server(server, {
  cors: {
    origin: /^http:\/\/localhost:\d+$/,  // 允许所有 localhost 端口
    methods: ['GET', 'POST'],
    credentials: true
  },
  // 连接超时配置
  pingTimeout: 60000,
  pingInterval: 25000,
  // 增加最大消息大小限制（用于支持图片上传）
  maxHttpBufferSize: 10 * 1024 * 1024  // 10MB
})

// 中间件
app.use(cors({
  origin: /^http:\/\/localhost:\d+$/,  // 允许所有 localhost 端口
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务（如果需要）
app.use(express.static('public'))

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: '暗系聊天室服务器运行中',
    version: '1.0.0',
    status: 'online'
  })
})

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Socket.IO 事件处理
const chatHandler = require('./sockets/chatHandler')
chatHandler(io)

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack)
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  })
})

// 监听未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
})

// 优雅关闭
const gracefulShutdown = () => {
  console.log('\n正在关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })

  // 如果10秒内无法正常关闭，强制退出
  setTimeout(() => {
    console.error('无法正常关闭服务器，强制退出')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// 启动服务器
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log('=================================')
  console.log('🚀 暗系聊天室服务器已启动')
  console.log(`📡 服务器地址: http://localhost:${PORT}`)
  console.log(`🌐 客户端地址: ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`)
  console.log('=================================')
})

module.exports = { app, server, io }
