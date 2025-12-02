<template>
  <div class="chat-window">
    <!-- 头部信息 -->
    <div class="chat-header">
      <!-- 隐藏的文件输入框 -->
      <input
        type="file"
        ref="fileInput"
        class="hidden-input"
        @change="handleFileSelected"
        multiple
      />

      <!-- 隐藏的图片输入框 -->
      <input
        type="file"
        ref="imageInput"
        class="hidden-input"
        @change="handleImageSelected"
        accept="image/*"
        multiple
      />

      <div class="header-actions">
        <!-- 视频通话按钮 -->
        <button class="action-btn" @click="showUnavailableMessage">📹</button>
        <!-- 语音通话按钮 -->
        <button class="action-btn" @click="showUnavailableMessage">📞</button>
        <!-- 文件发送按钮 -->
        <button class="action-btn" @click="triggerFileSelection">📎</button>
        <!-- 图片发送按钮 -->
        <button class="action-btn" @click="triggerImageSelection">🖼️</button>
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="messages-container">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="{ 'sender-me': message.sender === 'me' }"
      >
        <div class="message-main">
          <img :src="message.avatar" alt="用户头像" class="message-avatar" />
          <div class="message-content">
            <!-- 文本消息 -->
            <template v-if="message.type === 'text'">
              {{ message.content }}
            </template>

            <!-- 表情包消息 -->
            <template v-else-if="message.type === 'emoji'">
              <span class="emoji">{{ message.content }}</span>
            </template>

            <!-- 图片消息 -->
            <template v-else-if="message.type === 'image'">
              <div class="image-container">
                <img :src="message.content" :alt="message.fileName" class="message-image" />
                <div class="image-meta">{{ message.fileName }} ({{ message.fileSize }})</div>
              </div>
            </template>

            <!-- 文件消息 -->
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

<script setup lang="ts" name="messageItem1">
import { ref, defineProps, defineEmits } from 'vue'
import { type Message } from '@/types'
import { FILE_ICONS, FILE_CLASSES } from '@/utils/fileUtils'

// 预览图片
const previewImage = (url: string) => {
  // 实际项目中可以打开一个大图预览弹窗
  window.open(url, '_blank')
}

// 定义处理图片路径的函数
const getImageUrl = (url: string) => {
  return new URL(url, import.meta.url).href
}

const personalavatar = getImageUrl('../assets/img/头像2.jpg')
// 自己的头像
const myAvatar = getImageUrl('../assets/img/头像4.jpg')

const messages = ref<Message[]>([
  {
    id: '1',
    sender: '李苒',
    content: '项目写好了没呀',
    type: 'text',
    time: '2025/12/02 09:08',
    avatar: personalavatar,
  },
  {
    id: '2',
    sender: 'me',
    content: '还没',
    type: 'text',
    time: '2025/12/02 09:10',
    avatar: myAvatar,
  },
  {
    id: '3',
    sender: '李苒',
    content: '哎呀',
    type: 'text',
    time: '2025/12/02 09:11',
    avatar: personalavatar,
  },
  {
    id: '4',
    sender: '李苒',
    content: '😆',
    type: 'emoji',
    time: '2025/12/02 09:12',
    avatar: personalavatar,
  },
])

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

// 发送消息函数（添加头像信息）
const sendMessage = (type: 'text' | 'emoji' = 'text', content?: string) => {
  // 文本消息为空时不发送
  if (type === 'text' && !inputText.value.trim()) return

  // 构建新消息（包含头像信息）
  const newMessage: Message = {
    id: Date.now().toString(),
    sender: 'me',
    content: content || inputText.value,
    type,
    time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    avatar: getImageUrl('../assets/img/头像4.jpg'), // 添加自己的头像
  }

  // 添加到消息列表
  messages.value.push(newMessage)
  // 清空输入框
  inputText.value = ''
}

// 获取文件输入框和图片输入框的引用
const fileInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
// 显示未开通提示
const showUnavailableMessage = () => {
  alert('该功能暂未开通，敬请期待！')
}

// 触发文件选择对话框
const triggerFileSelection = () => {
  fileInput.value?.click()
}

// 触发图片选择对话框
const triggerImageSelection = () => {
  imageInput.value?.click()
}

// 处理文件选择
const handleFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  Array.from(input.files).forEach((file) => {
    // 获取文件MIME类型和后缀
    const fileType = file.type
    const fileExt = getFileExtension(file.name)

    const fileMessage: Message = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'me',
      content: '',
      type: 'file',
      time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      avatar: myAvatar,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: fileExt, // 存储文件后缀用于样式匹配
    }

    messages.value.push(fileMessage)
  })

  input.value = ''
}

// 处理图片选择
const handleImageSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  Array.from(input.files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageMessage: Message = {
        id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'me',
        content: e.target?.result as string,
        type: 'image',
        time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        avatar: myAvatar,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
      }

      messages.value.push(imageMessage)
    }
    reader.readAsDataURL(file)
  })

  input.value = ''
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 获取文件后缀
const getFileExtension = (fileName?: string): string => {
  if (!fileName) return 'unknown'
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ext || 'unknown'
}

// 根据文件类型获取图标
const getFileIcon = (fileType?: string) => {
  if (!fileType) return FILE_ICONS.default
  return FILE_ICONS[fileType as keyof typeof FILE_ICONS] || FILE_ICONS.default
}

// 根据文件类型获取样式类
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

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 18px;
  margin: 0;
}

.contact-desc {
  font-size: 14px;
  color: #b0b3b8;
  margin: 2px 0 0 0;
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
  /* 隐藏滚动条 - WebKit 浏览器 (Chrome, Safari) */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
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
/* 头像样式 */
.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0; /* 防止头像被压缩 */
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

/* 图片消息样式 */
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

/* 文件消息基础样式 */
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

/* 不同文件类型的样式 */
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
/* 隐藏输入框 */
.hidden-input {
  display: none;
}
</style>
