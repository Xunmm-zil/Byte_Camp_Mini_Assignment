
// 文件类型对应的图标（可使用图片或字体图标）
export const FILE_ICONS: Record<string, string> = {
  // 文档类
  'docx': '📄',
  'doc': '📄',
  'pdf': '📄',
  'txt': '📄',
  // 演示类
  'pptx': '📊',
  'ppt': '📊',
  // 表格类
  'xlsx': '📈',
  'xls': '📈',
  // 压缩类
  'zip': '📦',
  'rar': '📦',
  '7z': '📦',
  // 代码类
  'js': '💻',
  'ts': '💻',
  'html': '💻',
  'css': '💻',
  // 音频类
  'mp3': '🎵',
  'wav': '🎵',
  'ogg': '🎵',
  // 视频类
  'mp4': '🎬',
  'mov': '🎬',
  'avi': '🎬',
  // 默认图标
  'default': '📌'
};

// 文件类型对应的样式类名（可选，用于差异化样式）
export const FILE_CLASSES: Record<string, string> = {
    'docx': 'file-doc',
  'doc': 'file-doc',
  'pdf': 'file-pdf',
  'pptx': 'file-ppt',
  'ppt': 'file-ppt',
  'xlsx': 'file-xls',
  'xls': 'file-xls',
  'zip': 'file-zip',
  'rar': 'file-zip',
  'mp3': 'file-audio',
  'mp4': 'file-video',
  'js': 'file-code',
  'default': 'file-default'
};