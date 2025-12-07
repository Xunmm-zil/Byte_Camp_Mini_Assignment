import { ref } from 'vue'
import type { User } from '@/types'
import { socketService } from '@/services/socketService'

// 当前登录的用户
const currentUser = ref<User | null>(null)

// Socket连接状态
const isSocketConnected = ref(false)

// 在线用户ID列表
const onlineUserIds = ref<Set<string>>(new Set())

// 监听器是否已初始化的标志
let listenersInitialized = false

// 初始化Socket事件监听
const initializeSocketListeners = () => {
  // 防止重复初始化
  if (listenersInitialized) {
    return
  }

  listenersInitialized = true

  // 监听用户上线
  socketService.onUserOnline((data: any) => {
    console.log('👤 用户上线:', data.name)
    onlineUserIds.value.add(data.userId)
  })

  // 监听用户下线
  socketService.onUserOffline((data: any) => {
    console.log('👋 用户下线:', data.name)
    onlineUserIds.value.delete(data.userId)
  })

  // 监听在线用户列表
  socketService.onUsersList((users: any[]) => {
    console.log('📋 在线用户列表:', users)
    onlineUserIds.value = new Set(users.map(u => u.userId))
  })
}

// 检查用户是否在线
export const isUserOnline = (userId: string): boolean => {
  return onlineUserIds.value.has(userId)
}

// 从localStorage加载用户信息
const loadUser = () => {
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
  }
}

// 登录
export const login = async (user: User) => {
  try {
    // 保存用户信息到localStorage
    currentUser.value = user
    localStorage.setItem('currentUser', JSON.stringify(user))

    // 连接Socket服务器
    await socketService.connect()
    isSocketConnected.value = true

    // 初始化Socket事件监听
    initializeSocketListeners()

    // 向服务器发送登录请求
    await socketService.login(user)

    // 请求获取在线用户列表
    socketService.getUsersList()

    console.log('✅ 用户登录并连接到Socket服务器成功')
  } catch (error) {
    console.error('❌ 登录过程出错:', error)
    // 即使Socket连接失败，也保持本地登录状态
    // 这样用户可以继续使用应用（离线模式）
  }
}

// 登出
export const logout = async () => {
  try {
    // 向服务器发送登出请求
    if (isSocketConnected.value) {
      await socketService.logout()
    }

    // 断开Socket连接
    socketService.disconnect()
    isSocketConnected.value = false

    // 清除本地用户信息
    currentUser.value = null
    localStorage.removeItem('currentUser')

    console.log('✅ 用户登出成功')
  } catch (error) {
    console.error('❌ 登出过程出错:', error)
    // 即使出错也清除本地状态
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }
}

// 获取当前用户
export const getCurrentUser = () => {
  if (!currentUser.value) {
    loadUser()
  }
  return currentUser.value
}

// 检查是否已登录
export const isLoggedIn = () => {
  return getCurrentUser() !== null
}

// 重新连接Socket（用于页面刷新后恢复连接）
export const reconnectSocket = async () => {
  const user = getCurrentUser()
  if (user && !isSocketConnected.value) {
    try {
      await socketService.connect()

      // 初始化Socket事件监听
      initializeSocketListeners()

      await socketService.login(user)
      isSocketConnected.value = true

      // 请求获取在线用户列表
      socketService.getUsersList()

      console.log('✅ Socket重新连接成功')
    } catch (error) {
      console.error('❌ Socket重新连接失败:', error)
    }
  }
}

// 导出响应式用户对象
export const useUserStore = () => {
  return {
    currentUser,
    isSocketConnected,
    onlineUserIds,
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    reconnectSocket,
    isUserOnline,
  }
}
