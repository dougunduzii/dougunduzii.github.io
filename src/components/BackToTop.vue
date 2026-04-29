<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

const handleScroll = () => {
  visible.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <button 
    class="back-to-top" 
    :class="{ visible }" 
    @click="scrollToTop"
    aria-label="返回顶部"
  >
    ↑
  </button>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(12px);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 90;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  background: var(--color-primary-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-xl), 0 0 20px var(--color-primary-glow);
}

.back-to-top:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 20px;
    right: 20px;
  }
}
</style>
