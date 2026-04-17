# GitHub Pages 部署指南

本项目已配置为可以直接部署到 GitHub Pages 的纯静态博客。

## 项目特点

- ✅ 纯静态页面，无需后端服务器
- ✅ 自动部署到 GitHub Pages
- ✅ 支持 Markdown 文章渲染
- ✅ 响应式设计，适配移动端
- ❌ 评论功能已移除（GitHub Pages 不支持动态后端）

## 自动部署（推荐）

### 1. 启用 GitHub Pages

1. 进入仓库的 **Settings** > **Pages**
2. 在 **Source** 部分，选择 **GitHub Actions**
3. 保存设置

### 2. 配置 GitHub Actions

项目已包含 GitHub Actions 工作流文件 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)，会自动执行以下操作：

- 检出代码
- 安装 Node.js 和依赖
- 构建生产版本
- 部署到 GitHub Pages

### 3. 触发部署

#### 方式一：推送到 main 分支
```bash
git add .
git commit -m "更新内容"
git push origin main
```

#### 方式二：手动触发
1. 进入仓库的 **Actions** 标签页
2. 选择 **Deploy to GitHub Pages** 工作流
3. 点击 **Run workflow**
4. 选择分支（通常是 main）
5. 点击 **Run workflow**

### 4. 查看部署状态

- 在 **Actions** 标签页查看构建进度
- 构建成功后，会在 **Pages** 设置页看到部署的 URL
- 通常格式为：`https://<username>.github.io/blog/`

## 手动部署

如果你想在本地构建并手动部署：

### 1. 安装依赖
```bash
npm install
```

### 2. 构建生产版本
```bash
npm run build
```

构建完成后，`dist/` 目录将包含所有静态文件。

### 3. 部署到 gh-pages 分支

```bash
# 安装 gh-pages 工具
npm install -D gh-pages

# 部署
npx gh-pages -d dist
```

或者直接添加到 `package.json` 脚本：
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

然后运行：
```bash
npm run deploy
```

## 配置说明

### Vite 配置

[`vite.config.js`](vite.config.js) 中已配置：

```javascript
{
  base: '/blog/',  // GitHub Pages 路径，格式为 /<仓库名>/
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'markdown-vendor': ['marked', 'highlight.js']
        }
      }
    }
  }
}
```

### GitHub Actions 配置

工作流分为两个阶段：

1. **Build Job**: 构建静态文件
2. **Deploy Job**: 部署到 GitHub Pages

## 自定义域名

如果你想使用自定义域名：

1. 在仓库的 **Settings** > **Pages** > **Custom domain** 中添加你的域名
2. 在 `public/` 目录创建 `CNAME` 文件，内容为你的域名（如 `example.com`）
3. 配置 DNS 记录指向 GitHub Pages

## 更新博客内容

### 添加新文章

1. 在 `src/utils/posts.js` 中添加新的文章配置
2. 在 `articles/` 目录创建对应的 Markdown 文件
3. 提交并推送更改

### 修改样式

编辑 `src/styles/main.css` 文件。

### 修改组件

编辑 `src/components/` 下的 Vue 组件。

## 故障排除

### 构建失败

检查 Node.js 版本（需要 18+）：
```bash
node -v
```

重新安装依赖：
```bash
rm -rf node_modules package-lock.json
npm install
```

### 404 错误

确保 `vite.config.js` 中的 `base` 路径正确，格式为 `/<仓库名>/`。

### 样式或脚本加载失败

检查浏览器控制台，确认资源路径是否正确。可能需要清除浏览器缓存。

### GitHub Actions 权限问题

在仓库的 **Settings** > **Actions** > **General** > **Workflow permissions** 中，确保选择了 **Read and write permissions**。

## 性能优化建议

1. **图片优化**: 使用 WebP 格式，压缩图片
2. **懒加载**: 文章列表和图片使用懒加载
3. **缓存**: 利用浏览器缓存静态资源
4. **CDN**: 考虑使用 CDN 加速（如 jsDelivr）

## 安全注意事项

- 不要将敏感信息提交到仓库
- 使用环境变量管理 API 密钥
- 定期更新依赖以修复安全漏洞

## 相关资源

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [Vite 官方文档](https://vitejs.dev/)
- [Vue 3 官方文档](https://vuejs.org/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
