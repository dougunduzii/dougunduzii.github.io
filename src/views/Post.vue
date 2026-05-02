<script setup>
import { ref, onMounted, inject, watch, computed, nextTick } from 'vue'
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
  if (config.image) {
    return {
      backgroundImage: `url(${config.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return {
    background: `linear-gradient(135deg, ${config.bg || '#1e1e2e'} 0%, ${config.accent2 || '#2a2a3e'} 100%)`,
  }
}

const hasImageCover = (post) => {
  const config = post.coverConfig || {}
  return !!config.image
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
  
  // 处理 Markdown 格式图片路径：将相对路径 ./xxx/ 转换为绝对路径 /posts/{category}/xxx/
  processedMarkdown = processedMarkdown.replace(
    /!\[(.*?)\]\(\.\.?(\/[^)]+)\)/g,
    `![$1](/posts/${category}$2)`
  )

  // 处理 HTML 格式图片路径：<img src="./xxx/..."> 转换为 <img src="/posts/{category}/xxx/...">
  processedMarkdown = processedMarkdown.replace(
    /<img([^>]*?)src=["']\.\.?(\/[^"']+)["']([^>]*)>/g,
    `<img$1src="/posts/${category}$2"$3>`
  )
  
  processedMarkdown = processedMarkdown.replace(/\|\s*\.\.\s*\|\s*\.\.\s*\|/g, '| --- | --- |')
  
  return marked.parse(processedMarkdown, {
    breaks: true,
    gfm: true,
    headerIds: false
  })
}

const enhanceCodeBlocks = () => {
  const content = document.querySelector('.post-detail-content')
  if (!content) return

  const pres = content.querySelectorAll('pre')
  pres.forEach(pre => {
    if (pre.closest('.code-block-wrapper')) return

    const code = pre.querySelector('code')
    const langClass = code?.className.match(/language-(\w+)/)?.[1]
    const langName = langClass || 'text'

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'

    const topbar = document.createElement('div')
    topbar.className = 'code-block-topbar'

    const leftArea = document.createElement('div')
    leftArea.className = 'code-block-topbar-left'

    const dots = document.createElement('span')
    dots.className = 'code-dots'
    dots.innerHTML = '<i></i><i></i><i></i>'

    const langLabel = document.createElement('span')
    langLabel.className = 'code-lang-label'
    langLabel.textContent = langName

    leftArea.appendChild(dots)
    leftArea.appendChild(langLabel)

    const copyBtn = document.createElement('button')
    copyBtn.className = 'copy-btn'
    copyBtn.textContent = 'Copy'
    copyBtn.addEventListener('click', async () => {
      const text = code?.textContent || pre.textContent || ''
      try {
        await navigator.clipboard.writeText(text)
        copyBtn.textContent = 'Copied ✓'
        copyBtn.classList.add('copied')
        setTimeout(() => {
          copyBtn.textContent = 'Copy'
          copyBtn.classList.remove('copied')
        }, 2000)
      } catch {
        copyBtn.textContent = 'Failed ✗'
        setTimeout(() => {
          copyBtn.textContent = 'Copy'
        }, 2000)
      }
    })

    topbar.appendChild(leftArea)
    topbar.appendChild(copyBtn)

    const body = document.createElement('div')
    body.className = 'code-block-body'

    const text = (code?.textContent || '').replace(/\n$/, '')
    const lines = text.split('\n')
    const lineCountEl = document.createElement('div')
    lineCountEl.className = 'line-numbers'
    for (let i = 1; i <= Math.max(lines.length, 1); i++) {
      const span = document.createElement('span')
      span.textContent = i
      lineCountEl.appendChild(span)
    }

    body.appendChild(lineCountEl)

    pre.parentNode.insertBefore(wrapper, pre)
    wrapper.appendChild(topbar)
    wrapper.appendChild(body)
    body.appendChild(pre)
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
      enhanceCodeBlocks()
    }, 0)
  }
})

watch(() => route.params.slug, async (newSlug) => {
  if (newSlug) {
    await loadPostData(newSlug)
    await nextTick()
    setTimeout(() => {
      document.querySelectorAll('.post-detail-content pre code').forEach(block => {
        hljs.highlightElement(block)
      })
      enhanceCodeBlocks()
    }, 0)
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
              <div v-if="!post.cover && !hasImageCover(post)" class="post-detail-cover-content">
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
            <RouterLink to="/" class="back-link">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
              返回首页
            </RouterLink>
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
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  z-index: 1000;
  transition: width 0.1s ease;
  box-shadow: 0 0 8px var(--color-primary-glow);
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
  box-shadow: var(--shadow-lg);
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
  background: linear-gradient(135deg, var(--color-text) 0%, var(--color-text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  justify-content: center;
}

.post-detail-tags span {
  font-size: 0.78rem;
  padding: 4px 12px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  border-radius: 50px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.post-detail-tags span:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px);
}

.post-detail-content-wrapper {
  max-width: 980px;
  margin: 0 auto;
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 44px 48px;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.3s ease;
}

.post-detail-content-wrapper:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04);
}

.post-detail-content {
  font-size: 1.08rem;
  line-height: 1.9;
  color: var(--color-text);
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
  transform: translateX(-4px);
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
    padding: 24px 20px;
  }

  .post-detail-content {
    font-size: 1rem;
  }
}
</style>

<style>
.post-detail-content {
  --heading-accent: var(--color-primary);
}

.post-detail-content h2 {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 48px 0 16px;
  padding: 20px 0 0 18px;
  border-top: 1px solid var(--color-border);
  border-left: 4px solid transparent;
  border-image: linear-gradient(180deg, var(--color-primary), var(--color-accent)) 1;
  letter-spacing: -0.02em;
  color: var(--color-text);
  position: relative;
}

.post-detail-content h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 60px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--color-primary), transparent);
}

.post-detail-content h3 {
  font-size: 1.35rem;
  font-weight: 600;
  margin: 32px 0 12px;
  padding-left: 14px;
  border-left: 3px solid var(--color-primary);
  color: var(--color-text);
}

.post-detail-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 24px 0 8px;
  color: var(--color-text);
  position: relative;
  display: inline-block;
}

.post-detail-content p {
  margin-bottom: 20px;
}

.post-detail-content a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition);
  position: relative;
}

.post-detail-content a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 0;
  height: 1.5px;
  background: var(--color-primary);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
}

.post-detail-content a:hover {
  color: var(--color-primary-hover);
}

.post-detail-content a:hover::after {
  width: 100%;
}

.post-detail-content .code-block-wrapper {
  margin: 28px 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #1a1b26;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
}

.post-detail-content .code-block-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: linear-gradient(180deg, rgba(60, 62, 80, 0.4) 0%, rgba(40, 42, 58, 0.3) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  user-select: none;
}

.post-detail-content .code-block-topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-detail-content .code-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.post-detail-content .code-dots i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  display: block;
}

.post-detail-content .code-dots i:nth-child(1) { background: #ff5f57; }
.post-detail-content .code-dots i:nth-child(2) { background: #febc2e; }
.post-detail-content .code-dots i:nth-child(3) { background: #28c840; }

.post-detail-content .code-lang-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.04em;
  text-transform: lowercase;
  padding-left: 6px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.post-detail-content .copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s ease;
  line-height: 1.4;
  letter-spacing: 0.02em;
}

.post-detail-content .copy-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.18);
}

.post-detail-content .copy-btn.copied {
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.25);
  background: rgba(52, 211, 153, 0.08);
}

.post-detail-content .code-block-body {
  display: flex;
  position: relative;
}

.post-detail-content .line-numbers {
  flex-shrink: 0;
  padding: 16px 0;
  padding-left: 16px;
  padding-right: 12px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  user-select: none;
  min-width: 36px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.15);
  counter-reset: line;
}

.post-detail-content .line-numbers span {
  display: block;
  height: calc(14px * 1.6);
}

.post-detail-content .code-block-body pre {
  margin: 0;
  padding: 16px 20px;
  border: none;
  border-radius: 0;
  background: transparent;
  overflow-x: auto;
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.6;
}

.post-detail-content .code-block-body pre code {
  background: transparent;
  padding: 0;
  font-size: 14px;
  line-height: 1.6;
  border: none;
  color: var(--color-code-text);
  white-space: pre;
  overflow: visible;
  font-variant-ligatures: none;
  font-feature-settings: 'liga' 0, 'calt' 0;
}

.post-detail-content .code-block-body pre code .hljs-operator,
.post-detail-content .code-block-body pre code .hljs-literal {
  color: var(--color-code-text);
}

.post-detail-content .code-block-body::-webkit-scrollbar,
.post-detail-content .code-block-body pre::-webkit-scrollbar {
  height: 6px;
}

.post-detail-content .code-block-body::-webkit-scrollbar-track,
.post-detail-content .code-block-body pre::-webkit-scrollbar-track {
  background: transparent;
}

.post-detail-content .code-block-body::-webkit-scrollbar-thumb,
.post-detail-content .code-block-body pre::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.post-detail-content .code-block-body::-webkit-scrollbar-thumb:hover,
.post-detail-content .code-block-body pre::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.post-detail-content code:not(pre code) {
  background: var(--color-inline-code-bg);
  color: var(--color-inline-code-text);
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.88em;
  font-family: var(--font-mono);
  border: 1px solid transparent;
  border-color: color-mix(in srgb, var(--color-inline-code-text) 10%, transparent);
}

.post-detail-content ul,
.post-detail-content ol {
  margin: 16px 0;
  padding-left: 24px;
}

.post-detail-content li {
  margin-bottom: 8px;
  line-height: 1.8;
}

.post-detail-content li::marker {
  color: var(--color-primary);
}

.post-detail-content ul ul,
.post-detail-content ol ol,
.post-detail-content ul ol,
.post-detail-content ol ul {
  margin: 4px 0;
}

.post-detail-content blockquote {
  border-left: 4px solid var(--color-primary);
  padding: 18px 24px;
  margin: 28px 0;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, transparent 80%);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--color-text);
  font-style: italic;
  font-size: 1.02rem;
  position: relative;
}

.post-detail-content blockquote::before {
  content: '\201C';
  position: absolute;
  top: -8px;
  left: 12px;
  font-size: 3.5rem;
  line-height: 1;
  color: var(--color-primary);
  opacity: 0.2;
  font-family: Georgia, serif;
}

.post-detail-content blockquote p:last-child {
  margin-bottom: 0;
}

.post-detail-content table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 24px 0;
  font-size: 0.98rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
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
  white-space: nowrap;
}

.post-detail-content tbody tr {
  transition: background 0.2s ease;
}

.post-detail-content tbody tr:nth-child(even) {
  background: color-mix(in srgb, var(--color-surface) 95%, var(--color-primary) 5%);
}

.post-detail-content tbody tr:hover {
  background: var(--color-primary-light);
}

.post-detail-content img {
  max-width: 100%;
  border-radius: var(--radius-sm);
  margin: 24px 0;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: zoom-in;
}

.post-detail-content img:hover {
  transform: scale(1.01);
  box-shadow: var(--shadow-lg);
}

.post-detail-content hr {
  margin: 40px 0;
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary) 20%, var(--color-accent) 50%, var(--color-primary) 80%, transparent);
  opacity: 0.3;
  border-radius: 2px;
}

.post-detail-content strong {
  font-weight: 650;
}

.post-detail-content mark {
  background: linear-gradient(120deg, transparent 0%, color-mix(in srgb, var(--color-primary) 20%, transparent) 40%, color-mix(in srgb, var(--color-primary) 20%, transparent) 60%, transparent 100%);
  color: inherit;
  padding: 0 4px;
  border-radius: 2px;
}

.post-detail-content kbd {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.82em;
  font-family: var(--font-mono);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 1px 0 var(--color-border);
  line-height: 1.4;
}

.post-detail-content details {
  margin: 20px 0;
  padding: 16px 20px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.post-detail-content details:hover {
  border-color: var(--color-primary);
}

.post-detail-content summary {
  font-weight: 600;
  cursor: pointer;
  color: var(--color-primary);
}

.post-detail-content details[open] summary {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}
</style>
