/**
 * Socket.IO 聊天事件处理
 */

const userManager = require('../utils/userManager')
const messageHandler = require('../utils/messageHandler')

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`新连接: ${socket.id}`)

    /**
     * 用户登录
     */
    socket.on('user:login', (userData) => {
      try {
        // 添加用户到在线列表
        const user = userManager.addUser(socket.id, userData)

        // 通知客户端登录成功
        socket.emit('user:login:success', {
          success: true,
          user
        })

        // 广播给所有其他用户，有新用户上线
        socket.broadcast.emit('user:online', {
          userId: user.userId,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          status: 'online'
        })

        // 发送当前在线用户列表
        const onlineUsers = userManager.getOtherUsers(user.userId)
        socket.emit('users:list', onlineUsers)

        console.log(`用户登录成功: ${user.name} (${user.userId})`)
      } catch (error) {
        console.error('用户登录失败:', error)
        socket.emit('user:login:error', {
          success: false,
          error: error.message
        })
      }
    })

    /**
     * 加入私聊房间
     */
    socket.on('room:join', ({ userId, targetUserId }) => {
      try {
        // 创建房间ID（使用两个用户ID排序后的组合，确保唯一性）
        const roomId = [userId, targetUserId].sort().join('_')

        socket.join(roomId)
        userManager.setUserRoom(socket.id, roomId)

        socket.emit('room:joined', {
          success: true,
          roomId,
          targetUserId
        })

        console.log(`用户 ${userId} 加入房间: ${roomId}`)
      } catch (error) {
        console.error('加入房间失败:', error)
        socket.emit('room:join:error', {
          success: false,
          error: error.message
        })
      }
    })

    /**
     * 发送私聊消息
     */
    socket.on('message:send', (messageData) => {
      try {
        const sender = userManager.getUserBySocketId(socket.id)
        if (!sender) {
          socket.emit('message:error', { error: '用户未登录' })
          return
        }

        // 验证消息
        const validation = messageHandler.validateMessage(messageData)
        if (!validation.valid) {
          socket.emit('message:error', { error: validation.error })
          return
        }

        // 创建消息对象
        const message = messageHandler.createMessage({
          senderId: sender.userId,
          senderName: sender.name,
          receiverId: messageData.receiverId,
          content: messageData.content,
          type: messageData.type || 'text',
          avatar: sender.avatar
        })

        // 创建房间ID
        const roomId = [sender.userId, messageData.receiverId].sort().join('_')

        // 发送消息到房间（包括发送者和接收者）
        io.to(roomId).emit('message:received', message)

        // 如果接收者在线但不在同一房间，也发送通知
        const receiver = userManager.getUserByUserId(messageData.receiverId)
        if (receiver && receiver.roomId !== roomId) {
          io.to(receiver.socketId).emit('message:notification', {
            from: sender.name,
            message: message.content,
            senderId: sender.userId
          })
        }

        console.log(`消息发送: ${sender.name} -> ${messageData.receiverId}`)
      } catch (error) {
        console.error('发送消息失败:', error)
        socket.emit('message:error', { error: error.message })
      }
    })

    /**
     * 发送文件消息
     */
    socket.on('message:file', (fileData) => {
      try {
        const sender = userManager.getUserBySocketId(socket.id)
        if (!sender) {
          socket.emit('message:error', { error: '用户未登录' })
          return
        }

        const message = messageHandler.createFileMessage({
          senderId: sender.userId,
          senderName: sender.name,
          receiverId: fileData.receiverId,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          fileType: fileData.fileType,
          avatar: sender.avatar
        })

        const roomId = [sender.userId, fileData.receiverId].sort().join('_')
        io.to(roomId).emit('message:received', message)

        console.log(`文件消息发送: ${sender.name} -> ${fileData.receiverId}`)
      } catch (error) {
        console.error('发送文件消息失败:', error)
        socket.emit('message:error', { error: error.message })
      }
    })

    /**
     * 发送图片消息
     */
    socket.on('message:image', (imageData) => {
      try {
        const sender = userManager.getUserBySocketId(socket.id)
        if (!sender) {
          socket.emit('message:error', { error: '用户未登录' })
          return
        }

        const message = messageHandler.createImageMessage({
          senderId: sender.userId,
          senderName: sender.name,
          receiverId: imageData.receiverId,
          content: imageData.content,
          fileName: imageData.fileName,
          fileSize: imageData.fileSize,
          avatar: sender.avatar
        })

        const roomId = [sender.userId, imageData.receiverId].sort().join('_')

        // 发送消息到房间
        io.to(roomId).emit('message:received', message)

        // 如果发送者不在这个房间，单独发送给发送者
        if (sender.roomId !== roomId) {
          socket.emit('message:received', message)
        }

        console.log(`图片消息发送: ${sender.name} -> ${imageData.receiverId}`)
      } catch (error) {
        console.error('发送图片消息失败:', error)
        socket.emit('message:error', { error: error.message })
      }
    })

    /**
     * 用户正在输入
     */
    socket.on('typing:start', ({ receiverId }) => {
      const sender = userManager.getUserBySocketId(socket.id)
      if (sender) {
        const receiver = userManager.getUserByUserId(receiverId)
        if (receiver) {
          io.to(receiver.socketId).emit('typing:status', {
            userId: sender.userId,
            name: sender.name,
            isTyping: true
          })
        }
      }
    })

    /**
     * 用户停止输入
     */
    socket.on('typing:stop', ({ receiverId }) => {
      const sender = userManager.getUserBySocketId(socket.id)
      if (sender) {
        const receiver = userManager.getUserByUserId(receiverId)
        if (receiver) {
          io.to(receiver.socketId).emit('typing:status', {
            userId: sender.userId,
            name: sender.name,
            isTyping: false
          })
        }
      }
    })

    /**
     * 用户断开连接
     */
    socket.on('disconnect', () => {
      const user = userManager.removeUser(socket.id)
      if (user) {
        // 广播给所有其他用户，该用户已下线
        socket.broadcast.emit('user:offline', {
          userId: user.userId,
          username: user.username,
          name: user.name,
          status: 'offline'
        })

        console.log(`用户断开连接: ${user.name} (${user.userId})`)
      }
    })

    /**
     * 用户主动登出
     */
    socket.on('user:logout', () => {
      const user = userManager.removeUser(socket.id)
      if (user) {
        socket.broadcast.emit('user:offline', {
          userId: user.userId,
          username: user.username,
          name: user.name,
          status: 'offline'
        })

        socket.emit('user:logout:success', { success: true })
        console.log(`用户登出: ${user.name} (${user.userId})`)
      }
    })

    /**
     * 获取在线用户列表
     */
    socket.on('users:get', () => {
      const user = userManager.getUserBySocketId(socket.id)
      if (user) {
        const onlineUsers = userManager.getOtherUsers(user.userId)
        socket.emit('users:list', onlineUsers)
      }
    })
  })
}
