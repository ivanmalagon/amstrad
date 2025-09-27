import { BlogPost, BlogConfig } from '../types/blog'
import { blogConfig } from '../config/blog'

export class RSSGenerator {
  private config: BlogConfig
  private maxItems: number

  constructor(config: BlogConfig = blogConfig, maxItems: number = 20) {
    this.config = config
    this.maxItems = maxItems
  }

  /**
   * Set the maximum number of items to include in the RSS feed
   */
  setMaxItems(maxItems: number): void {
    this.maxItems = maxItems
  }

  /**
   * Generate RSS feed XML from blog posts
   */
  generateRSSFeed(posts: BlogPost[]): string {
    const now = new Date()
    const lastBuildDate = now.toUTCString()
    const pubDate =
      posts.length > 0 ? new Date(posts[0].date).toUTCString() : now.toUTCString()

    const rssItems = posts
      .slice(0, this.maxItems) // Limit to configured number of posts
      .map(post => this.generateRSSItem(post))
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${this.escapeXml(this.config.title)}</title>
    <link>${this.config.baseUrl}</link>
    <description>Blog personal de ${this.escapeXml(this.config.author)}</description>
    <language>es</language>
    <managingEditor>${this.escapeXml(this.config.author)} (${
      this.config.baseUrl
    })</managingEditor>
    <webMaster>${this.escapeXml(this.config.author)} (${
      this.config.baseUrl
    })</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <atom:link href="${
      this.config.baseUrl
    }/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Static Blog Generator</generator>
    
${rssItems}
  </channel>
</rss>`
  }

  /**
   * Generate individual RSS item for a blog post
   */
  private generateRSSItem(post: BlogPost): string {
    const postUrl = `${this.config.baseUrl}/posts/${post.slug}.html`
    const pubDate = new Date(post.date).toUTCString()
    const guid = `${this.config.baseUrl}/posts/${post.slug}`

    // Clean HTML content for RSS (remove images and other problematic elements)
    const cleanContent = this.cleanHtmlForRSS(post.content)

    return `    <item>
      <title>${this.escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${cleanContent}]]></description>
    </item>`
  }

  /**
   * Clean HTML content for RSS feed
   */
  private cleanHtmlForRSS(html: string): string {
    return (
      html
        // Remove images (they might not load properly in RSS readers)
        .replace(/<img[^>]*>/gi, '')
        // Remove script tags
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        // Remove style tags
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // Clean up extra whitespace
        .replace(/\s+/g, ' ')
        .trim()
    )
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}
