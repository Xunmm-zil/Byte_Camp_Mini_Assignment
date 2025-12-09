# 个人简历网页

这是一个使用纯 HTML、CSS 和 JavaScript 制作的响应式个人简历网页。

## 项目简介

本项目是一个现代化的个人简历展示页面，采用暗色主题设计，具有良好的视觉效果和用户体验。

## 功能特点

- 响应式设计，支持多种设备浏览
- 暗色主题，现代化的视觉风格
- 动态加载效果，提升用户体验
- 分区域展示个人信息、教育背景、项目经验、技能特长等
- 支持自定义样式，使用 LESS 预处理器

## 技术栈

- HTML5 - 页面结构
- CSS3 - 样式设计
- LESS - CSS 预处理器
- JavaScript - 交互效果

## 项目结构

```
作业一个人简历/
├── CV.html              # 主页面文件
├── css/
│   ├── reset.css        # 样式重置文件
│   ├── CV.less          # LESS 源文件
│   ├── CV.css           # 编译后的 CSS 文件
│   └── CV.css.map       # CSS 映射文件
├── js/
│   └── CV.js            # 交互脚本
├── img/
│   └── image.png        # 个人照片
└── README.md            # 项目说明文档
```

## 使用说明

### 直接打开

双击 `CV.html` 文件即可在浏览器中查看简历页面。

### 使用本地服务器

推荐使用本地服务器运行，以获得更好的体验：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js (需要安装 http-server)
npx http-server -p 8000
```

然后在浏览器中访问：`http://localhost:8000/CV.html`

## 自定义修改

### 修改个人信息

编辑 [CV.html](CV.html) 文件，找到对应的内容区域进行修改：

- 个人基本信息：第 17-43 行
- 教育背景：第 48 行开始
- 项目经验：对应的 section 区域
- 技能特长：对应的 section 区域

### 修改样式

如果需要修改样式：

1. 编辑 [css/CV.less](css/CV.less) 文件
2. 使用 LESS 编译器编译为 CSS：
   ```bash
   lessc css/CV.less css/CV.css
   ```

或者直接修改 [css/CV.css](css/CV.css) 文件。

### 更换照片

将你的照片替换 [img/image.png](img/image.png) 文件，或在 HTML 中修改图片路径。

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
- 其他现代浏览器

## 许可

本项目仅供学习和个人使用。
