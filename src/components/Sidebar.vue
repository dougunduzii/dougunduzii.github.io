<script setup>
import { ref, computed } from 'vue'

const userInfo = {
  nickname: '豆棍杜子',
  avatar: '/boy.png',
  bio: ' ',
}

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioRef = ref(null)
let lastTimeUpdate = 0

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
  const now = performance.now()
  if (now - lastTimeUpdate < 250) return
  lastTimeUpdate = now
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
    </div>

    <div class="sidebar-music">
      <div class="music-card">
        <audio 
          ref="audioRef"
          :src="'/' + encodeURIComponent('周杰伦 - 蒲公英的约定') + '.mp3'"
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
  width: 240px;
  height: calc(100vh - 68px);
  background: rgba(248, 249, 251, 0.85);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--color-border);
  padding: 40px 20px;
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

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
}

[data-theme="dark"] .sidebar {
  background: rgba(12, 14, 20, 0.85);
}

.sidebar-profile {
  text-align: center;
}

.sidebar-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary-light);
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-avatar:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--color-primary-glow), 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.06);
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

@media (max-width: 768px) {
  .sidebar { display: none; }
}

.sidebar-music {
  margin-top: auto;
}

.music-card {
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
  padding: 14px;
  background: var(--color-surface);
  transition: all 0.3s ease;
}

.music-card:hover {
  box-shadow: 0 0 16px var(--color-primary-glow);
  border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
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
