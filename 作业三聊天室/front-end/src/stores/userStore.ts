import { ref } from 'vue'
import type { User } from '@/types'

// 当前登录的用户
const currentUser = ref<User | null>(null)

// 从localStorage加载用户信息
const loadUser = () => {
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
  }
}

// 登录
export const login = (user: User) => {
  currentUser.value = user
  localStorage.setItem('currentUser', JSON.stringify(user))
}

// 登出
export const logout = () => {
  currentUser.value = null
  localStorage.removeItem('currentUser')
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

// 导出响应式用户对象
export const useUserStore = () => {
  return {
    currentUser,
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
  }
}
