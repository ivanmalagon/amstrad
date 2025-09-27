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

  /**
   * Generate the complete blog
   */
  async generate(): Promise<void> {
    console.log('🚀 Iniciando generación del blog...')

    try {
      // Load all posts
      console.log('📖 Cargando artículos...')
      const allPosts = await this.contentProcessor.getAllPosts()
      console.log(`✅ ${allPosts.length} artículos cargados`)

      // Copy static assets
      console.log('📁 Copiando archivos estáticos...')
      await this.templateRenderer.copyAssets()
      console.log('✅ Archivos estáticos copiados')

      // Generate individual post pages
      console.log('📝 Generando páginas de artículos...')
      await this.generatePostPages(allPosts)
      console.log('✅ Páginas de artículos generadas')

      // Generate home page
      console.log('🏠 Generando página de inicio...')
      await this.templateRenderer.renderHomePage(allPosts)
      console.log('✅ Página de inicio generada')

      // Generate RSS feed
      console.log('📡 Generando feed RSS...')
      await this.generateRSSFeed(allPosts)
      console.log('✅ Feed RSS generado')

      console.log('🎉 ¡Blog generado exitosamente!')
    } catch (error) {
      console.error('❌ Error generando el blog:', error)
      throw error
    }
  }

  /**
   * Generate individual post pages
   */
  private async generatePostPages(posts: BlogPost[]): Promise<void> {
    const promises = posts.map(post => this.templateRenderer.renderPost(post))
    await Promise.all(promises)
  }

  /**
   * Generate a specific post by slug
   */
  async generatePost(slug: string): Promise<void> {
    const post = await this.contentProcessor.getPostBySlug(slug)
    if (!post) {
      throw new Error(`Post with slug "${slug}" not found`)
    }

    await this.templateRenderer.renderPost(post)
    console.log(`✅ Post "${post.title}" generado`)
  }

  /**
   * Generate RSS feed
   */
  private async generateRSSFeed(posts: BlogPost[]): Promise<void> {
    const rssContent = this.rssGenerator.generateRSSFeed(posts)
    const outputPath = path.join('site', 'rss.xml')

    // Ensure the site directory exists
    if (!fs.existsSync('site')) {
      fs.mkdirSync('site', { recursive: true })
    }

    fs.writeFileSync(outputPath, rssContent, 'utf-8')
  }
}
