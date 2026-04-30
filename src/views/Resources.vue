<script setup>
import { useMarkdownPage } from '../composables/useMarkdownPage.js'

const { content, loading, error } = useMarkdownPage('/posts/资源站.md', '/posts')
</script>

<template>
  <div class="resources-page">
    <div class="container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="error" class="error">
        <p>加载失败: {{ error }}</p>
      </div>
      <div v-else class="resources-content markdown-body" v-html="content"></div>
    </div>
  </div>
</template>

<style scoped>
.resources-page {
  padding: 40px 0;
  min-height: calc(100vh - 68px);
}

.resources-content {
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 40px;
  border: 1px solid var(--color-border);
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

.error {
  text-align: center;
  padding: 60px 0;
  color: #e74c3c;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
}

.markdown-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 32px 0 16px;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
}

.markdown-body :deep(ul) {
  margin: 16px 0;
  padding-left: 24px;
}

.markdown-body :deep(li) {
  margin: 8px 0;
  color: var(--color-text-secondary);
}

.markdown-body :deep(p) {
  margin: 16px 0;
  line-height: 1.8;
  color: var(--color-text);
}

.markdown-body :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .resources-content {
    padding: 24px;
  }
}
</style>
