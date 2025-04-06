import { Post, Tag } from './types'
import { formatDate } from './utils'

const tags: Record<Tag, string> = {
  thoughts: '🧠',
  technology: '🤖',
  books: '📚',
  links: '🔗',
  games: '🎮',
  movies: '🎥',
  tv: '📺',
  food: '🍔',
  travel: '🗺️',
  about: '👤',
  home: '🏠',
}

export function generateArticleContent(post: Post) {
  const tag =
    post.metadata.tags && post.metadata.tags.length > 0 ? post.metadata.tags[0] : ''
  const tagEmoji = getTagEmoji(tag as Tag)

  return `
    <article>
        <header>
            ${tagEmoji ? `<span class="tag-emoji"><a ${generateTagHref(tag as Tag)}">${tagEmoji}</a></span>` : ''}
            <h2><a href="/posts/${post.slug}.html">${post.metadata.title}</a></h2>
            <p class="date">${formatDate(post.metadata.date)}</p>
        </header>

        ${post.content}
    </article>
    <hr/>
`
}

export function generateTagHref(tag: Tag) {
    return `href="/tags/${tag}/index.html"`
}

export function getTagEmoji(tag: Tag) {
    return tags[tag as Tag] || ''
}

export function getTagDescription(tag: Tag) {
    switch (tag) {
        case 'thoughts':
            return 'Thoughts on life, philosophy, and everything in between.'
        case 'technology':
            return 'Posts about technology, programming, and software development.'
        default:
            return `Thingies about ${tag}`
    }
}