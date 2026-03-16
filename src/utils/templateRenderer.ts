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

  private tagSlug(tag: string): string {
    return tag.toLowerCase().replace(/\s+/g, '-')
  }

  private buildSidebar(allTags: string[], activeTag?: string): string {
    const tagLinks = allTags
      .map(tag => {
        const slug = this.tagSlug(tag)
        const isActive = tag === activeTag
        return `<a href="/tags/${slug}.html" class="tag-link${isActive ? ' active' : ''}">${tag}</a>`
      })
      .join('\n        ')

    return `
      <a href="/" class="site-title">RESONANCE</a>
      <nav class="tag-nav">
        ${tagLinks}
      </nav>
    `
  }

  private buildArticleList(posts: BlogPost[]): string {
    return posts
      .map(
        post => `
      <li>
        <a href="/posts/${post.slug}.html">${post.title}</a>
        <span class="date">${post.date}</span>
      </li>`
      )
      .join('')
  }

  async renderHomePage(posts: BlogPost[], allTags: string[]): Promise<void> {
    const layout = this.loadLayout()

    const content = `
      <ul class="article-list">
        ${this.buildArticleList(posts)}
      </ul>
    `

    const html = this.renderLayout(layout, {
      title: blogConfig.title,
      description: 'Personal blog by Ivan Malagon - Things that resonate with me',
      image: `${blogConfig.baseUrl}/public/hacheka_logo.png`,
      url: blogConfig.baseUrl,
      ogType: 'website',
      sidebar: this.buildSidebar(allTags),
      content
    })

    await this.writeFile('index.html', html)
  }

  async renderTagPage(tag: string, posts: BlogPost[], allTags: string[]): Promise<void> {
    const layout = this.loadLayout()

    const content = `
      <p class="section-title">${tag}</p>
      <ul class="article-list">
        ${this.buildArticleList(posts)}
      </ul>
    `

    const slug = this.tagSlug(tag)

    const html = this.renderLayout(layout, {
      title: `${tag} - ${blogConfig.title}`,
      description: `Articles tagged ${tag} on ${blogConfig.title}`,
      image: `${blogConfig.baseUrl}/public/hacheka_logo.png`,
      url: `${blogConfig.baseUrl}/tags/${slug}.html`,
      ogType: 'website',
      sidebar: this.buildSidebar(allTags, tag),
      content
    })

    await this.writeFile(`tags/${slug}.html`, html)
  }

  async renderPost(post: BlogPost, allTags: string[]): Promise<void> {
    const layout = this.loadLayout()

    const tagHtml = post.tag
      ? `<span class="post-tag"><a href="/tags/${this.tagSlug(post.tag)}.html">${post.tag}</a></span>`
      : ''

    const content = `
      <a href="/" class="back-link">← resonance</a>
      <article class="post">
        <header>
          <h1>${post.title}</h1>
          <div class="post-meta">
            <time class="mini">${post.date}</time>
            ${tagHtml}
          </div>
        </header>
        <div class="post-content">
          ${post.content}
        </div>
      </article>
    `

    const html = this.renderLayout(layout, {
      title: `${post.title} - ${blogConfig.title}`,
      description: post.excerpt || `Read ${post.title} on ${blogConfig.title}`,
      image: `${blogConfig.baseUrl}/public/hacheka_logo.png`,
      url: `${blogConfig.baseUrl}/posts/${post.slug}.html`,
      ogType: 'article',
      sidebar: this.buildSidebar(allTags, post.tag),
      content
    })

    await this.writeFile(`posts/${post.slug}.html`, html)
  }

  private loadLayout(): string {
    const layoutFilePath = path.join(this.layoutPath, 'base.html')
    return fs.readFileSync(layoutFilePath, 'utf-8')
  }

  private renderLayout(layout: string, variables: { [key: string]: string }): string {
    let html = layout

    // Inject CSS inline
    const cssContent = this.loadCSS()
    html = html.replace('{{ cssPath }}', `<style>${cssContent}</style>`)

    Object.entries(variables).forEach(([key, value]) => {
      html = html.replace(new RegExp(`\\{\\{ ${key} \\}\\}`, 'g'), value)
    })

    return html
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.outputDir, filePath)
    const dir = path.dirname(fullPath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(fullPath, content, 'utf-8')
  }

  async copyAssets(): Promise<void> {
    const publicDir = 'src/public'
    const outputPublicDir = path.join(this.outputDir, 'public')

    if (fs.existsSync(publicDir)) {
      this.copyDirectory(publicDir, outputPublicDir)
    }
  }

  private loadCSS(): string {
    const mainCssPath = path.join('src/styles', 'main.css')
    return fs.existsSync(mainCssPath) ? fs.readFileSync(mainCssPath, 'utf-8') : ''
  }

  private copyDirectory(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    fs.readdirSync(src).forEach(file => {
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
