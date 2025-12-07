<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">暗系聊天室</h1>
      <p class="login-subtitle">请输入用户名登录</p>

      <div class="user-selection">
        <div
          v-for="user in users"
          :key="user.id"
          class="user-card"
          :class="{ selected: selectedUsername === user.username }"
          @click="selectUser(user.username)"
        >
          <img :src="user.avatar" :alt="user.name" class="user-avatar" />
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="username">@{{ user.username }}</div>
          </div>
        </div>
      </div>

      <div class="input-group">
        <input
          v-model="username"
          type="text"
          placeholder="输入用户名 (linxi/liran/shentianyi/yeqingyu)"
          class="username-input"
          @keydown.enter="handleLogin"
        />
      </div>

      <button class="login-button" @click="handleLogin" :disabled="!username">
        登录
      </button>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { USERS, findUserByUsername } from '@/constants/users'
import { login } from '@/stores/userStore'

const router = useRouter()
const username = ref('')
const selectedUsername = ref('')
const errorMessage = ref('')
const users = USERS

const selectUser = (uname: string) => {
  selectedUsername.value = uname
  username.value = uname
  errorMessage.value = ''
}

const handleLogin = () => {
  errorMessage.value = ''

  if (!username.value.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }
                               
  const user = findUserByUsername(username.value.toLowerCase().trim())

  if (user) {
    login(user)
    router.push('/chat')
  } else {
    errorMessage.value = '用户名不存在，请输入正确的用户名'
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
}

.login-box {
  background-color: #464646;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 500px;
  max-width: 90%;
}

.login-title {
  text-align: center;
  font-size: 36px;
  color: #d28bae;
  margin-bottom: 10px;
}

.login-subtitle {
  text-align: center;
  color: #b0b3b8;
  margin-bottom: 30px;
  font-size: 16px;
}

.user-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #4a4e5a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.user-card:hover {
  background-color: #565a69;
  transform: translateY(-2px);
}

.user-card.selected {
  background-color: #5b96f7;
  border-color: #d28bae;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
  margin-bottom: 4px;
}

.username {
  font-size: 12px;
  color: #b0b3b8;
}

.input-group {
  margin-bottom: 20px;
}

.username-input {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 10px;
  background-color: #4a4e5a;
  color: #fff;
  font-size: 16px;
  box-sizing: border-box;
}

.username-input::placeholder {
  color: #b0b3b8;
}

.username-input:focus {
  outline: none;
  background-color: #565a69;
}

.login-button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #d28bae 0%, #b76e91 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(210, 139, 174, 0.4);
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #ff4444;
  color: #fff;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}
</style>
