/**
 * 用户管理模块
 * 管理在线用户、用户状态等
 */

class UserManager {
  constructor() {
    // 存储在线用户 { socketId: { userId, username, name, avatar, socketId, roomId } }
    this.onlineUsers = new Map()

    // 存储用户ID到socketId的映射 { userId: socketId }
    this.userIdToSocket = new Map()
  }

  /**
   * 添加用户
   */
  addUser(socketId, userData) {
    const user = {
      socketId,
      userId: userData.userId,
      username: userData.username,
      name: userData.name,
      avatar: userData.avatar,
      roomId: null,
      connectedAt: new Date()
    }

    this.onlineUsers.set(socketId, user)
    this.userIdToSocket.set(userData.userId, socketId)

    console.log(`用户 ${user.name} (${user.userId}) 已连接`)
    return user
  }

  /**
   * 移除用户
   */
  removeUser(socketId) {
    const user = this.onlineUsers.get(socketId)
    if (user) {
      this.onlineUsers.delete(socketId)
      this.userIdToSocket.delete(user.userId)
      console.log(`用户 ${user.name} (${user.userId}) 已断开连接`)
      return user
    }
    return null
  }

  /**
   * 获取用户信息
   */
  getUserBySocketId(socketId) {
    return this.onlineUsers.get(socketId)
  }

  /**
   * 根据用户ID获取用户信息
   */
  getUserByUserId(userId) {
    const socketId = this.userIdToSocket.get(userId)
    if (socketId) {
      return this.onlineUsers.get(socketId)
    }
    return null
  }

  /**
   * 更新用户的房间ID
   */
  setUserRoom(socketId, roomId) {
    const user = this.onlineUsers.get(socketId)
    if (user) {
      user.roomId = roomId
    }
  }

  /**
   * 获取所有在线用户
   */
  getAllUsers() {
    return Array.from(this.onlineUsers.values()).map(user => ({
      userId: user.userId,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      status: 'online'
    }))
  }

  /**
   * 获取在线用户数量
   */
  getUserCount() {
    return this.onlineUsers.size
  }

  /**
   * 检查用户是否在线
   */
  isUserOnline(userId) {
    return this.userIdToSocket.has(userId)
  }

  /**
   * 获取除指定用户外的其他在线用户
   */
  getOtherUsers(excludeUserId) {
    return Array.from(this.onlineUsers.values())
      .filter(user => user.userId !== excludeUserId)
      .map(user => ({
        userId: user.userId,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        status: 'online'
      }))
  }
}

module.exports = new UserManager()
