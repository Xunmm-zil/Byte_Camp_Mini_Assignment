// 消息类型
export type MessageType = 'text' | 'emoji' | 'file' | 'image';

// 消息接口
export interface Message {
  id: string;
  sender: string;
  content: string;
  type: MessageType;
  time: string;
  avatar: string
  fileName?: string; // 文件消息特有
  fileSize?: string; // 文件消息特有
  fileType?: string; // 文件消息特有
  fileUrl?:string;
}

// 联系人接口
export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

// 用户接口
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}
