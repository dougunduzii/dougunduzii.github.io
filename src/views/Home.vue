<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import { loadAllPosts } from '../utils/posts.js'

const router = useRouter()
const route = useRoute()

const posts = ref([])
const loading = ref(true)
const searchQuery = ref('')
const loadError = ref(false)

// 兜底文章数据（当加载失败时显示）- 与 manifest.json 保持一致，使用文件夹路径
const FALLBACK_POSTS = [
  // JavaScript 文章
  { slug: 'JavaScript/3.12 日期对象', title: '日期对象', date: '2026-03-12', tags: ['JavaScript'], summary: 'JavaScript 日期对象的使用方法，包括获取日期、时间戳计算等常用操作。' },
  { slug: 'JavaScript/3.2 操作表单元素', title: '操作表单元素', date: '2026-03-02', tags: ['JavaScript'], summary: 'JavaScript操作表单元素的方法，包括获取值、设置值和表单验证。' },
  { slug: 'JavaScript/3.2 通过classList配合CSS修改元素样式', title: '通过classList配合CSS修改元素样式', date: '2026-03-02', tags: ['JavaScript'], summary: '使用classList API动态修改元素类名，配合CSS实现样式切换。' },
  { slug: 'JavaScript/3.3 h5自定义属性', title: 'h5自定义属性', date: '2026-03-03', tags: ['JavaScript'], summary: 'HTML5自定义属性data-*的使用方法，通过dataset属性访问自定义属性。' },
  { slug: 'JavaScript/3.3 事件监听', title: '事件监听', date: '2026-03-03', tags: ['JavaScript'], summary: 'JavaScript事件监听的各种方式，包括addEventListener和事件委托。' },
  { slug: 'JavaScript/3.3 定时器-间歇函数', title: '定时器-间歇函数', date: '2026-03-03', tags: ['JavaScript'], summary: 'JavaScript间歇函数setInterval的使用方法和注意事项。' },
  { slug: 'JavaScript/3.31 查找DOM节点', title: '查找DOM节点', date: '2026-03-31', tags: ['JavaScript'], summary: 'JavaScript中查找DOM节点的各种方法，包括getElementById、querySelector等。' },
  { slug: 'JavaScript/3.4 事件对象', title: '事件对象', date: '2026-03-04', tags: ['JavaScript'], summary: 'JavaScript事件对象的属性和方法，包括事件冒泡、阻止默认行为等。' },
  { slug: 'JavaScript/4.15 本地存储 localstorage', title: '本地存储 localStorage', date: '2026-04-15', tags: ['JavaScript'], summary: 'JavaScript本地存储localStorage的使用方法，包括存储、读取和删除数据。' },
  { slug: 'JavaScript/4.7 克隆和删除节点', title: '克隆和删除节点', date: '2026-04-07', tags: ['JavaScript'], summary: 'JavaScript中克隆节点和删除节点的方法。' },
  { slug: 'JavaScript/4.7 新增节点', title: '新增节点', date: '2026-04-07', tags: ['JavaScript'], summary: 'JavaScript中创建和添加新节点的方法。' },
  { slug: 'JavaScript/4.8 location对象', title: 'Location对象', date: '2026-04-08', tags: ['JavaScript'], summary: 'JavaScript Location对象的使用方法，包括获取URL信息和页面跳转功能。' },
  { slug: 'JavaScript/4.8 事件循环', title: '事件循环', date: '2026-04-08', tags: ['JavaScript'], summary: 'JavaScript事件循环机制详解，包括宏任务和微任务的执行顺序。' },
  { slug: 'JavaScript/4.8 定时器-延迟函数', title: '定时器-延迟函数', date: '2026-04-08', tags: ['JavaScript'], summary: 'JavaScript延迟函数setTimeout的使用方法和注意事项。' },
  { slug: 'JavaScript/4.8 移动端事件', title: '移动端事件', date: '2026-04-08', tags: ['JavaScript'], summary: 'JavaScript移动端触摸事件的处理方法。' },
  // MySQL 文章
  { slug: 'MySQL/3.15 初识MySQL', title: '初识MySQL', date: '2026-03-15', tags: ['MySQL'], summary: 'MySQL数据库简介，包括安装、连接和基本操作。' },
  { slug: 'MySQL/3.16 数据类型', title: '数据类型', date: '2026-03-16', tags: ['MySQL'], summary: 'MySQL支持的数据类型详解，包括数值、字符串、日期时间等类型。' },
  { slug: 'MySQL/3.17 DDL操作', title: 'DDL操作', date: '2026-03-17', tags: ['MySQL'], summary: 'MySQL数据定义语言，包括创建、修改、删除数据库和表的操作。' },
  // 算法 文章
  { slug: '算法/4.11 快速幂', title: '快速幂', date: '2026-04-11', tags: ['算法'], summary: '快速幂算法详解，包括二进制分解思想和代码实现。' },
  { slug: '算法/4.13 带权并查集', title: '带权并查集', date: '2026-04-13', tags: ['算法'], summary: '带权并查集数据结构，用于解决动态连通性问题。' },
]

