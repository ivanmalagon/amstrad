import fs from 'fs'
import path from 'path'
import { renderHTML } from './render'

export function generateNowPage(distDir: string) {
    const content = `
          <h1>Now</h1>
          <p>This is a static page about what I'm currently working on.</p>
      `
  
    fs.writeFileSync(path.join(distDir, 'now.html'), renderHTML(content, 'Now'))
  }