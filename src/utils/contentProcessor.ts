import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { BlogPost } from '../types/blog'

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

    const posts = await Promise.all(markdownFiles.map(file => this.parsePost(file)))

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

    // Convert markdown to HTML
    const htmlContent = await marked(content)

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
      filename
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

      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es })
    } catch (error) {
      console.warn(`Invalid date format: ${dateString}`)
      return dateString
    }
  }
}
