import { ContentProcessor } from '../utils/contentProcessor'
import { TemplateRenderer } from '../utils/templateRenderer'
import { BlogPost, PaginationInfo } from '../types/blog'
import { blogConfig } from '../config/blog'

export class BlogGenerator {
  private contentProcessor: ContentProcessor
  private templateRenderer: TemplateRenderer

  constructor() {
    this.contentProcessor = new ContentProcessor()
    this.templateRenderer = new TemplateRenderer()
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

      // Generate home page with pagination
      console.log('🏠 Generando página de inicio...')
      await this.generateHomePages(allPosts)
      console.log('✅ Página de inicio generada')

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
   * Generate home pages with pagination
   */
  private async generateHomePages(allPosts: BlogPost[]): Promise<void> {
    const postsPerPage = blogConfig.postsPerPage
    const totalPages = Math.ceil(allPosts.length / postsPerPage)

    // Generate main index page (page 1)
    const firstPagePosts = allPosts.slice(0, postsPerPage)
    const pagination = this.createPaginationInfo(1, totalPages)
    await this.templateRenderer.renderHomePage(firstPagePosts, pagination)

    // Generate additional pages if needed
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        const startIndex = (page - 1) * postsPerPage
        const endIndex = startIndex + postsPerPage
        const pagePosts = allPosts.slice(startIndex, endIndex)
        const pagePagination = this.createPaginationInfo(page, totalPages)

        await this.templateRenderer.renderHomePage(
          pagePosts,
          pagePagination,
          `page/${page}/index.html`
        )
      }
    }
  }

  /**
   * Create pagination information
   */
  private createPaginationInfo(
    currentPage: number,
    totalPages: number
  ): PaginationInfo {
    return {
      currentPage,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
      prevPage: currentPage > 1 ? currentPage - 1 : undefined
    }
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
}
