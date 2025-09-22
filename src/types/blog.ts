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
  description: string
  author: string
  baseUrl: string
  postsPerPage: number
  language: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  nextPage?: number
  prevPage?: number
}
