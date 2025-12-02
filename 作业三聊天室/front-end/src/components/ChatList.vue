<template>
  <div class="main">
    <div class="personlist">
      <h3>聊天列表</h3>
      <RouterLink
        v-for="contact in contacts"
        :key="contact.id"
        :to="`/MessageItem/${contact.id}`"
        :active-class="`active`" 
      >
        <img :src="contact.avatar" alt="avatar" class="avatar" />
        <span class="name">{{ contact.name }}</span>
        <span class="status-dot" :class="{ online: contact.status === 'online' }"></span>
      </RouterLink>
    </div>
    <div class="chatbox">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getOtherUsers } from '@/constants/users'

const { currentUser } = useUserStore()

// 获取除当前用户外的其他用户作为联系人
const contacts = computed(() => {
  if (!currentUser.value) return []

  const otherUsers = getOtherUsers(currentUser.value.id)

  return otherUsers.map(user => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    status: 'online' as const,
  }))
})

 
</script>

<style scoped>
.main {
  display: flex;  
}
.personlist {
  width: 250px;
  height: 698px;
  border-radius: 0 0 0 40px;
  background-color: #4f4f4f;
}
h3 {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  border-bottom: 1px solid #e0e0e0;
  color: #d28bae;
}
.personlist a {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  background-color: #4e4d4d;
  border-bottom: 1px solid #ccc;
  text-decoration: none;
  width: 210px;
}
.personlist a.active {
  background-color: #383838;
}
.avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 20px;
}
.name {
  font-size: 18px;
  color: antiquewhite;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
  margin-left: auto;
}
.status-dot.online {
  background-color: #d28bae;
}
.chatbox {
  flex: 1;
  height: 698px;
}
</style>
