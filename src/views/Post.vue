<script setup>
import { ref, onMounted, inject, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { loadPost } from '../utils/posts.js'

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

const loadPostData = async (slug) => {
  loading.value = true
  notFound.value = false
  
  try {
    post.value = await loadPost(slug)
    document.title = `${post.value.title} - 我的博客`
  } catch (err) {
    notFound.value = true
    document.title = '文章未找到 - 我的博客'
  } finally {
    loading.value = false
  }
}

const renderMarkdown = (markdown) => {
  // 处理emoji
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
  
  // 处理图片路径
  processedMarkdown = processedMarkdown.replace(/!\[(.*?)\]\(\.\/(picture\/.*?)\)/g, '![$1](/posts/$2)')
  
  // 处理表格格式 - 修复不正确的分隔线
  processedMarkdown = processedMarkdown.replace(/\|\s*\.\.\s*\|\s*\.\.\s*\|/g, '| --- | --- |')
  
  // 使用marked 12.0.0的正确API方式
  return marked.parse(processedMarkdown, {
    breaks: true,
    gfm: true, // 启用GitHub Flavored Markdown
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
            <img 
              class="post-detail-cover" 
              :src="post.cover" 
              :alt="post.title"
            >
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

          <div 
            class="post-detail-content" 
            v-html="renderMarkdown(post.markdown)"
          ></div>

          <footer class="post-detail-footer">
            <RouterLink to="/" class="back-link">← 返回首页</RouterLink>
          </footer>
        </template>
      </div>
    </article>
  </div>
</template>
