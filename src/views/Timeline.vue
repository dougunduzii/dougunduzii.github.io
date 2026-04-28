<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadAllPosts } from '../utils/posts.js'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const error = ref(false)

const groupedPosts = computed(() => {
  const groups = new Map()
  posts.value.forEach(post => {
    const date = post.date || ''
    const match = date.match(/^(\d{4})-(\d{1,2})/)
    if (!match) return
    const key = `${match[1]}年${parseInt(match[2])}月`
    if (!groups.has(key)) {
      groups.set(key, { label: key, year: match[1], month: parseInt(match[2]), posts: [] })
    }
    groups.get(key).posts.push(post)
  })
  return Array.from(groups.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })
})

const totalCount = computed(() => posts.value.length)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (match) return `${parseInt(match[2])}月${parseInt(match[3])}日`
  return dateStr
}

const getCategoryColor = (post) => {
  const config = post.coverConfig || {}
  return config.accent || '#6366f1'
}

const getCategoryIcon = (post) => {
  const cat = (post.category || '').toLowerCase()
  if (cat === 'javascript') return 'JS'
  if (cat === 'typescript') return 'TS'
  if (cat === 'mysql') return 'SQL'
  if (cat === '算法') return '算'
  if (cat === '碎碎念') return '碎'
  return cat.substring(0, 2).toUpperCase()
}

const openPost = (slug) => {
  router.push(`/post/${slug}`)
}

onMounted(async () => {
  try {
    const loaded = await loadAllPosts()
    posts.value = loaded || []
  } catch (e) {
    console.error('加载文章失败:', e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="timeline-page">
    <div class="container">
      <div class="timeline-hero">
        <div class="timeline-hero-icon">🕐</div>
        <h1>时间线</h1>
        <p class="timeline-subtitle">共 {{ totalCount }} 篇文章</p>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="no-results">
        <p>⚠️ 加载失败，请刷新重试</p>
      </div>

      <div v-else class="timeline-content">
        <div
          v-for="group in groupedPosts"
          :key="group.label"
          class="timeline-group"
        >
          <div class="timeline-group-header">
            <div class="timeline-group-dot"></div>
            <h2 class="timeline-group-label">{{ group.label }}</h2>
            <span class="timeline-group-count">{{ group.posts.length }} 篇</span>
          </div>

          <div class="timeline-items">
            <div
              v-for="post in group.posts"
              :key="post.slug"
              class="timeline-item"
              @click="openPost(post.slug)"
            >
              <span class="timeline-item-date">{{ formatDate(post.date) }}</span>
              <div class="timeline-item-line">
                <div class="timeline-item-dot" :style="{ background: getCategoryColor(post) }"></div>
              </div>
              <div class="timeline-item-card">
                <span class="timeline-item-cat" :style="{ background: getCategoryColor(post) + '18', color: getCategoryColor(post) }">
                  {{ getCategoryIcon(post) }}
                </span>
                <h3 class="timeline-item-title">{{ post.title }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-page {
  padding: 40px 0 60px;
  min-height: calc(100vh - 68px);
}

.timeline-hero {
  text-align: center;
  padding: 48px 0 40px;
}

.timeline-hero-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.timeline-hero h1 {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.timeline-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  padding: 60px 0;
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

.no-results {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.timeline-content {
  max-width: 700px;
  margin: 0 auto;
}

.timeline-group {
  margin-bottom: 40px;
}

.timeline-group-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.timeline-group-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 3px solid var(--color-primary-light);
  flex-shrink: 0;
  box-shadow: 0 0 12px var(--color-primary-glow);
}

.timeline-group-label {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.timeline-group-count {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 50px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.timeline-items {
  margin-left: 9px;
  border-left: 2px solid var(--color-border);
  padding-left: 20px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  margin-bottom: 100px;
  cursor: pointer;
}

.timeline-item-date {
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  font-size: 0.78rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.timeline-item-line {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.timeline-item-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid var(--color-surface);
  box-shadow: 0 0 0 2px var(--color-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.timeline-item:hover .timeline-item-dot {
  transform: scale(1.4);
  box-shadow: 0 0 8px var(--color-primary-glow);
}

.timeline-item-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  transition: all var(--transition);
  min-width: 0;
}

.timeline-item-card:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.timeline-item-cat {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.timeline-item-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition);
}

.timeline-item:hover .timeline-item-title {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .timeline-items {
    padding-left: 16px;
  }

  .timeline-item-date {
    display: none;
  }

  .timeline-item-card {
    padding: 8px 12px;
  }

  .timeline-item-title {
    font-size: 0.88rem;
  }

  .timeline-group-label {
    font-size: 1.1rem;
  }
}
</style>
