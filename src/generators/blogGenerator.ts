import { ContentProcessor } from '../utils/contentProcessor'
import { TemplateRenderer } from '../utils/templateRenderer'
import { RSSGenerator } from '../utils/rssGenerator'
import { BlogPost } from '../types/blog'
import { blogConfig } from '../config/blog'
import fs from 'fs'
import path from 'path'

export class BlogGenerator {
  private contentProcessor: ContentProcessor
  private templateRenderer: TemplateRenderer
  private rssGenerator: RSSGenerator

  constructor() {
    this.contentProcessor = new ContentProcessor()
    this.templateRenderer = new TemplateRenderer()
    this.rssGenerator = new RSSGenerator(blogConfig, blogConfig.rssMaxItems)
  }

  async generate(): Promise<void> {
    console.log('🚀 Iniciando generación del blog...')

    try {
      console.log('📖 Cargando artículos...')
      const allPosts = await this.contentProcessor.getAllPosts()
      console.log(`✅ ${allPosts.length} artículos cargados`)

      // Tags that link directly to their single post (no tag listing page, excluded from home)
      const DIRECT_TAGS = ['Now', 'About']

      // Collect unique tags: Now first, About last, rest in first-seen order in between
      const rawTags = [...new Set(allPosts.map(p => p.tag).filter(Boolean) as string[])]
      const allTags = [
        ...(['Now'].filter(t => rawTags.includes(t))),
        ...rawTags.filter(t => !DIRECT_TAGS.includes(t)),
        ...(['About'].filter(t => rawTags.includes(t)))
      ]

      // Map of tag -> slug for direct-link tags
      const directSlugs = new Map(
        DIRECT_TAGS.map(t => [t, allPosts.find(p => p.tag === t)?.slug]).filter(([, s]) => s) as [string, string][]
      )

      console.log('📁 Copiando archivos estáticos...')
      await this.templateRenderer.copyAssets()

      console.log('📝 Generando páginas de artículos...')
      await Promise.all(allPosts.map(post => this.templateRenderer.renderPost(post, allTags, directSlugs)))

      console.log('🏷️  Generando páginas de tags...')
      await Promise.all(
        allTags.filter(t => !DIRECT_TAGS.includes(t)).map(tag => {
          const tagged = allPosts.filter(p => p.tag === tag)
          return this.templateRenderer.renderTagPage(tag, tagged, allTags, directSlugs)
        })
      )

      console.log('🏠 Generando página de inicio...')
      await this.templateRenderer.renderHomePage(allPosts.filter(p => !DIRECT_TAGS.includes(p.tag ?? '')), allTags, directSlugs)

      console.log('📡 Generando feed RSS...')
      await this.generateRSSFeed(allPosts)

      console.log('🎉 ¡Blog generado exitosamente!')
    } catch (error) {
      console.error('❌ Error generando el blog:', error)
      throw error
    }
  }

  async generatePost(slug: string): Promise<void> {
    const allPosts = await this.contentProcessor.getAllPosts()
    const DIRECT_TAGS = ['Now', 'About']
    const rawTags = [...new Set(allPosts.map(p => p.tag).filter(Boolean) as string[])]
    const allTags = [
      ...(['Now'].filter(t => rawTags.includes(t))),
      ...rawTags.filter(t => !DIRECT_TAGS.includes(t)),
      ...(['About'].filter(t => rawTags.includes(t)))
    ]
    const directSlugs = new Map(
      DIRECT_TAGS.map(t => [t, allPosts.find(p => p.tag === t)?.slug]).filter(([, s]) => s) as [string, string][]
    )
    const post = allPosts.find(p => p.slug === slug)

    if (!post) {
      throw new Error(`Post with slug "${slug}" not found`)
    }

    await this.templateRenderer.renderPost(post, allTags, directSlugs)
    console.log(`✅ Post "${post.title}" generado`)
  }

  private async generateRSSFeed(posts: BlogPost[]): Promise<void> {
    const rssContent = this.rssGenerator.generateRSSFeed(posts)
    const outputPath = path.join('site', 'rss.xml')

    if (!fs.existsSync('site')) {
      fs.mkdirSync('site', { recursive: true })
    }

    fs.writeFileSync(outputPath, rssContent, 'utf-8')
  }
}
