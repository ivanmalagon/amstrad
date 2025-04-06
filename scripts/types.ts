export interface PostMetadata {
  title: string;
  date: string;
  updated: string;
  tags: string[];
}

export interface Post {
  metadata: PostMetadata;
  content: string;
  slug: string;
}

export interface PaginatedPosts {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
} 

export type Tag = 'technology' | 'books' | 'thoughts' | 'links' | 'games' | 'movies' | 'tv' | 'food' | 'travel' | 'about' | 'home'