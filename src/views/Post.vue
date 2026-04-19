<script setup>
import { ref, onMounted, inject, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'
import { loadPost } from '../utils/posts.js'

// 配置 marked 支持数学公式
marked.use(markedKatex({
  throwOnError: false,
  displayMode: true
}))

const route = useRoute()
const router = useRouter()
const theme = inject('theme')

const post = ref(null)
const loading = ref(true)
const notFound = ref(false)
const readingProgress = ref(0)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${year}.${month}.${day}`
}

const estimateReadTime = (text) => {
  return Math.max(1, Math.ceil(text.length / 500))
}

const handleScroll = () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrolled = window.scrollY
  readingProgress.value = docHeight > 0 ? (scrolled / docHeight) * 100 : 0
}

const getCoverStyle = (post) => {
  if (!post) return {}
  if (post.cover) return { backgroundImage: `url(${post.cover})` }
  const config = post.coverConfig || {}
  return {
    background: `linear-gradient(135deg, ${config.bg || '#1e1e2e'} 0%, ${config.accent2 || '#2a2a3e'} 100%)`,
  }
}

const getAccentColor = (post) => {
  const config = post.coverConfig || {}
  return config.accent || '#f7df1e'
}

const getCodeSymbol = (post) => {
  const config = post.coverConfig || {}
  return config.code || '{ }'
}

const getSymbol1 = (post) => {
  const config = post.coverConfig || {}
  return config.symbol || '//'
}

const getSymbol2 = (post) => {
  const config = post.coverConfig || {}
  return config.accent2 || '#ffbd2a'
}

const loadPostData = async (slug) => {
  loading.value = true
  notFound.value = false
  
  try {
    post.value = await loadPost(slug)
    document.title = `${post.value.title}`
  } catch (err) {
    notFound.value = true
    document.title = '文章未找到 - 我的博客'
  } finally {
    loading.value = false
  }
}

const renderMarkdown = (markdown) => {
  let processedMarkdown = markdown.replace(/:([a-zA-Z0-9_]+):/g, (match, emoji) => {
    const emojiMap = {
      bug: '🐛',
      star: '⭐',
      heart: '❤️',
      thumbsup: '👍',
      thumbsdown: '👎',
      laugh: '😄',
      cry: '😢',
      angry: '😠',
      confused: '😕',
      cool: '😎',
      happy: '😊',
      sad: '😔',
      surprised: '😮',
      wink: '😉',
      fire: '🔥',
      rocket: '🚀',
      book: '📚',
      code: '💻',
      coffee: '☕',
      lightbulb: '💡',
      check: '✅',
      x: '❌'
    }
    return emojiMap[emoji] || match
  })
  
  // 获取文章分类，用于构建正确的图片路径
  const category = post.value?.category || 'JavaScript'
  
  // 处理 Markdown 格式图片路径：将相对路径 ./picture/ 转换为绝对路径 /posts/{category}/picture/
  processedMarkdown = processedMarkdown.replace(
    /!\[(.*?)\]\(\.\.?\/picture\/(.*?)\)/g, 
    `![$1](/posts/${category}/picture/$2)`
  )
  
  // 处理 HTML 格式图片路径：<img src="./picture/..."> 转换为 <img src="/posts/{category}/picture/...">
  processedMarkdown = processedMarkdown.replace(
    /<img([^>]*?)src=["']\.\.?\/picture\/([^"']+)["']([^>]*)>/g, 
    `<img$1src="/posts/${category}/picture/$2"$3>`
  )
  
  processedMarkdown = processedMarkdown.replace(/\|\s*\.\.\s*\|\s*\.\.\s*\|/g, '| --- | --- |')
  
  return marked.parse(processedMarkdown, {
    breaks: true,
    gfm: true,
    headerIds: false
  })
}

onMounted(async () => {
  await loadPostData(route.params.slug)
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  if (post.value) {
    setTimeout(() => {
      document.querySelectorAll('.post-detail-content pre code').forEach(block => {
        hljs.highlightElement(block)
      })
    }, 0)
  }
})

watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    loadPostData(newSlug)
  }
})
</script>

<template>
  <div>
    <div class="reading-progress" :style="{ width: readingProgress + '%' }"></div>
    
    <article class="post-detail">
      <div class="container">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="notFound" class="post-detail-header">
          <h1 class="post-detail-title">文章未找到</h1>
          <p style="color: var(--color-text-secondary)">请返回首页查看所有文章</p>
        </div>

        <template v-else-if="post">
          <header class="post-detail-header">
            <div class="post-detail-cover" :style="getCoverStyle(post)">
              <div v-if="!post.cover" class="post-detail-cover-content">
                <div class="post-detail-cover-code" :style="{ color: getAccentColor(post) }">
                  {{ getCodeSymbol(post) }}
                </div>
                <div class="post-detail-cover-decorators">
                  <span class="decorator" :style="{ color: getAccentColor(post) }">{{ getSymbol1(post) }}</span>
                  <span class="decorator" :style="{ color: getAccentColor(post) }">( )</span>
                  <span class="decorator" :style="{ color: getSymbol2(post) }">=</span>
                  <span class="decorator" :style="{ color: getAccentColor(post) }">;</span>
                  <span class="decorator" :style="{ color: getSymbol2(post) }">{{ getSymbol1(post) }}</span>
                </div>
              </div>
              <div class="post-detail-cover-shine" :style="{ background: `linear-gradient(105deg, transparent 40%, ${getAccentColor(post)}10 50%, transparent 60%)` }"></div>
            </div>
            <h1 class="post-detail-title">{{ post.title }}</h1>
            <div class="post-detail-meta">
              <span>📅 {{ formatDate(post.date) }}</span>
              <span>·</span>
              <span>{{ estimateReadTime(post.markdown) }} 分钟阅读</span>
            </div>
            <div class="post-detail-tags">
              <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
            </div>
          </header>

          <div class="post-detail-content-wrapper">
            <div 
              class="post-detail-content" 
              v-html="renderMarkdown(post.markdown)"
            ></div>
          </div>

          <footer class="post-detail-footer">
            <RouterLink to="/" class="back-link">← 返回首页</RouterLink>
          </footer>
        </template>
      </div>
    </article>
  </div>
</template>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--color-primary);
  z-index: 1000;
  transition: width 0.1s ease;
}

.post-detail {
  padding: 32px 0 60px;
}

.post-detail-header {
  margin-bottom: 48px;
}

.post-detail-cover {
  width: 100%;
  height: 320px;
  border-radius: var(--radius);
  margin-bottom: 32px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.post-detail-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 70%);
}

.post-detail-cover-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.post-detail-cover-code {
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-shadow: 0 0 40px currentColor;
  margin-bottom: 16px;
}

.post-detail-cover-decorators {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 1.4rem;
}

.post-detail-cover-decorators .decorator {
  opacity: 0.5;
}

.post-detail-cover-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.6;
}

.post-detail-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.post-detail-meta {
  font-size: 0.95rem;
  color: var(--color-text-tertiary);
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.post-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-detail-tags span {
  font-size: 0.78rem;
  padding: 4px 12px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  border-radius: 50px;
  font-weight: 500;
}

.post-detail-content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 40px;
  border: 1px solid var(--color-border);
}

.post-detail-content {
  font-size: 1.08rem;
  line-height: 1.9;
  color: var(--color-text);
}

.post-detail-content h2 {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 48px 0 16px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.post-detail-content h3 {
  font-size: 1.35rem;
  font-weight: 600;
  margin: 32px 0 12px;
  color: var(--color-text);
}

.post-detail-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 24px 0 8px;
  color: var(--color-text);
}

.post-detail-content p {
  margin-bottom: 20px;
}

.post-detail-content a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition);
}

.post-detail-content a:hover {
  text-decoration: underline;
  color: var(--color-primary-dark);
}

.post-detail-content pre {
  background: #0d1117;
  padding: 20px;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  margin: 24px 0;
  border: 1px solid var(--color-border);
}

.post-detail-content pre code {
  background: transparent;
  padding: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  border: none;
  color: #c9d1d9;
}

.post-detail-content code:not(pre code) {
  background: var(--color-tag-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.88em;
  color: var(--color-primary);
}

.post-detail-content ul,
.post-detail-content ol {
  margin: 16px 0;
  padding-left: 24px;
}

.post-detail-content li {
  margin-bottom: 8px;
}

.post-detail-content li::marker {
  color: var(--color-primary);
}

.post-detail-content blockquote {
  border-left: 4px solid var(--color-primary);
  padding: 18px 24px;
  margin: 28px 0;
  background: var(--color-primary-light);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--color-text);
  font-style: italic;
  font-size: 1.02rem;
}

.post-detail-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  font-size: 0.98rem;
}

.post-detail-content th,
.post-detail-content td {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  text-align: left;
}

.post-detail-content th {
  background: var(--color-tag-bg);
  font-weight: 600;
}

.post-detail-content img {
  max-width: 100%;
  border-radius: var(--radius-sm);
  margin: 24px 0;
}

.post-detail-footer {
  margin-top: 60px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}

.back-link:hover {
  background: var(--color-primary-light);
  text-decoration: none;
}

.loading {
  text-align: center;
  padding: 100px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .post-detail-cover {
    height: 200px;
  }

  .post-detail-cover-code {
    font-size: 3rem;
  }

  .post-detail-cover-decorators {
    font-size: 1rem;
    gap: 14px;
  }

  .post-detail-title {
    font-size: 1.8rem;
  }

  .post-detail-content-wrapper {
    padding: 24px;
  }

  .post-detail-content {
    font-size: 1rem;
  }
}
</style>
