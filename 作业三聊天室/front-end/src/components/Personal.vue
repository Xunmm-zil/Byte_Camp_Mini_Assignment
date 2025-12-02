<template>
  <div class="personal">
    <img :src="currentUser?.avatar" alt="" class="myself" />
    <div class="myname">{{ currentUser?.name }}</div>
    <button class="logout-btn" @click="handleLogout" title="退出登录">
      🚪
    </button>
  </div>
</template>

<script setup lang="ts" name="test1">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const { currentUser, logout } = useUserStore()

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.personal{
  display: flex;
  align-items: center;
  position: absolute;
  left: 0;
  top: 25px;
}
.myself {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin:0 20px;
}
.myname {
  font-size: 25px;
  color: rgb(236, 210, 159);
}
.logout-btn {
  margin-left: 15px;
  background-color: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
}
.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
