<script setup>
import { ref, onMounted, computed } from 'vue'
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

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioRef = ref(null)

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const onTimeUpdate = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
}

const onLoadedMetadata = () => {
  if (!audioRef.value) return
  duration.value = audioRef.value.duration
}

const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const seekTo = (e) => {
  if (!audioRef.value || !duration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  audioRef.value.currentTime = ratio * duration.value
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const progress = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})
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

    <div class="sidebar-music">
      <div class="music-card">
        <audio 
          ref="audioRef"
          :src="'/' + encodeURIComponent('周杰伦 - 蒲公英的约定') + '.flac'"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onEnded"
          preload="metadata"
        ></audio>
        <div class="music-info">
          <div class="music-cover" :class="{ playing: isPlaying }">
            <img src="https://y.gtimg.cn/music/photo_new/T002R300x300M000002eFUFm2XYZ7z.jpg" alt="蒲公英的约定" />
          </div>
          <div class="music-meta">
            <span class="music-title">蒲公英的约定</span>
            <span class="music-artist">周杰伦</span>
          </div>
          <button class="music-btn" @click="togglePlay">
            <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
        </div>
        <div class="music-progress" @click="seekTo">
          <div class="music-progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="music-time">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: calc(100vh - 68px);
  background: rgba(248, 249, 251, 0.85);
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
  transition: background var(--transition), border-color var(--transition);
}

[data-theme="dark"] .sidebar {
  background: rgba(12, 14, 20, 0.85);
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

.sidebar-music {
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.music-card {
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
  padding: 14px;
  background: var(--color-surface);
}

.music-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.music-cover {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.music-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-cover.playing img {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.music-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.music-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-artist {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.music-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.music-btn:hover {
  transform: scale(1.1);
  background: var(--color-primary-dark);
}

.music-progress {
  width: 100%;
  height: 4px;
  background: var(--color-tag-bg);
  border-radius: 2px;
  margin-top: 12px;
  cursor: pointer;
  position: relative;
}

.music-progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.music-time {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
}
</style>
