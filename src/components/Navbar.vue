<script setup>
import { inject, ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { getCategories } from '../utils/posts.js'

const theme = inject('theme')
const toggleTheme = inject('toggleTheme')
const menuOpen = ref(false)
const learnOpen = ref(false)
const categories = ref([])
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    categories.value = await getCategories()
    categories.value = categories.value.filter(cat => cat.name !== '碎碎念')
  } catch {
    categories.value = []
  }
})

const activeTag = computed(() => {
  const tag = route.query.tag || ''
  return tag === '碎碎念' ? '' : tag
})

const isSuiActive = computed(() => {
  return route.query.tag === '碎碎念'
})

const learnLabel = computed(() => {
  return activeTag.value ? `${activeTag.value} ▾` : '学点什么 ▾'
})

const filterByCategory = (categoryName) => {
  learnOpen.value = false
  router.push({ path: '/', query: { tag: categoryName } })
}
</script>

<template>
  <nav class="navbar">
    <div class="container nav-content">
      <RouterLink to="/" class="logo">
        <img class="logo-avatar" src="/boy.png" alt="头像">
        <span>豆棍杜子</span>
      </RouterLink>
      
      <div class="nav-right">
        <ul class="nav-links" :class="{ open: menuOpen }">
          <li><RouterLink to="/" :class="{ active: route.path === '/' && !activeTag && !isSuiActive }">首页</RouterLink></li>
          <li class="nav-dropdown" @mouseenter="learnOpen = true" @mouseleave="learnOpen = false">
            <span class="nav-dropdown-trigger" :class="{ active: activeTag }">{{ learnLabel }}</span>
            <ul class="nav-dropdown-menu" :class="{ open: learnOpen }">
              <li v-for="cat in categories" :key="cat.name" @click="filterByCategory(cat.name)">
                <span class="dropdown-icon" :style="{ backgroundColor: cat.color, color: '#323330' }">{{ cat.icon }}</span>
                <span class="dropdown-name">{{ cat.name }}</span>
                <span class="dropdown-count">{{ cat.count }}</span>
              </li>
            </ul>
          </li>
             <li><RouterLink to="/resources" active-class="active">资源站</RouterLink></li>
          <li><RouterLink to="/?tag=碎碎念" :class="{ active: isSuiActive }">碎碎念</RouterLink></li>
          <li><RouterLink to="/timeline" active-class="active">时间线</RouterLink></li>
          <li><RouterLink to="/todo" active-class="active">To Do List</RouterLink></li>
          <li><RouterLink to="/about" active-class="active">关于</RouterLink></li>
          <li><RouterLink to="/donate" active-class="active">打赏</RouterLink></li>
        </ul>
        
        <button class="theme-toggle" @click="toggleTheme" :aria-label="theme === 'dark' ? '切换亮色模式' : '切换暗色模式'">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
        
        <button class="nav-toggle" @click="menuOpen = !menuOpen" aria-label="菜单">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(248, 249, 251, 0.8);
  backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition), border-color var(--transition);
}

[data-theme="dark"] .navbar {
  background: rgba(12, 14, 20, 0.8);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.logo {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.03em;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: color var(--transition);
}

.logo-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo:hover .logo-avatar {
  border-color: var(--color-primary);
  box-shadow: 0 0 16px var(--color-primary-glow);
  transform: scale(1.08);
}

.logo:hover {
  color: var(--color-primary);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 4px;
}

.nav-links a {
  display: block;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition);
  position: relative;
}

.nav-links a:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.nav-links a.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.nav-links a.active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  border-radius: 1px;
  background: var(--color-primary);
}

.nav-dropdown {
  position: relative;
}

.nav-dropdown-trigger {
  display: block;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  user-select: none;
  min-width: 7.5rem;
  text-align: center;
  white-space: nowrap;
}

.nav-dropdown:hover .nav-dropdown-trigger,
.nav-dropdown-trigger.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 190px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 6px 0;
  list-style: none;
  z-index: 110;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.nav-dropdown:hover .nav-dropdown-menu,
.nav-dropdown-menu.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: auto;
}

.nav-dropdown-menu li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-dropdown-menu li:hover {
  background: var(--color-primary-light);
}

.dropdown-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-dropdown-menu li:hover .dropdown-icon {
  transform: scale(1.1);
}

.dropdown-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
  transition: color 0.2s ease;
}

.nav-dropdown-menu li:hover .dropdown-name {
  color: var(--color-primary);
}

.dropdown-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  background: var(--color-tag-bg);
  padding: 2px 8px;
  border-radius: 50px;
  min-width: 24px;
  text-align: center;
  transition: all 0.2s ease;
}

.nav-dropdown-menu li:hover .dropdown-count {
  background: var(--color-primary);
  color: white;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  transition: all var(--transition);
  color: var(--color-text-secondary);
}

.theme-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
  transform: rotate(15deg) scale(1.05);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.nav-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: all var(--transition);
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    flex-direction: column;
    padding: 12px 24px;
    gap: 4px;
    box-shadow: var(--shadow-lg);
  }

  .nav-links.open {
    display: flex;
  }

  .nav-dropdown-menu {
    display: none;
  }

  .nav-dropdown-menu.open {
    display: block;
    opacity: 1;
    visibility: visible;
    transform: none;
    pointer-events: auto;
    position: static;
    box-shadow: none;
    border: none;
    padding-left: 16px;
  }
}

@media (max-width: 480px) {
  .theme-toggle {
    display: none;
  }
}
</style>
