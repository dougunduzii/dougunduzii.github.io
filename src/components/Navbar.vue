<script setup>
import { inject, ref } from 'vue'
import { RouterLink } from 'vue-router'

const theme = inject('theme')
const toggleTheme = inject('toggleTheme')
const menuOpen = ref(false)
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
          <li><RouterLink to="/" exact-active-class="active">首页</RouterLink></li>
          <li><RouterLink to="/todo" active-class="active">To Do List</RouterLink></li>
          <li><RouterLink to="/about" active-class="active">关于</RouterLink></li>
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
  transition: border-color var(--transition);
}

.logo:hover .logo-avatar {
  border-color: var(--color-primary);
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
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
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
  transform: rotate(15deg);
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
}

@media (max-width: 480px) {
  .theme-toggle {
    display: none;
  }
}
</style>
