/**
 * 消息处理模块
 * 处理消息格式化、验证等
 */

class MessageHandler {
  /**
   * 创建消息对象
   */
  createMessage({ senderId, senderName, receiverId, content, type = 'text', avatar }) {
    return {
      id: this.generateMessageId(),
      senderId,
      senderName,
      receiverId,
      content,
      type,
      avatar,
      time: this.formatTime(new Date()),
      timestamp: Date.now()
    }
  }

  /**
   * 生成消息ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 格式化时间
   */
  formatTime(date) {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  }

  /**
   * 验证消息内容
   */
  validateMessage(message) {
    if (!message.content || message.content.trim() === '') {
      return { valid: false, error: '消息内容不能为空' }
    }

    if (message.content.length > 5000) {
      return { valid: false, error: '消息内容过长' }
    }

    return { valid: true }
  }

  /**
   * 创建系统消息
   */
  createSystemMessage(content) {
    return {
      id: this.generateMessageId(),
      type: 'system',
      content,
      time: this.formatTime(new Date()),
      timestamp: Date.now()
    }
  }

  /**
   * 创建文件消息
   */
  createFileMessage({ senderId, senderName, receiverId, fileName, fileSize, fileType, avatar }) {
    return {
      id: this.generateMessageId(),
      senderId,
      senderName,
      receiverId,
      content: '',
      type: 'file',
      avatar,
      fileName,
      fileSize,
      fileType,
      time: this.formatTime(new Date()),
      timestamp: Date.now()
    }
  }

  /**
   * 创建图片消息
   */
  createImageMessage({ senderId, senderName, receiverId, content, fileName, fileSize, avatar }) {
    return {
      id: this.generateMessageId(),
      senderId,
      senderName,
      receiverId,
      content,
      type: 'image',
      avatar,
      fileName,
      fileSize,
      time: this.formatTime(new Date()),
      timestamp: Date.now()
    }
  }
}

module.exports = new MessageHandler()
