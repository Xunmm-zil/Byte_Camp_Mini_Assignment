<template>
  <div class="chat-window">
    <!-- 头部信息 -->
    <div class="chat-header">
      <input
        type="file"
        ref="fileInput"
        class="hidden-input"
        @change="handleFileSelected"
        multiple
      />

      <input
        type="file"
        ref="imageInput"
        class="hidden-input"
        @change="handleImageSelected"
        accept="image/*"
        multiple
      />

      <div class="header-actions">
        <button class="action-btn" @click="showUnavailableMessage">📹</button>
        <button class="action-btn" @click="showUnavailableMessage">📞</button>
        <button class="action-btn" @click="triggerFileSelection">📎</button>
        <button class="action-btn" @click="triggerImageSelection">🖼️</button>
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="messages-container">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="{ 'sender-me': message.sender === currentUser?.name }"
      >
        <div class="message-main">
          <img :src="message.avatar" alt="用户头像" class="message-avatar" />
          <div class="message-content">
            <template v-if="message.type === 'text'">
              {{ message.content }}
            </template>

            <template v-else-if="message.type === 'emoji'">
              <span class="emoji">{{ message.content }}</span>
            </template>

            <template v-else-if="message.type === 'image'">
              <div class="image-container">
                <img :src="message.content" :alt="message.fileName" class="message-image" />
                <div class="image-meta">{{ message.fileName }} ({{ message.fileSize }})</div>
              </div>
            </template>

            <template v-else-if="message.type === 'file'">
              <div class="file-container" :class="getFileClass(message.fileType)">
                <div class="file-icon">
                  {{ getFileIcon(message.fileType) }}
                </div>
                <div class="file-info">
                  <div class="file-name">{{ message.fileName }}</div>
                  <div class="file-meta">
                    <span>{{ message.fileSize }}</span>
                    <span>{{ getFileExtension(message.fileName) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="message-meta">
          <span class="sender-name">{{ message.sender }}</span>
          <span class="send-time">{{ message.time }}</span>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <button class="emoji-btn" @click="toggleEmojiPicker">😀</button>
      <input v-model="inputText" type="text" class="message-input" @keydown.enter="sendMessage()" />
      <button class="send-btn" @click="sendMessage()">🚀</button>
    </div>

    <!-- 表情包选择器 -->
    <div v-if="showEmojiPicker" class="emoji-picker">
      <button v-for="emoji in emojis" :key="emoji" class="emoji-item" @click="selectEmoji(emoji)">
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { type Message } from '@/types'
import { FILE_ICONS, FILE_CLASSES } from '@/utils/fileUtils'
import { useUserStore } from '@/stores/userStore'
import { findUserById } from '@/constants/users'

const route = useRoute()
const { currentUser } = useUserStore()

// 获取聊天对象ID
const chatUserId = computed(() => route.params.id as string)

// 获取聊天对象信息
const chatUser = computed(() => findUserById(chatUserId.value))

// 定义处理图片路径的函数
const getImageUrl = (url: string) => {
  return new URL(url, import.meta.url).href
}

// 根据当前登录用户和聊天对象生成初始消息
const getInitialMessages = (): Message[] => {
  if (!currentUser.value || !chatUser.value) return []

  const userId = currentUser.value.id
  const chatId = chatUser.value.id

  // 为每个用户对定义不同的聊天记录
  const chatHistories: Record<string, Message[]> = {
    // 叶清语(4) 和 林熙(1)
    '4-1': [
      {
        id: '1',
        sender: chatUser.value.name,
        content: '在吃饭哦',
        type: 'text',
        time: '2025/12/02 09:10',
        avatar: chatUser.value.avatar,
      },
      {
        id: '2',
        sender: currentUser.value.name,
        content: '吃什么呀',
        type: 'text',
        time: '2025/12/02 09:11',
        avatar: currentUser.value.avatar,
      },
      {
        id: '3',
        sender: chatUser.value.name,
        content: '牛肉粿条',
        type: 'text',
        time: '2025/12/02 09:12',
        avatar: chatUser.value.avatar,
      },
      {
        id: '4',
        sender: chatUser.value.name,
        content: '😃',
        type: 'emoji',
        time: '2025/12/02 09:12',
        avatar: chatUser.value.avatar,
      },
    ],
    // 叶清语(4) 和 李苒(2)
    '4-2': [
      {
        id: '1',
        sender: chatUser.value.name,
        content: '项目写好了没呀',
        type: 'text',
        time: '2025/12/02 09:08',
        avatar: chatUser.value.avatar,
      },
      {
        id: '2',
        sender: currentUser.value.name,
        content: '还没',
        type: 'text',
        time: '2025/12/02 09:10',
        avatar: currentUser.value.avatar,
      },
      {
        id: '3',
        sender: chatUser.value.name,
        content: '哎呀',
        type: 'text',
        time: '2025/12/02 09:11',
        avatar: chatUser.value.avatar,
      },
      {
        id: '4',
        sender: chatUser.value.name,
        content: '😆',
        type: 'emoji',
        time: '2025/12/02 09:12',
        avatar: chatUser.value.avatar,
      },
    ],
    // 叶清语(4) 和 沈天亦(3)
    '4-3': [
      {
        id: '1',
        sender: chatUser.value.name,
        content: '快来打游戏',
        type: 'text',
        time: '2025/12/02 09:05',
        avatar: chatUser.value.avatar,
      },
      {
        id: '2',
        sender: currentUser.value.name,
        content: '没空啊',
        type: 'text',
        time: '2025/12/02 09:08',
        avatar: currentUser.value.avatar,
      },
      {
        id: '3',
        sender: currentUser.value.name,
        content: '😅',
        type: 'emoji',
        time: '2025/12/02 09:08',
        avatar: currentUser.value.avatar,
      },
      {
        id: '4',
        sender: chatUser.value.name,
        content: '真惨',
        type: 'text',
        time: '2025/12/02 09:10',
        avatar: chatUser.value.avatar,
      },
      {
        id: '5',
        sender: chatUser.value.name,
        content: '🤣',
        type: 'emoji',
        time: '2025/12/02 09:12',
        avatar: chatUser.value.avatar,
      },
    ],
  }

  // 获取对应的聊天记录，如果不存在则返回默认消息
  const key = `${userId}-${chatId}`
  const reverseKey = `${chatId}-${userId}`

  if (chatHistories[key]) {
    return chatHistories[key]
  } else if (chatHistories[reverseKey]) {
    // 如果是反向的key，需要交换发送者
    return chatHistories[reverseKey].map(msg => ({
      ...msg,
      sender: msg.sender === currentUser.value?.name ? chatUser.value?.name || '' : currentUser.value?.name || '',
      avatar: msg.sender === currentUser.value?.name ? chatUser.value?.avatar || '' : currentUser.value?.avatar || '',
    }))
  }

  // 默认消息
  return [
    {
      id: '1',
      sender: chatUser.value.name,
      content: '你好！',
      type: 'text',
      time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      avatar: chatUser.value.avatar,
    },
  ]
}

const messages = ref<Message[]>(getInitialMessages())
const myAvatar = computed(() => currentUser.value?.avatar || '')

const inputText = ref('')
const showEmojiPicker = ref(false)
const emojis = ref(['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂'])

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const selectEmoji = (emoji: string) => {
  sendMessage('emoji', emoji)
  showEmojiPicker.value = false
}

const sendMessage = (type: 'text' | 'emoji' = 'text', content?: string) => {
  if (type === 'text' && !inputText.value.trim()) return
  if (!currentUser.value) return

  const newMessage: Message = {
    id: Date.now().toString(),
    sender: currentUser.value.name,
    content: content || inputText.value,
    type,
    time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    avatar: currentUser.value.avatar,
  }

  messages.value.push(newMessage)
  inputText.value = ''
}

const fileInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)

const showUnavailableMessage = () => {
  alert('该功能暂未开通，敬请期待！')
}

const triggerFileSelection = () => {
  fileInput.value?.click()
}

const triggerImageSelection = () => {
  imageInput.value?.click()
}

const handleFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0 || !currentUser.value) return

  Array.from(input.files).forEach((file) => {
    const fileExt = getFileExtension(file.name)

    const fileMessage: Message = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: currentUser.value!.name,
      content: '',
      type: 'file',
      time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      avatar: myAvatar.value,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: fileExt,
    }

    messages.value.push(fileMessage)
  })

  input.value = ''
}

const handleImageSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0 || !currentUser.value) return

  Array.from(input.files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageMessage: Message = {
        id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: currentUser.value!.name,
        content: e.target?.result as string,
        type: 'image',
        time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        avatar: myAvatar.value,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
      }

      messages.value.push(imageMessage)
    }
    reader.readAsDataURL(file)
  })

  input.value = ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileExtension = (fileName?: string): string => {
  if (!fileName) return 'unknown'
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ext || 'unknown'
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return FILE_ICONS.default
  return FILE_ICONS[fileType as keyof typeof FILE_ICONS] || FILE_ICONS.default
}

const getFileClass = (fileType?: string) => {
  if (!fileType) return FILE_CLASSES.default
  return FILE_CLASSES[fileType as keyof typeof FILE_CLASSES] || FILE_CLASSES.default
}
</script>

<style scoped>
.chat-window {
  width: 950px;
  height: 698px;
  background-color: #464646;
  color: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 0 0 40px 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: end;
  border-bottom: 1px solid #565a69;
  height: 60px;
  margin-right: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.message-main {
  display: flex;
  margin-bottom: 5px;
}

.message {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
}

.message.sender-me {
  align-self: flex-end;
  align-items: flex-end;
}

.message.sender-me .message-main {
  flex-direction: row-reverse;
}

.message.sender-me .message-main .message-avatar {
  margin-right: 0;
  margin-left: 10px;
}

.message-content {
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.message.sender-me .message-content {
  background-color: #5b96f7;
}

.message:not(.sender-me) .message-content {
  background-color: #4a4e5a;
}

.image-container {
  position: relative;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}

.image-meta {
  font-size: 12px;
  margin-top: 4px;
  color: #666;
}

.message.sender-me .image-meta {
  color: rgba(255, 255, 255, 0.8);
}

.file-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  width: 200px;
  background: #f5f5f5;
}

.message.sender-me .file-container {
  background: #e6f2ff;
}

.file-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
  color: black;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.message.sender-me .file-meta {
  color: #003a66;
}

.file-doc .file-icon {
  background: #2b579a;
  color: #929292;
}

.file-pdf .file-icon {
  background: #b71c1c;
  color: #929292;
}

.file-ppt .file-icon {
  background: #d35400;
  color: #929292;
}

.file-xls .file-icon {
  background: #0f9d58;
  color: #929292;
}

.file-zip .file-icon {
  background: #8e24aa;
  color: #929292;
}

.file-audio .file-icon {
  background: #1976d2;
  color: #929292;
}

.file-video .file-icon {
  background: #e53935;
  color: #929292;
}

.file-code .file-icon {
  background: #263238;
  color: #929292;
}

.file-default .file-icon {
  background: #757575;
  color: #929292;
}

.emoji {
  font-size: 24px;
}

.message-meta {
  font-size: 12px;
  color: #b0b3b8;
  display: flex;
  gap: 8px;
}

.input-area {
  display: flex;
  align-items: center;
  padding: 25px 16px;
  border-top: 1px solid #565a69;
}

.emoji-btn,
.send-btn {
  background-color: #4a4e5a;
  border: none;
  color: #fff;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-input {
  flex: 1;
  margin: 0 12px;
  padding: 12px;
  border: none;
  border-radius: 20px;
  background-color: #4a4e5a;
  color: #fff;
}

.message-input::placeholder {
  color: #b0b3b8;
}

.emoji-picker {
  position: absolute;
  bottom: 70px;
  left: 260px;
  background-color: #4a4e5a;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 160px;
}

.emoji-item {
  background-color: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.hidden-input {
  display: none;
}
</style>
