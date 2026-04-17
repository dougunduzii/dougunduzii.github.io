<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  // 尝试解析 YYYY-MM-DD 格式
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (match) {
    const year = match[1]
    const month = parseInt(match[2])
    const day = parseInt(match[3])
    return `${year}.${month}.${day}`
  }
  // 如果不是预期格式，尝试用 Date 解析
  const d = new Date(dateStr)
  const isValid = !isNaN(d.getTime())
  if (!isValid) return ''
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${year}.${month}.${day}`
}
</script>

<template>
  <article class="post-card">
    <div class="post-card-cover-wrap">
      <img 
        class="post-card-cover" 
        :src="post.cover" 
        :alt="post.title"
        loading="lazy"
      >
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
  object-fit: cover;
  background: var(--color-tag-bg);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-card:hover .post-card-cover {
  transform: scale(1.05);
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
  
  .post-card-body {
    padding: 18px;
  }
}
</style>
