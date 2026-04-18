import { ref } from 'vue'

const POSTS_DIR = '/blog/posts/'

const parseFrontmatter = (text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { meta: {}, content: text }
  }
  
  const yaml = match[1]
  const markdown = match[2]
  const meta = {}
  let currentKey = null
  
  yaml.split('\n').forEach(line => {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/)
    if (m) {
      currentKey = m[1]
      const val = m[2].trim()
      meta[currentKey] = val === '' ? [] : val
    } else {
      const listMatch = line.match(/^\s*-\s+(.*)$/)
      if (listMatch && currentKey && currentKey in meta) {
        if (!Array.isArray(meta[currentKey])) {
          meta[currentKey] = [meta[currentKey]]
        }
        meta[currentKey].push(listMatch[1].trim())
      }
    }
  })
  
  return { meta, content: markdown }
}

// 从 slug 路径中提取分类（文件夹名）
const extractCategoryFromSlug = (slug) => {
  const parts = slug.split('/')
  if (parts.length > 1) {
    return parts[0] // 文件夹名作为分类
  }
  return '未分类'
}

const extractDateFromSlug = (slug) => {
  // 从文件名部分提取日期（去掉文件夹前缀）
  const filename = slug.split('/').pop()
  const match = filename.match(/^(\d{1,2})\.(\d{1,2})/)
  if (match) {
    const month = match[1].padStart(2, '0')
    const day = match[2].padStart(2, '0')
    return `2026-${month}-${day}`
  }
  return ''
}

const extractTitleFromSlug = (slug) => {
  const filename = slug.split('/').pop()
  const match = filename.match(/^\d{1,2}\.\d{1,2}\s+(.+)$/)
  if (match) {
    return match[1]
  }
  return filename
}

const cache = ref({})

// 编程语言封面配置 - 使用代码主题色 + 装饰元素
const LANG_COVERS = {
  javascript: {
    bg: '#1e1e2e',
    accent: '#f7df1e',
    accent2: '#ffbd2a',
    code: '{ }',
    symbol: '//',
  },
  vue: {
    bg: '#0f172a',
    accent: '#42b883',
    accent2: '#35495e',
    code: '< >',
    symbol: '=>',
  },
  html5: {
    bg: '#1a0a05',
    accent: '#e44d26',
    accent2: '#f16529',
    code: '</>',
    symbol: '#',
  },
  css: {
    bg: '#0a1030',
    accent: '#264de4',
    accent2: '#2965f1',
    code: '{ }',
    symbol: '.',
  },
  mysql: {
    bg: '#0a1f2e',
    accent: '#00758f',
    accent2: '#f29111',
    code: 'SQL',
    symbol: '>>',
  },
  algorithm: {
    bg: '#1a0a0a',
    accent: '#e74c3c',
    accent2: '#c0392b',
    code: 'O(n)',
    symbol: 'Ω',
  },
}

const FALLBACK_COVER = LANG_COVERS.javascript

const getLangFromTags = (tags) => {
  if (!Array.isArray(tags) || tags.length === 0) return 'javascript'
  const lowerTags = tags.map(t => t.toLowerCase())
  if (lowerTags.includes('vue')) return 'vue'
  if (lowerTags.includes('html5') || lowerTags.includes('html')) return 'html5'
  if (lowerTags.includes('css')) return 'css'
  if (lowerTags.includes('mysql')) return 'mysql'
  if (lowerTags.includes('算法') || lowerTags.includes('algorithm')) return 'algorithm'
  return 'javascript'
}

const getCoverConfig = (tags) => {
  const lang = getLangFromTags(tags)
  return LANG_COVERS[lang] || FALLBACK_COVER
}

// 分类图标和颜色配置
const CATEGORY_CONFIG = {
  'JavaScript': { icon: 'JS', color: '#f7df1e' },
  'MySQL': { icon: 'SQL', color: '#00758f' },
  '算法': { icon: '算', color: '#e74c3c' },
}

const getCategoryConfig = (name) => {
  if (CATEGORY_CONFIG[name]) {
    return CATEGORY_CONFIG[name]
  }
  // 为未知分类生成默认配置
  return {
    icon: name.substring(0, 2).toUpperCase(),
    color: '#42b883'
  }
}

export const loadManifest = async () => {
  if (cache.value.manifest) return cache.value.manifest
  
  const resp = await fetch(POSTS_DIR + 'manifest.json')
  if (!resp.ok) {
    console.error('Failed to fetch manifest:', resp.status, resp.statusText)
    throw new Error('无法加载 manifest.json')
  }
  
  const data = await resp.json()
  cache.value.manifest = data
  return data
}

export const loadPost = async (slug) => {
  if (cache.value[slug]) return cache.value[slug]
  
  // 对路径中的每一部分分别编码，保留斜杠
  const encodedSlug = slug.split('/').map(part => encodeURIComponent(part)).join('/')
  const url = POSTS_DIR + encodedSlug + '.md'
  
  const resp = await fetch(url)
  if (!resp.ok) {
    console.error('Failed to fetch post:', slug, 'URL:', url)
    throw new Error('无法加载文章：' + slug)
  }
  
  const text = await resp.text()
  
  const parsed = parseFrontmatter(text)
  const meta = parsed.meta
  
  const date = meta.date || extractDateFromSlug(slug)
  // 从文件夹路径获取分类作为 tag
  const category = extractCategoryFromSlug(slug)
  
  const post = {
    slug,
    title: meta.title || extractTitleFromSlug(slug),
    date: date,
    tags: [category], // 使用文件夹名作为唯一 tag
    category: category,
    summary: meta.summary || '',
    cover: meta.cover || null,
    coverConfig: getCoverConfig([category]),
    markdown: parsed.content
  }
  
  cache.value[slug] = post
  return post
}

export const loadAllPosts = async () => {
  const manifest = await loadManifest()
  const posts = await Promise.all(
    manifest.posts.map(slug => loadPost(slug))
  )
  
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  return posts
}

// 获取所有分类（基于文件夹）
export const getCategories = async () => {
  const manifest = await loadManifest()
  const categories = new Map()
  
  manifest.posts.forEach(slug => {
    const category = extractCategoryFromSlug(slug)
    if (categories.has(category)) {
      categories.set(category, categories.get(category) + 1)
    } else {
      categories.set(category, 1)
    }
  })
  
  return Array.from(categories.entries()).map(([name, count]) => {
    const config = getCategoryConfig(name)
    return {
      name,
      count,
      icon: config.icon,
      color: config.color
    }
  })
}
