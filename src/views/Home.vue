<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import { loadAllPosts } from '../utils/posts.js'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const searchQuery = ref('')
const currentTag = ref('all')

const allTags = computed(() => {
  const tags = new Set()
  posts.value.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

const filteredPosts = computed(() => {
  return posts.value.filter(post => {
    const matchTag = currentTag.value === 'all' || post.tags.includes(currentTag.value)
    const query = searchQuery.value.toLowerCase()
    const matchSearch = !query || 
      post.title.toLowerCase().includes(query) ||
      post.summary.toLowerCase().includes(query) ||
      post.tags.some(t => t.toLowerCase().includes(query))
    return matchTag && matchSearch
  })
})

const selectTag = (tag) => {
  currentTag.value = tag
}

const openPost = (slug) => {
  router.push(`/post/${slug}`)
}

onMounted(async () => {
  try {
    posts.value = await loadAllPosts()
  } catch (err) {
    console.error('加载文章失败:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <section class="hero">
      <div class="container">
        <h1>记录技术与生活</h1>
        <p>在这里分享我的编程心得、技术探索和生活感悟</p>
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
