export interface BlogPost {
  title: string
  date: string
  updated?: string
  slug: string
  content: string
  excerpt?: string
  filename: string
  tag?: string
  draft?: boolean
}

export interface BlogConfig {
  title: string
  author: string
  baseUrl: string
  rssMaxItems?: number
}