const currentTag = computed(() => {
  return route.query.tag || 'all'
})

const allTags = computed(() => {
  const tags = new Set()
  posts.value.forEach(post => {
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags)
})

const filteredPosts = computed(() => {
  return posts.value.filter(post => {
    const matchTag = currentTag.value === 'all' || (post.tags && post.tags.includes(currentTag.value))
    const query = searchQuery.value.toLowerCase()
    const matchSearch = !query || 
      (post.title && post.title.toLowerCase().includes(query)) ||
      (post.summary && post.summary.toLowerCase().includes(query)) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(query)))
    return matchTag && matchSearch
  })
})

const selectTag = (tag) => {
  if (tag === 'all') {
    router.push({ path: '/' })
  } else {
    router.push({ path: '/', query: { tag } })
  }
}

const openPost = (slug) => {
  router.push(`/post/${slug}`)
}

onMounted(async () => {
  try {
    const loadedPosts = await Promise.race([
      loadAllPosts(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ])
    // 如果加载成功但返回空数组，也使用兜底数据
    if (!loadedPosts || loadedPosts.length === 0) {
      console.warn('加载的文章列表为空，使用兜底数据')
      loadError.value = true
      posts.value = FALLBACK_POSTS
    } else {
      posts.value = loadedPosts
    }
  } catch (err) {
    console.error('加载文章失败:', err)
    loadError.value = true
    // 使用兜底数据
    posts.value = FALLBACK_POSTS
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <section class="hero">
      <div class="container">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索文章..."
            autocomplete="off"
          >
        </div>
      </div>
    </section>

    <main class="container">
      <section class="tags-section">
        <button 
          class="tag-btn" 
          :class="{ active: currentTag === 'all' }"
          @click="selectTag('all')"
        >
          全部
        </button>
        <button 
          v-for="tag in allTags" 
          :key="tag"
          class="tag-btn"
          :class="{ active: currentTag === tag }"
          @click="selectTag(tag)"
        >
          {{ tag }}
        </button>
      </section>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredPosts.length === 0" class="no-results">
        <p>🔍 没有找到匹配的文章</p>
        <p v-if="loadError" class="error-hint">（正在使用离线数据）</p>
      </div>

      <section v-else class="posts-grid">
        <PostCard 
          v-for="post in filteredPosts" 
          :key="post.slug"
          :post="post"
          @click="openPost(post.slug)"
        />
      </section>
    </main>
  </div>
</template>

<style scoped>
.hero {
  padding: 60px 0 40px;
  text-align: center;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.search-box {
  position: relative;
  max-width: 480px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  opacity: 0.6;
}

.search-box input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 1rem;
  background: var(--color-surface);
  color: var(--color-text);
  transition: all var(--transition);
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 32px;
  padding: 4px;
}

.tag-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 50px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.tag-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
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
}

.no-results p:first-child {
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.error-hint {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 1.8rem;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
