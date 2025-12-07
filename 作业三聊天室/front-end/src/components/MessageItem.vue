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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { type Message } from '@/types'
import { FILE_ICONS, FILE_CLASSES } from '@/utils/fileUtils'
import { useUserStore } from '@/stores/userStore'
import { findUserById } from '@/constants/users'
import { socketService } from '@/services/socketService'

const route = useRoute()
const { currentUser, isSocketConnected, reconnectSocket } = useUserStore()

// 获取聊天对象ID
const chatUserId = computed(() => route.params.id as string)

// 获取聊天对象信息
const chatUser = computed(() => findUserById(chatUserId.value))

// 消息存储 - 每个房间的消息单独存储
const roomMessages = ref<Map<string, Message[]>>(new Map())

// 生成房间ID（与后端保持一致的排序规则）
const generateRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_')
}

// 当前房间ID
const currentRoomId = computed(() => {
  if (!currentUser.value || !chatUserId.value) return ''
  return generateRoomId(currentUser.value.id, chatUserId.value)
})

// 当前房间的消息
const messages = computed(() => {
  return roomMessages.value.get(currentRoomId.value) || []
})

// 从localStorage加载所有房间的消息
const loadMessagesFromStorage = () => {
  try {
    const savedMessages = localStorage.getItem('chatRoomMessages')
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages)
      roomMessages.value = new Map(Object.entries(parsed))
      console.log('📥 从localStorage加载消息历史:', roomMessages.value.size, '个房间')
    }
  } catch (error) {
    console.error('加载消息历史失败:', error)
  }
}

// 保存所有房间的消息到localStorage
const saveMessagesToStorage = () => {
  try {
    const messagesObject = Object.fromEntries(roomMessages.value)
    localStorage.setItem('chatRoomMessages', JSON.stringify(messagesObject))
    console.log('💾 消息历史已保存到localStorage')
  } catch (error) {
    console.error('保存消息历史失败:', error)
  }
}

// 添加消息到指定房间
const addMessageToRoom = (roomId: string, message: Message) => {
  const roomMsgs = roomMessages.value.get(roomId) || []
  roomMsgs.push(message)
  roomMessages.value.set(roomId, roomMsgs)
  saveMessagesToStorage()
}
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

// Socket消息接收处理
const handleMessageReceived = (message: any) => {
  console.log('📨 收到消息:', message)

  if (!currentUser.value) return

  // 计算消息所属的房间ID
  const messageRoomId = generateRoomId(message.senderId, message.receiverId)

  console.log('消息房间ID:', messageRoomId)
  console.log('当前房间ID:', currentRoomId.value)

  // 创建消息对象
  const newMessage: Message = {
    id: message.id,
    sender: message.senderName,
    content: message.content,
    type: message.type,
    time: message.time,
    avatar: message.avatar,
    fileName: message.fileName,
    fileSize: message.fileSize,
    fileType: message.fileType,
  }

  // 将消息添加到对应的房间（即使用户不在该房间也会保存）
  addMessageToRoom(messageRoomId, newMessage)
  console.log('✅ 消息已保存到房间:', messageRoomId)
}

// 发送消息
const sendMessage = (type: 'text' | 'emoji' = 'text', content?: string) => {
  if (type === 'text' && !inputText.value.trim()) return
  if (!currentUser.value || !chatUser.value) return

  try {
    console.log('📤 准备发送消息')
    console.log('Socket连接状态:', isSocketConnected.value)
    console.log('接收者ID:', chatUserId.value)
    console.log('消息内容:', content || inputText.value)
    console.log('消息类型:', type)

    // 通过Socket发送消息
    if (isSocketConnected.value) {
      console.log('✅ 通过Socket发送消息')
      socketService.sendMessage(chatUserId.value, content || inputText.value, type)
    } else {
      console.log('⚠️ Socket未连接，离线模式')
      // 如果Socket未连接，仅添加到本地（离线模式）
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: currentUser.value.name,
        content: content || inputText.value,
        type,
        time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        avatar: currentUser.value.avatar,
      }
      addMessageToRoom(currentRoomId.value, newMessage)
    }

    inputText.value = ''
  } catch (error) {
    console.error('❌ 发送消息失败:', error)
  }
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

    try {
      // 通过Socket发送文件消息
      if (isSocketConnected.value) {
        socketService.sendFileMessage(
          chatUserId.value,
          file.name,
          formatFileSize(file.size),
          fileExt
        )
      } else {
        // 离线模式，仅添加到本地
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
        addMessageToRoom(currentRoomId.value, fileMessage)
      }
    } catch (error) {
      console.error('发送文件消息失败:', error)
    }
  })

  input.value = ''
}

// 压缩图片函数
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // 设置最大尺寸
        const maxWidth = 800
        const maxHeight = 800
        let width = img.width
        let height = img.height

        // 计算压缩比例
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        // 压缩质量设置为0.7
        const compressedData = canvas.toDataURL('image/jpeg', 0.7)
        resolve(compressedData)
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handleImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0 || !currentUser.value) return

  for (const file of Array.from(input.files)) {
    try {
      console.log('🖼️ 准备发送图片')
      console.log('Socket连接状态:', isSocketConnected.value)
      console.log('原始图片大小:', formatFileSize(file.size))

      // 压缩图片
      const imageContent = await compressImage(file)
      console.log('压缩后大小:', formatFileSize(imageContent.length * 0.75)) // Base64 approximately 1.33x original

      // 通过Socket发送图片消息
      if (isSocketConnected.value) {
        console.log('✅ 通过Socket发送图片')
        socketService.sendImageMessage(
          chatUserId.value,
          imageContent,
          file.name,
          formatFileSize(file.size)
        )
      } else {
        console.log('⚠️ Socket未连接，离线模式')
        // 离线模式，仅添加到本地
        const imageMessage: Message = {
          id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender: currentUser.value!.name,
          content: imageContent,
          type: 'image',
          time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          avatar: myAvatar.value,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
        }
        addMessageToRoom(currentRoomId.value, imageMessage)
      }
    } catch (error) {
      console.error('❌ 发送图片消息失败:', error)
      alert('图片处理失败，请重试')
    }
  }

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

// 组件挂载时的初始化
onMounted(async () => {
  // 从localStorage加载消息历史
  loadMessagesFromStorage()

  // 如果Socket未连接，尝试重新连接
  if (!isSocketConnected.value && currentUser.value) {
    await reconnectSocket()
  }

  // 监听消息接收
  socketService.onMessageReceived(handleMessageReceived)

  // 加入当前聊天室
  if (currentUser.value && chatUser.value && isSocketConnected.value) {
    try {
      await socketService.joinRoom(currentUser.value.id, chatUser.value.id)
      console.log(`✅ 已加入与 ${chatUser.value.name} 的聊天室`)
    } catch (error) {
      console.error('加入聊天室失败:', error)
    }
  }
})

// 组件卸载时清理
onUnmounted(() => {
  // 移除消息监听
  socketService.offMessageReceived(handleMessageReceived)
})

// 监听聊天对象变化，切换聊天室
watch(chatUserId, async (newId, oldId) => {
  if (newId && newId !== oldId && currentUser.value) {
    // 消息会自动从 computed messages 中加载，无需手动重置

    // 加入新的聊天室
    if (isSocketConnected.value) {
      try {
        await socketService.joinRoom(currentUser.value.id, newId)
        console.log(`✅ 切换到与用户 ${newId} 的聊天室`)
      } catch (error) {
        console.error('切换聊天室失败:', error)
      }
    }
  }
})
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
