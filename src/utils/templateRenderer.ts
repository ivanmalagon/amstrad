import fs from 'fs'
import path from 'path'
import { BlogPost } from '../types/blog'
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

    const articleNav = `
      <nav class="article-nav">
        <span><a href="/" class="home-link">← resonance</a></span>
      </nav>
    `
    const articleContent = `
      <article>
        <header>
          <h1>${post.title}</h1>
          <div class="post-meta">
            <time class="mini">${post.date}</time>
          </div>
        </header>
        <div class="post-content">
          ${post.content}
        </div>
      </article>
    `

    const html = this.renderLayout(layout, {
      title: `${post.title} - ${blogConfig.title}`,
      content: `${articleNav}${articleContent}`
    })

    await this.writeFile(`posts/${post.slug}.html`, html)
  }

  /**
   * Render the home page with article index
   */
  async renderHomePage(posts: BlogPost[]): Promise<void> {
    const layout = this.loadLayout()

    const articlesHtml = posts
      .map(
        post => `
      <li>
        <span>
          <a href="/posts/${post.slug}.html">${post.title}</a>
        </span>
        <span class="mini date">
          <time>${post.date}</time>
        </span>
      </li>
    `
      )
      .join('')

    const content = `
      <div class="spacer"></div>
      <ul class="article-list">
        ${articlesHtml}
      </ul>
    `

    const homeNav = `
      <nav class="home-nav">
        <span class="home-header">RESONANCE</span>
      </nav>
    `

    const html = this.renderLayout(layout, {
      title: blogConfig.title,
      content: `${homeNav}${content}`
    })

    await this.writeFile('index.html', html)
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
