import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
})

export function useMarkdownPage(url, imageBasePath = null) {
  const content = ref('')
  const loading = ref(true)
  const error = ref(null)

  onMounted(async () => {
    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`无法加载：${url}`)
      let text = await resp.text()

      if (imageBasePath) {
        text = text.replace(
          /!\[(.*?)\]\(\.\.?(\/[^)]+)\)/g,
          `![$1](${imageBasePath}$2)`
        )
        text = text.replace(
          /<img([^>]*?)src=["']\.\.?(\/[^"']+)["']([^>]*)>/g,
          `<img$1src="${imageBasePath}$2"$3>`
        )
      }

      content.value = marked.parse(text)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  })

  return { content, loading, error }
}
