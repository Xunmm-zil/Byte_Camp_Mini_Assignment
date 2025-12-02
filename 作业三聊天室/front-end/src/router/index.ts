import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/Login.vue'
import ChatList from '@/components/ChatList.vue'
import MessageItem from '@/components/MessageItem.vue'
import { isLoggedIn } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatList,
      children: [
        {
          path: '/MessageItem/:id',
          name: 'messageItem',
          component: MessageItem,
        },
      ],
      beforeEnter: (to, from, next) => {
        if (isLoggedIn()) {
          next()
        } else {
          next('/login')
        }
      },
    },
  ],
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 如果去登录页，直接放行
  if (to.path === '/login') {
    next()
    return
  }

  // 其他页面需要检查登录状态
  if (!isLoggedIn() && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router