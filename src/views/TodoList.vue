<script setup>
const plans = [
  { name: 'TypeScript', time: '2026.5', status: 'upcoming', icon: '🔷', done: false },
  { name: 'FastAPI', time: '2026.6', status: 'upcoming', icon: '⚡', done: false },
  { name: 'LangChain', time: 'unknown', status: 'pending', icon: '🔗', done: false }
]
</script>

<template>
  <div class="todo-page">
    <div class="container">
      <div class="todo-hero">
        <div class="todo-hero-icon">📋</div>
        <h1>To Do List</h1>
        <p class="todo-subtitle">To Do List</p>
      </div>

      <div class="todo-list">
        <div
          v-for="(plan, index) in plans"
          :key="index"
          class="todo-card"
          :class="plan.status"
        >
          <div class="todo-timeline">
            <div class="todo-dot"></div>
            <div v-if="index < plans.length - 1" class="todo-line"></div>
          </div>
          <div class="todo-card-inner">
            <div class="todo-card-header">
              <span class="todo-icon">{{ plan.icon }}</span>
              <span class="todo-name">{{ plan.name }}</span>
              <span class="todo-checkbox" :class="{ checked: plan.done }">
                <svg v-if="plan.done" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </span>
            </div>
            <div class="todo-card-footer">
              <span class="todo-time-badge" :class="{ unknown: plan.time === 'unknown' }">
                {{ plan.time === 'unknown' ? '待定' : plan.time }}
              </span>
              <span class="todo-status">{{ plan.time === 'unknown' ? '规划中' : '计划中' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-page {
  padding: 40px 0 60px;
  min-height: calc(100vh - 68px);
}

.todo-hero {
  text-align: center;
  padding: 48px 0 40px;
}

.todo-hero-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.todo-hero h1 {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.todo-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.todo-list {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.todo-card {
  display: flex;
  gap: 20px;
  min-height: 100px;
}

.todo-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}

.todo-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 3px solid var(--color-primary-light);
  flex-shrink: 0;
  box-shadow: 0 0 8px var(--color-primary-glow);
}

.todo-card.pending .todo-dot {
  background: var(--color-text-tertiary);
  border-color: var(--color-tag-bg);
  box-shadow: none;
}

.todo-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, var(--color-primary), var(--color-border));
  margin: 4px 0;
}

.todo-card.pending .todo-line {
  background: linear-gradient(to bottom, var(--color-text-tertiary), var(--color-border));
}

.todo-card-inner {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 20px 24px;
  margin-bottom: 16px;
  transition: all var(--transition);
}

.todo-card-inner:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.todo-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.todo-icon {
  font-size: 1.5rem;
}

.todo-name {
  flex: 1;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.todo-checkbox {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 2px solid var(--color-border);
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

.todo-checkbox svg {
  width: 16px;
  height: 16px;
}

.todo-checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  opacity: 1;
}

.todo-card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-time-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.todo-time-badge.unknown {
  background: var(--color-tag-bg);
  color: var(--color-text-tertiary);
}

.todo-status {
  font-size: 0.82rem;
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .todo-card-inner {
    padding: 16px 18px;
  }

  .todo-name {
    font-size: 1.05rem;
  }
}
</style>
