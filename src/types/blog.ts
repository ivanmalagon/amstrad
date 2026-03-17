export interface BlogPost {
  title: string
  date: string        // formatted display string e.g. "March 2026"
  rawDate: string     // ISO date string e.g. "2026-03-17" for sorting
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
