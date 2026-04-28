<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (match) {
    const year = match[1]
    const month = parseInt(match[2])
    const day = parseInt(match[3])
    return `${year}.${month}.${day}`
  }
  const d = new Date(dateStr)
  const isValid = !isNaN(d.getTime())
  if (!isValid) return ''
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${year}.${month}.${day}`
}

const getCoverStyle = (post) => {
  const config = post.coverConfig || {}
  if (config.image) {
    return {
      backgroundImage: `url(${config.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return {
    background: `linear-gradient(135deg, ${config.bg || '#1e1e2e'} 0%, ${darkenColor(config.bg || '#1e1e2e', 20)} 100%)`,
  }
}

const getAccentColor = (post) => {
  const config = post.coverConfig || {}
  return config.accent || '#f7df1e'
}

const getLogoUrl = (post) => {
  const config = post.coverConfig || {}
  if (config.image) return null
  return config.logo || 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
}

const hasImageCover = (post) => {
  const config = post.coverConfig || {}
  return !!config.image
}

// 辅助函数：加深颜色
const darkenColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max((num >> 16) - amt, 0)
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0)
  const B = Math.max((num & 0x0000FF) - amt, 0)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}
</script>

<template>
  <article class="post-card">
    <div class="post-card-cover-wrap">
      <div class="post-card-cover" :style="getCoverStyle(post)">
        <div class="post-card-cover-content">
          <img 
            v-if="!hasImageCover(post)"
            class="post-card-logo" 
            :src="getLogoUrl(post)" 
            :alt="post.category"
            :style="{ filter: `drop-shadow(0 0 20px ${getAccentColor(post)}40)` }"
          />
        </div>
        <div class="post-card-cover-shine" :style="{ background: `linear-gradient(105deg, transparent 40%, ${getAccentColor(post)}15 50%, transparent 60%)` }"></div>
      </div>
      <div class="post-card-cover-overlay"></div>
    </div>
    <div class="post-card-body">
      <div class="post-card-date">{{ formatDate(post.date) }}</div>
      <h2 class="post-card-title">{{ post.title }}</h2>
      <p class="post-card-summary">{{ post.summary }}</p>
      <div class="post-card-tags">
        <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}

.post-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

.post-card:hover {
  transform: translateY(-6px);
  border-color: transparent;
}

.post-card:hover::after {
  opacity: 1;
}

.post-card-cover-wrap {
  position: relative;
  overflow: hidden;
}

.post-card-cover {
  width: 100%;
  height: 210px;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.post-card-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 70%);
}

.post-card:hover .post-card-cover {
  transform: scale(1.05);
}

.post-card-cover-content {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-card-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-card:hover .post-card-logo {
  transform: scale(1.1) rotate(5deg);
}

.post-card-cover-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.6;
}

.post-card-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%);
  opacity: 0;
  transition: opacity var(--transition);
}

.post-card:hover .post-card-cover-overlay {
  opacity: 1;
}

.post-card-body {
  padding: 22px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-card-date {
  font-size: 0.78rem;
  color: var(--color-text-tertiary);
  margin-bottom: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.post-card-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.4;
  color: var(--color-text);
  letter-spacing: -0.01em;
  transition: color var(--transition);
}

.post-card:hover .post-card-title {
  color: var(--color-primary);
}

.post-card-summary {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.65;
  flex: 1;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.post-card-tags span {
  font-size: 0.72rem;
  padding: 3px 10px;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  border-radius: 50px;
  font-weight: 500;
  transition: all var(--transition);
}

.post-card:hover .post-card-tags span {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .post-card-cover {
    height: 180px;
  }
  
  .post-card-logo {
    width: 64px;
    height: 64px;
  }

  .post-card-body {
    padding: 18px;
  }
}
</style>
