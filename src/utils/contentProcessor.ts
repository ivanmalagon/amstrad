import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { BlogPost } from '../types/blog'

// Configure marked to handle external links
marked.setOptions({
  renderer: new marked.Renderer(),
  hooks: {
    postprocess(html: string) {
      // Add target="_blank" and rel="noopener noreferrer" to external links
      return html.replace(
        /<a href="(https?:\/\/[^"]+)"/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer"'
      )
    },
    options: {},
    preprocess: (markdown: string) => markdown,
    processAllTokens: (tokens: any[]) => tokens
  }
})

export class ContentProcessor {
  private contentDir: string

  constructor(contentDir: string = 'src/content') {
    this.contentDir = contentDir
  }

  /**
   * Read all markdown files from the content directory
   */
  async getAllPosts(): Promise<BlogPost[]> {
    const files = fs.readdirSync(this.contentDir)
    const markdownFiles = files.filter(
      file => file.endsWith('.md') && file !== '.gitkeep'
    )

    const allParsed = await Promise.all(markdownFiles.map(file => this.parsePost(file)))
    const posts = allParsed.filter(p => !p.draft)

    // Sort posts by date (newest first)
    return posts.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })
  }

  /**
   * Parse a single markdown file into a BlogPost
   */
  async parsePost(filename: string): Promise<BlogPost> {
    const filePath = path.join(this.contentDir, filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    const { data, content } = matter(fileContent)

    // Generate slug from filename (remove .md extension)
    const slug = filename.replace(/\.md$/, '')

    // Extract reference link definitions (e.g. [1]: https://...) before marked consumes them
    const refPattern = /^\[([^\]]+)\]:\s*(\S+)(?:\s+"([^"]*)")?$/gm
    const refs: Array<{ label: string; url: string; title?: string }> = []
    let refMatch
    while ((refMatch = refPattern.exec(content)) !== null) {
      refs.push({ label: refMatch[1], url: refMatch[2], title: refMatch[3] })
    }

    // Preprocess: replace [text][label] with plain text + superscript number,
    // then strip the reference definition lines so marked doesn't see them
    const refMap = new Map(refs.map(r => [r.label, r]))
    const processedContent = content
      .replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (_, text, label) => {
        if (refMap.has(label)) {
          return `${text}<sup><a href="#ref-${label}">${label}</a></sup>`
        }
        return `[${text}][${label}]`
      })
      .replace(/^\[[^\]]+\]:\s*\S+.*$/gm, '')

    // Convert markdown to HTML
    let htmlContent = await marked(processedContent)

    // Append a links section for any reference definitions found
    if (refs.length > 0) {
      const items = refs
        .map(ref => {
          const display = ref.title || ref.url
          return `<li id="ref-${ref.label}"><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${display}</a></li>`
        })
        .join('\n')
      htmlContent += `\n<section class="post-links"><ol>${items}</ol></section>`
    }

    // Generate excerpt (first 200 characters of content)
    const excerpt = this.generateExcerpt(content)

    // Format dates - handle both string and Date objects
    const formattedDate = this.formatDate(
      data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date
    )
    const formattedUpdated = data.updated
      ? this.formatDate(
          data.updated instanceof Date
            ? data.updated.toISOString().split('T')[0]
            : data.updated
        )
      : undefined

    return {
      title: data.title || 'Sin título',
      date: formattedDate,
      updated: formattedUpdated,
      slug,
      content: htmlContent,
      excerpt,
      filename,
      tag: data.tag,
      draft: data.draft === true
    }
  }

  /**
   * Get a single post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const filename = `${slug}.md`
    const filePath = path.join(this.contentDir, filename)

    if (!fs.existsSync(filePath)) {
      return null
    }

    return this.parsePost(filename)
  }

  /**
   * Generate excerpt from markdown content
   */
  private generateExcerpt(content: string, maxLength: number = 200): string {
    // Remove markdown syntax and get plain text
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/>\s*/g, '') // Remove blockquote markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()

    if (plainText.length <= maxLength) {
      return plainText
    }

    return plainText.substring(0, maxLength).trim() + '...'
  }

  /**
   * Format date to Spanish locale
   */
  private formatDate(dateString: string): string {
    try {
      let date: Date

      // Try different date formats
      if (dateString.includes('T') || dateString.includes('Z')) {
        // ISO format
        date = parseISO(dateString)
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format
        date = parseISO(dateString)
      } else {
        // Try parsing as regular date
        date = new Date(dateString)
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }

      return format(date, 'MMMM yyyy')
    } catch (error) {
      console.warn(`Invalid date format: ${dateString}`)
      return dateString
    }
  }
}
