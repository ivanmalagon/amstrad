import fs from 'fs'
import path from 'path'
import { getAllPosts, getPaginatedPosts, getPostsByTag } from './contentProcessor'
import { generateArticleContent, generateTagHref, getTagDescription, getTagEmoji } from './generators'
import { generateNowPage } from './now'
import { renderHTML } from './render'
import { Tag } from './types'
const DIST_DIR = path.join(process.cwd(), 'site')
const SRC_DIR = path.join(process.cwd(), 'src')
const PUBLIC_DIR = path.join(SRC_DIR, 'public')
const PAGINATION_LIMIT = 10

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true })
}

// Ensure public directory exists in site
const sitePublicDir = path.join(DIST_DIR, 'public')
if (!fs.existsSync(sitePublicDir)) {
  fs.mkdirSync(sitePublicDir, { recursive: true })
}

// Copy public files from src/public
if (fs.existsSync(PUBLIC_DIR)) {
  fs.cpSync(PUBLIC_DIR, sitePublicDir, { recursive: true })
}

// Generate home page
function generateHomePage() {
  const allPosts = getAllPosts()
  const paginated = getPaginatedPosts(allPosts, 1, PAGINATION_LIMIT)

  const content = `
        ${paginated.posts
          .map(post => generateArticleContent(post))
          .join('')}
        <div class="pagination">
            ${paginated.hasNext ? `<span></span><a href="/page/2.html">Next&nbsp;&raquo;</a>` : ''}
        </div>
    `

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), renderHTML(content, 'Home'))
}

// Generate paginated home pages
function generatePaginatedHomePages() {
  const allPosts = getAllPosts()
  const totalPages = Math.ceil(allPosts.length / PAGINATION_LIMIT)

  for (let page = 2; page <= totalPages; page++) {
    const paginated = getPaginatedPosts(allPosts, page, PAGINATION_LIMIT)

    const content = `
            ${paginated.posts
              .map(
                post => generateArticleContent(post))
              .join('')}
            <div class="pagination">
                ${
                  paginated.hasPrevious
                    ? `<a href="${
                        page - 1 === 1 ? '/' : `/page/${page - 1}.html`
                      }">&laquo;&nbsp;Previous</a>`
                    : '<span></span>'
                }
                ${
                  paginated.hasNext
                    ? `<a href="/page/${page + 1}.html">Next&nbsp;&raquo;</a>`
                    : ''
                }
            </div>
        `

    const pageDir = path.join(DIST_DIR, 'page')
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true })
    }

    fs.writeFileSync(
      path.join(pageDir, `${page}.html`),
      renderHTML(content, `Home - Page ${page}`)
    )
  }
}

// Generate tags page
function generateTagsPage() {
  const allPosts = getAllPosts()
  const tags = new Set(allPosts.flatMap(post => post.metadata.tags))

  const content = `
        <h1>Tags</h1>
        <div class="tag-list">
            ${Array.from(tags)
              .map(
                tag => `
                <div class="tag-item"><a ${generateTagHref(tag as Tag)}>${getTagEmoji(tag as Tag)} ${tag}</a></div>
            `
              )
              .join('')}
        </div>
    `

  fs.writeFileSync(path.join(DIST_DIR, 'tags.html'), renderHTML(content, 'Tags'))
}

// Generate tag pages
function generateTagPages() {
  const allPosts = getAllPosts()
  const tags = new Set(allPosts.flatMap(post => post.metadata.tags))

  for (const tag of tags) {
    const taggedPosts = getPostsByTag(tag)
    const totalPages = Math.ceil(taggedPosts.length / PAGINATION_LIMIT)

    for (let page = 1; page <= totalPages; page++) {
      const paginated = getPaginatedPosts(taggedPosts, page, PAGINATION_LIMIT)

      const content = `
                <h1 class="tag-title">${tag}</h1>
                <p class="tag-description">${getTagDescription(tag as Tag)}</p>
                ${paginated.posts
                  .map(post => generateArticleContent(post))
                  .join('')}
                <div class="pagination">
                    ${
                      paginated.hasPrevious
                        ? `<a href="/tags/${tag}/${
                            page === 2 ? '' : `${page - 1}.html`
                          }">&laquo;&nbsp;Previous</a>`
                        : '<span></span>'
                    }
                    ${
                      paginated.hasNext
                        ? `<a href="/tags/${tag}/${page + 1}.html">Next&nbsp;&raquo;</a>`
                        : ''
                    }
                </div>
            `

      const tagDir = path.join(DIST_DIR, 'tags', tag)
      if (!fs.existsSync(tagDir)) {
        fs.mkdirSync(tagDir, { recursive: true })
      }

      // Use index.html for first page, otherwise use page number
      const filename = page === 1 ? 'index.html' : `${page}.html`

      fs.writeFileSync(
        path.join(tagDir, filename),
        renderHTML(content, `Tag: ${tag}${page > 1 ? ` - Page ${page}` : ''}`)
      )
    }
  }
}

// Generate individual post pages
function generatePostPages() {
  const allPosts = getAllPosts()

  for (const post of allPosts) {
    const content = generateArticleContent(post)

    const postsDir = path.join(DIST_DIR, 'posts')
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true })
    }

    fs.writeFileSync(
      path.join(postsDir, `${post.slug}.html`),
      renderHTML(content, post.metadata.title)
    )
  }
}

// Run all generators
function build() {
  console.log('Starting build process...')

  generateHomePage()
  generatePaginatedHomePages()
  generateTagsPage()
  generateTagPages()
  generatePostPages()
  generateNowPage(DIST_DIR)

  console.log('Build completed successfully!')
}

build()
