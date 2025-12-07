/**
 * 服务器测试脚本
 * 用于快速测试服务器功能
 */

const io = require('socket.io-client')

const SERVER_URL = 'http://localhost:3000'

// 测试用户数据
const testUser1 = {
  userId: '1',
  username: 'linxi',
  name: '林熙',
  avatar: 'http://example.com/avatar1.jpg'
}

const testUser2 = {
  userId: '4',
  username: 'yeqingyu',
  name: '叶清语',
  avatar: 'http://example.com/avatar4.jpg'
}

console.log('开始测试聊天服务器...\n')

// 创建第一个客户端连接
const client1 = io(SERVER_URL, {
  transports: ['websocket']
})

client1.on('connect', () => {
  console.log('✅ 客户端1已连接')

  // 用户1登录
  client1.emit('user:login', testUser1)
})

client1.on('user:login:success', (data) => {
  console.log('✅ 用户1登录成功:', data.user.name)

  // 创建第二个客户端连接
  setTimeout(() => {
    const client2 = io(SERVER_URL, {
      transports: ['websocket']
    })

    client2.on('connect', () => {
      console.log('✅ 客户端2已连接')

      // 用户2登录
      client2.emit('user:login', testUser2)
    })

    client2.on('user:login:success', (data) => {
      console.log('✅ 用户2登录成功:', data.user.name)

      // 用户1加入与用户4的聊天室
      client1.emit('room:join', {
        userId: testUser1.userId,
        targetUserId: testUser2.userId
      })
    })

    client2.on('user:online', (user) => {
      console.log('📢 收到用户上线通知:', user.name)
    })
  }, 1000)
})

client1.on('room:joined', (data) => {
  console.log('✅ 加入房间成功:', data.roomId)

  // 发送测试消息
  setTimeout(() => {
    client1.emit('message:send', {
      receiverId: testUser2.userId,
      content: '你好！这是一条测试消息',
      type: 'text'
    })
    console.log('📤 已发送测试消息')
  }, 500)
})

client1.on('message:received', (message) => {
  console.log('📨 收到消息:', {
    from: message.senderName,
    content: message.content,
    time: message.time
  })

  // 测试完成，断开连接
  setTimeout(() => {
    console.log('\n✅ 所有测试通过！')
    console.log('正在关闭连接...')
    client1.disconnect()
    process.exit(0)
  }, 1000)
})

client1.on('disconnect', () => {
  console.log('❌ 客户端1已断开')
})

client1.on('connect_error', (error) => {
  console.error('❌ 连接错误:', error.message)
  console.log('\n请确保服务器已启动: npm start')
  process.exit(1)
})

// 超时保护
setTimeout(() => {
  console.error('❌ 测试超时')
  process.exit(1)
}, 10000)
