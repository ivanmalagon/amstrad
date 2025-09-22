import fs from 'fs'
import path from 'path'
import { BlogPost, PaginationInfo } from '../types/blog'
import { blogConfig } from '../config/blog'

export class TemplateRenderer {
  private layoutPath: string
  private outputDir: string

  constructor(layoutPath: string = 'src/layouts', outputDir: string = 'site') {
    this.layoutPath = layoutPath
    this.outputDir = outputDir
  }

  /**
   * Render a single blog post page
   */
  async renderPost(post: BlogPost): Promise<void> {
    const layout = this.loadLayout()

    const content = `
      <article>
        <header>
          <h1>${post.title}</h1>
          <div class="post-meta">
            <time class="date">${post.date}</time>
            ${
              post.updated
                ? `<time class="updated">Actualizado: ${post.updated}</time>`
                : ''
            }
          </div>
        </header>
        <div class="post-content">
          ${post.content}
        </div>
      </article>
    `

    const html = this.renderLayout(layout, {
      title: `${post.title} - ${blogConfig.title}`,
      content
    })

    await this.writeFile(`posts/${post.slug}.html`, html)
  }

  /**
   * Render the home page with article index
   */
  async renderHomePage(
    posts: BlogPost[],
    pagination?: PaginationInfo,
    outputPath?: string
  ): Promise<void> {
    const layout = this.loadLayout()

    const articlesHtml = posts
      .map(
        post => `
      <article>
        <header>
          <h2><a href="/posts/${post.slug}.html">${post.title}</a></h2>
            <div class="post-meta">
              <time class="date">${post.date}</time>
            </div>
        </header>
        <p>${post.excerpt}</p>
      </article>
    `
      )
      .join('')

    const paginationHtml = pagination ? this.renderPagination(pagination) : ''

    const content = `
      <div class="home-content">
        <h1>Artículos recientes</h1>
        ${articlesHtml}
        ${paginationHtml}
      </div>
    `

    const html = this.renderLayout(layout, {
      title: blogConfig.title,
      content
    })

    await this.writeFile(outputPath || 'index.html', html)
  }

  /**
   * Load the base layout template
   */
  private loadLayout(): string {
    const layoutPath = path.join(this.layoutPath, 'base.html')
    return fs.readFileSync(layoutPath, 'utf-8')
  }

  /**
   * Render the layout with content and variables
   */
  private renderLayout(
    layout: string,
    variables: { [key: string]: string }
  ): string {
    let html = layout

    // Load and inject CSS
    const cssContent = this.loadCSS()
    html = html.replace('{{ cssPath }}', '')
    html = html.replace('</head>', `<style>${cssContent}</style>\n  </head>`)

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{ ${key} }}`
      html = html.replace(new RegExp(placeholder, 'g'), value)
    })

    return html
  }

  /**
   * Render pagination HTML
   */
  private renderPagination(pagination: PaginationInfo): string {
    if (!pagination.hasNext && !pagination.hasPrev) {
      return ''
    }

    const prevLink = pagination.hasPrev
      ? `<a href="/page/${pagination.prevPage}/index.html" class="prev">← Anterior</a>`
      : '<span class="prev disabled">← Anterior</span>'

    const nextLink = pagination.hasNext
      ? `<a href="/page/${pagination.nextPage}/index.html" class="next">Siguiente →</a>`
      : '<span class="next disabled">Siguiente →</span>'

    return `
      <div class="pagination">
        ${prevLink}
        <span class="page-info">Página ${pagination.currentPage} de ${pagination.totalPages}</span>
        ${nextLink}
      </div>
    `
  }

  /**
   * Write HTML content to file
   */
  private async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.outputDir, filePath)
    const dir = path.dirname(fullPath)

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(fullPath, content, 'utf-8')
  }

  /**
   * Copy static assets to output directory
   */
  async copyAssets(): Promise<void> {
    const publicDir = 'src/public'
    const outputPublicDir = path.join(this.outputDir, 'public')

    if (fs.existsSync(publicDir)) {
      this.copyDirectory(publicDir, outputPublicDir)
    }
  }

  /**
   * Load and return the CSS content
   */
  private loadCSS(): string {
    const stylesDir = 'src/styles'
    const mainCssPath = path.join(stylesDir, 'main.css')

    if (fs.existsSync(mainCssPath)) {
      return fs.readFileSync(mainCssPath, 'utf-8')
    }

    return ''
  }

  /**
   * Copy directory recursively
   */
  private copyDirectory(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    const files = fs.readdirSync(src)

    files.forEach(file => {
      const srcPath = path.join(src, file)
      const destPath = path.join(dest, file)

      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    })
  }
}
