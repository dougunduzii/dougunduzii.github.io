import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './styles/main.css'

import Home from './views/Home.vue'
import Post from './views/Post.vue'
import About from './views/About.vue'
import TodoList from './views/TodoList.vue'
import Timeline from './views/Timeline.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/post/:slug(.*)', component: Post },
  { path: '/about', component: About },
  { path: '/todo', component: TodoList },
  { path: '/timeline', component: Timeline }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')
