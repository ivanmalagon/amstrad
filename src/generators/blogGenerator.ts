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

      // Collect unique tags, preserving first-seen order
      const allTags = [...new Set(allPosts.map(p => p.tag).filter(Boolean) as string[])]

      console.log('📁 Copiando archivos estáticos...')
      await this.templateRenderer.copyAssets()

      console.log('📝 Generando páginas de artículos...')
      await Promise.all(allPosts.map(post => this.templateRenderer.renderPost(post, allTags)))

      console.log('🏷️  Generando páginas de tags...')
      await Promise.all(
        allTags.map(tag => {
          const tagged = allPosts.filter(p => p.tag === tag)
          return this.templateRenderer.renderTagPage(tag, tagged, allTags)
        })
      )

      console.log('🏠 Generando página de inicio...')
      await this.templateRenderer.renderHomePage(allPosts, allTags)

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
    const allTags = [...new Set(allPosts.map(p => p.tag).filter(Boolean) as string[])]
    const post = allPosts.find(p => p.slug === slug)

    if (!post) {
      throw new Error(`Post with slug "${slug}" not found`)
    }

    await this.templateRenderer.renderPost(post, allTags)
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
