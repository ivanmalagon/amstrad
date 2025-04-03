import fs from 'fs';
import matter from 'gray-matter';
import { marked } from 'marked';
import path from 'path';
import { Post, PostMetadata } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

// Configure marked to be synchronous
marked.setOptions({
  async: false,
  gfm: true,
  breaks: true
});

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(CONTENT_DIR);
  
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const slug = file.replace(/\.md$/, '');
      const filePath = path.join(CONTENT_DIR, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      return {
        metadata: data as PostMetadata,
        content: marked(content) as string,
        slug
      };
    })
    .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter(post => post.metadata.tags.includes(tag));
}

export function getPaginatedPosts(posts: Post[], page: number, perPage: number) {
  if (!perPage) {
    throw new Error('perPage is required for pagination')
  }
  const start = (page - 1) * perPage
  const end = start + perPage
  const paginatedPosts = posts.slice(start, end)

  return {
    posts: paginatedPosts,
    currentPage: page,
    totalPages: Math.ceil(posts.length / perPage),
    hasNext: end < posts.length,
    hasPrevious: start > 0
  }
} 