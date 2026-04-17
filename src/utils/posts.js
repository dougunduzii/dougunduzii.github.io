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
      if (listMatch && currentKey && meta[currentKey]) {
        if (!Array.isArray(meta[currentKey])) {
          meta[currentKey] = [meta[currentKey]]
        }
        meta[currentKey].push(listMatch[1].trim())
      }
    }
  })
  
  return { meta, content: markdown }
}

const ensureTagsArray = (meta) => {
  if (typeof meta.tags === 'string') {
    meta.tags = [meta.tags]
  }
  if (!Array.isArray(meta.tags)) {
    meta.tags = []
  }
}

const extractDateFromSlug = (slug) => {
  const match = slug.match(/^(\d{1,2})\.(\d{1,2})/)
  if (match) {
    const month = match[1].padStart(2, '0')
    const day = match[2].padStart(2, '0')
    return `2026-${month}-${day}`
  }
  return ''
}

const extractTitleFromSlug = (slug) => {
  const match = slug.match(/^\d{1,2}\.\d{1,2}\s+(.+)$/)
  if (match) {
    return match[1]
  }
  return slug
}

const cache = ref({})

// 编程语言 Logo 封面配置
const LANG_COVERS = {
  'javascript': {
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    color: '#f7df1e',
    accent: '#323330',
  },
  'html5': {
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #2d1810 50%, #4a2520 100%)',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
    color: '#e34f26',
    accent: '#f06529',
  },
  'css': {
    gradient: 'linear-gradient(135deg, #0a0a2e 0%, #101040 50%, #1a1a60 100%)',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    color: '#1572b6',
    accent: '#33a9dc',
  },
  'vue': {
    gradient: 'linear-gradient(135deg, #0a1a0a 0%, #102010 50%, #1a3018 100%)',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg',
    color: '#4fc08d',
    accent: '#35495e',
  },
}

const FALLBACK_COVER = {
  gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
  color: '#f7df1e',
  accent: '#323330',
}

const getLangFromTags = (tags) => {
  if (!Array.isArray(tags) || tags.length === 0) return 'javascript'
  const lowerTags = tags.map(t => t.toLowerCase())
  if (lowerTags.includes('vue')) return 'vue'
  if (lowerTags.includes('html5') || lowerTags.includes('html')) return 'html5'
  if (lowerTags.includes('css')) return 'css'
  return 'javascript'
}

const generateCoverSVG = (slug, coverConfig) => {
  const title = extractTitleFromSlug(slug)
  const { gradient, icon, color, accent } = coverConfig
  const gradientStr = encodeURIComponent(gradient)
  
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e"/>
          <stop offset="50%" style="stop-color:#16213e"/>
          <stop offset="100%" style="stop-color:#0f3460"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="800" height="400" fill="url(#bg)"/>
      <!-- Decorative circles -->
      <circle cx="120" cy="80" r="60" fill="${color}" opacity="0.08"/>
      <circle cx="680" cy="320" r="80" fill="${color}" opacity="0.06"/>
      <circle cx="700" cy="60" r="40" fill="${accent}" opacity="0.1"/>
      <circle cx="100" cy="340" r="50" fill="${accent}" opacity="0.08"/>
      <!-- JS Logo placeholder -->
      <rect x="320" y="100" width="160" height="160" rx="20" fill="${color}" opacity="0.95"/>
      <text x="400" y="215" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#1a1a2e" text-anchor="middle">JS</text>
      <!-- Title text -->
      <text x="400" y="320" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.7)" text-anchor="middle">${title}</text>
      <!-- Bottom accent line -->
      <rect x="300" y="340" width="200" height="3" rx="1.5" fill="${color}" opacity="0.6"/>
    </svg>`
  )}`
}

const getCoverUrl = (slug, tags) => {
  const lang = getLangFromTags(tags)
  const coverConfig = LANG_COVERS[lang] || FALLBACK_COVER
  return generateCoverSVG(slug, coverConfig)
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
  
  const resp = await fetch(POSTS_DIR + encodeURIComponent(slug) + '.md')
  if (!resp.ok) {
    console.error('Failed to fetch post:', slug, 'URL:', POSTS_DIR + encodeURIComponent(slug) + '.md')
    throw new Error('无法加载文章：' + slug)
  }
  
  const text = await resp.text()
  
  const parsed = parseFrontmatter(text)
  const meta = parsed.meta
  
  ensureTagsArray(meta)
  
  const date = meta.date || extractDateFromSlug(slug)
  
  const post = {
    slug,
    title: meta.title || extractTitleFromSlug(slug),
    date: date,
    tags: meta.tags,
    summary: meta.summary || '',
    cover: meta.cover || getCoverUrl(slug, meta.tags),
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
