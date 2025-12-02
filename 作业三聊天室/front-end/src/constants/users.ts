import type { User } from '@/types'

// 获取图片URL的辅助函数
const getImageUrl = (fileName: string) => {
  return new URL(`../assets/img/${fileName}`, import.meta.url).href
}

// 四个用户数据
export const USERS: User[] = [
  {
    id: '1',
    name: '林熙',
    username: 'linxi',
    avatar: getImageUrl('头像1.jpg'),
  },
  {
    id: '2',
    name: '李苒',
    username: 'liran',
    avatar: getImageUrl('头像2.jpg'),
  },
  {
    id: '3',
    name: '沈天亦',
    username: 'shentianyi',
    avatar: getImageUrl('头像3.jpg'),
  },
  {
    id: '4',
    name: '叶清语',
    username: 'yeqingyu',
    avatar: getImageUrl('头像4.jpg'),
  },
]

// 根据用户名查找用户
export const findUserByUsername = (username: string): User | undefined => {
  return USERS.find(user => user.username === username)
}

// 根据ID查找用户
export const findUserById = (id: string): User | undefined => {
  return USERS.find(user => user.id === id)
}

// 获取除指定用户外的其他用户
export const getOtherUsers = (currentUserId: string): User[] => {
  return USERS.filter(user => user.id !== currentUserId)
}
