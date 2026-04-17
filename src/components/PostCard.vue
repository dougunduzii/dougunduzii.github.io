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
</script>

<template>
  <article class="post-card">
    <div class="post-card-cover-wrap">
      <div class="post-card-cover" :style="getCoverStyle(post)">
        <div v-if="!post.cover" class="post-card-cover-content">
          <div class="post-card-cover-code" :style="{ color: getAccentColor(post) }">
            <span class="code-symbol">{{ getCodeSymbol(post) }}</span>
          </div>
          <div class="post-card-cover-decorators">
            <span class="decorator d1" :style="{ color: getAccentColor(post) }">{{ getSymbol1(post) }}</span>
            <span class="decorator d2" :style="{ color: getAccentColor(post) }">( )</span>
            <span class="decorator d3" :style="{ color: getSymbol2(post) }">=</span>
            <span class="decorator d4" :style="{ color: getAccentColor(post) }">;</span>
            <span class="decorator d5" :style="{ color: getSymbol2(post) }">{{ getSymbol1(post) }}</span>
          </div>
        </div>
        <div class="post-card-cover-shine" :style="{ background: `linear-gradient(105deg, transparent 40%, ${getAccentColor(post)}10 50%, transparent 60%)` }"></div>
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
}

.post-card-cover-code {
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-shadow: 0 0 30px currentColor;
  margin-bottom: 12px;
}

.post-card-cover-decorators {
  display: flex;
  gap: 18px;
  justify-content: center;
  align-items: center;
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 1.1rem;
}

.decorator {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.post-card:hover .decorator {
  opacity: 0.8;
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
  
  .post-card-cover-code {
    font-size: 2.8rem;
  }

  .post-card-cover-decorators {
    font-size: 0.9rem;
    gap: 12px;
  }

  .post-card-body {
    padding: 18px;
  }
}
</style>
