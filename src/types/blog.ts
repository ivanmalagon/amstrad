export interface BlogPost {
  title: string
  date: string
  updated?: string
  slug: string
  content: string
  excerpt?: string
  filename: string
}

export interface BlogConfig {
  title: string
  author: string
  baseUrl: string
}
