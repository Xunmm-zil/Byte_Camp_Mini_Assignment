/**
 * Socket.IO 客户端服务
 * 管理与后端的实时通信连接
 */

import { io, Socket } from 'socket.io-client'
import type { User } from '@/types'

class SocketService {
  private socket: Socket | null = null
  private serverUrl: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    this.serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
  }

  /**
   * 连接到服务器
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('✅ Socket已经连接')
        resolve()
        return
      }

      // 如果socket已存在但未连接，先完全清理
      if (this.socket) {
        this.socket.removeAllListeners()
        this.socket.disconnect()
        this.socket = null
      }

      console.log('🔌 正在连接到Socket服务器...')

      this.socket = io(this.serverUrl, {
        transports: ['polling', 'websocket'],  // 先用polling再升级websocket
        reconnection: false,  // 禁用自动重连，手动控制
        timeout: 20000  // 增加超时时间到20秒
      })

      // 设置连接超时
      const connectTimeout = setTimeout(() => {
        console.error('❌ Socket连接超时')
        if (this.socket) {
          this.socket.disconnect()
        }
        reject(new Error('连接超时'))
      }, 20000)

      this.socket.on('connect', () => {
        clearTimeout(connectTimeout)
        console.log('✅ Socket连接成功')
        this.reconnectAttempts = 0
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        clearTimeout(connectTimeout)
        console.error('❌ Socket连接错误:', error.message)
        reject(new Error(`连接失败: ${error.message}`))
      })

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket断开连接:', reason)
      })

      this.socket.on('error', (error) => {
        console.error('❌ Socket错误:', error)
      })
    })
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('Socket已断开')
    }
  }

  /**
   * 用户登录
   */
  login(user: User): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket未连接'))
        return
      }

      console.log('📤 发送登录请求:', user.name)

      // 设置登录超时
      const loginTimeout = setTimeout(() => {
        console.error('❌ 登录超时')
        reject(new Error('登录超时'))
      }, 10000)

      this.socket.once('user:login:success', (data) => {
        clearTimeout(loginTimeout)
        console.log('✅ 用户登录成功:', data.user.name)
        resolve(data)
      })

      this.socket.once('user:login:error', (data) => {
        clearTimeout(loginTimeout)
        console.error('❌ 用户登录失败:', data.error)
        reject(new Error(data.error))
      })

      this.socket.emit('user:login', {
        userId: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar
      })
    })
  }

  /**
   * 用户登出
   */
  logout(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve()
        return
      }

      this.socket.emit('user:logout')
      this.socket.once('user:logout:success', () => {
        console.log('✅ 用户登出成功')
        resolve()
      })

      // 超时自动resolve
      setTimeout(() => resolve(), 2000)
    })
  }
 
  /**
   * 加入私聊房间
   */
  joinRoom(userId: string, targetUserId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket未连接'))
        return
      }

      this.socket.emit('room:join', { userId, targetUserId })

      this.socket.once('room:joined', (data) => {
        console.log('✅ 加入房间成功:', data.roomId)
        resolve(data)
      })

      this.socket.once('room:join:error', (data) => {
        console.error('❌ 加入房间失败:', data.error)
        reject(new Error(data.error))
      })

      setTimeout(() => reject(new Error('加入房间超时')), 5000)
    })
  }

  /**
   * 发送消息
   */
  sendMessage(receiverId: string, content: string, type: string = 'text') {
    if (!this.socket) {
      throw new Error('Socket未连接')
    }

    this.socket.emit('message:send', {
      receiverId,
      content,
      type
    })
  }

  /**
   * 发送文件消息
   */
  sendFileMessage(receiverId: string, fileName: string, fileSize: string, fileType: string) {
    if (!this.socket) {
      throw new Error('Socket未连接')
    }

    this.socket.emit('message:file', {
      receiverId,
      fileName,
      fileSize,
      fileType
    })
  }

  /**
   * 发送图片消息
   */
  sendImageMessage(receiverId: string, content: string, fileName: string, fileSize: string) {
    if (!this.socket) {
      throw new Error('Socket未连接')
    }

    this.socket.emit('message:image', {
      receiverId,
      content,
      fileName,
      fileSize
    })
  }

  /**
   * 监听消息接收
   */
  onMessageReceived(callback: (message: any) => void) {
    if (!this.socket) return

    this.socket.on('message:received', callback)
  }

  /**
   * 移除消息接收监听
   */
  offMessageReceived(callback: (message: any) => void) {
    if (!this.socket) return

    this.socket.off('message:received', callback)
  }

  /**
   * 监听用户上线
   */
  onUserOnline(callback: (user: any) => void) {
    if (!this.socket) return

    this.socket.on('user:online', callback)
  }

  /**
   * 监听用户下线
   */
  onUserOffline(callback: (user: any) => void) {
    if (!this.socket) return

    this.socket.on('user:offline', callback)
  }

  /**
   * 监听在线用户列表
   */
  onUsersList(callback: (users: any[]) => void) {
    if (!this.socket) return

    this.socket.on('users:list', callback)
  }

  /**
   * 获取在线用户列表
   */
  getUsersList() {
    if (!this.socket) return

    this.socket.emit('users:get')
  }

  /**
   * 开始输入
   */
  startTyping(receiverId: string) {
    if (!this.socket) return

    this.socket.emit('typing:start', { receiverId })
  }

  /**
   * 停止输入
   */
  stopTyping(receiverId: string) {
    if (!this.socket) return

    this.socket.emit('typing:stop', { receiverId })
  }

  /**
   * 监听输入状态
   */
  onTypingStatus(callback: (data: { userId: string; name: string; isTyping: boolean }) => void) {
    if (!this.socket) return

    this.socket.on('typing:status', callback)
  }

  /**
   * 监听消息通知
   */
  onMessageNotification(callback: (data: { from: string; message: string; senderId: string }) => void) {
    if (!this.socket) return

    this.socket.on('message:notification', callback)
  }

  /**
   * 监听消息错误
   */
  onMessageError(callback: (data: { error: string }) => void) {
    if (!this.socket) return

    this.socket.on('message:error', callback)
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * 获取Socket实例
   */
  getSocket(): Socket | null {
    return this.socket
  }
}

// 导出单例
export const socketService = new SocketService()
