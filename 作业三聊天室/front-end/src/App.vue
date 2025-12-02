<template>
  <div v-if="isLoginPage" class="login-page">
    <RouterView />
  </div>
  <div v-else class="app_container">
    <h1 class="title">暗系聊天室</h1>
    <Personal class="personal" />
    <RouterView />
  </div>
</template>

<script setup lang="ts" name="App">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Personal from './components/Personal.vue'

const route = useRoute()

// 判断是否在登录页
const isLoginPage = computed(() => route.path === '/login')
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
}

.app_container {
  width: 1200px;
  margin: 50px auto;
  background-color: #464646;
  box-shadow: 0 0 15px;
  height: 800px;
  border-radius: 40px;
  position: relative;
}

.title {
  height: 100px;
  line-height: 100px;
  text-align: center;
  font-size: 40px;
  color: #d28bae;
  border-bottom: 2px solid #d28bae;
}
</style>
