<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories } from '../utils/posts.js'

const router = useRouter()

const userInfo = {
  nickname: '豆根杜子',
  avatar: '/boy.png',
  bio: '我是小菜狗  大佬带带我',
  postCount: 20,
}

const categories = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    console.log('开始加载分类...')
    const result = await getCategories()
    console.log('分类加载成功:', result)
    categories.value = result
    if (result.length === 0) {
      error.value = '暂无分类数据'
    }
  } catch (err) {
    console.error('加载分类失败:', err)
    error.value = err.message || '加载失败'
    // 兜底数据 - 包含所有三个分类
    categories.value = [
      { name: 'JavaScript', count: 15, icon: 'JS', color: '#f7df1e' },
      { name: 'MySQL', count: 3, icon: 'SQL', color: '#00758f' },
      { name: '算法', count: 2, icon: '算', color: '#e74c3c' },
    ]
  } finally {
    loading.value = false
  }
})

const filterByCategory = (categoryName) => {
  router.push({ path: '/', query: { tag: categoryName } })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-profile">
      <img class="sidebar-avatar" :src="userInfo.avatar" :alt="userInfo.nickname" />
      <h3 class="sidebar-name">{{ userInfo.nickname }}</h3>
      <p class="sidebar-bio">{{ userInfo.bio }}</p>
      <div class="sidebar-stats">
        <span class="stat-item">
          <span class="stat-count">{{ userInfo.postCount }}</span>
          <span class="stat-label">文章</span>
        </span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <h4 class="sidebar-section-title">分类</h4>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <ul v-else-if="categories.length > 0" class="sidebar-category-list">
        <li 
          v-for="cat in categories" 
          :key="cat.name"
          class="sidebar-category-item"
          @click="filterByCategory(cat.name)"
        >
          <span 
            class="category-icon" 
            :style="{ backgroundColor: cat.color, color: '#323330' }"
          >
            {{ cat.icon }}
          </span>
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ cat.count }}</span>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: calc(100vh - 68px);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--color-border);
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: fixed;
  left: 0;
  top: 68px;
  z-index: 90;
  overflow-y: auto;
}

.sidebar-profile {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary-light);
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-name {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-text);
}

.sidebar-bio {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.sidebar-stats {
  display: flex;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-count {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

.sidebar-nav {
  flex: 1;
}

.sidebar-section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}

.loading {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  padding: 20px 0;
}

.error {
  text-align: center;
  color: #e74c3c;
  font-size: 0.85rem;
  padding: 20px 0;
}

.sidebar-category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
}

.sidebar-category-item:hover {
  background: var(--color-primary-light);
}

.category-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.category-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
}

.category-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  background: var(--color-tag-bg);
  padding: 2px 8px;
  border-radius: 50px;
  min-width: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .sidebar { display: none; }
}
</style>
