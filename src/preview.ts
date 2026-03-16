#!/usr/bin/env node

import { BlogGenerator } from './generators/blogGenerator'
import http from 'http'
import fs from 'fs'
import path from 'path'

const PORT = 3000
const SITE_DIR = path.resolve('site')

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

async function build() {
  if (!fs.existsSync(SITE_DIR)) {
    fs.mkdirSync(SITE_DIR, { recursive: true })
  }
  const generator = new BlogGenerator()
  await generator.generate()
}

function serve() {
  const server = http.createServer((req, res) => {
    let urlPath = req.url || '/'
    if (urlPath.endsWith('/')) urlPath += 'index.html'

    const filePath = path.join(SITE_DIR, urlPath)
    const ext = path.extname(filePath)
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not found')
        return
      }
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data)
    })
  })

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
    console.log('Press Ctrl+C to stop.')
  })
}

async function main() {
  console.log('Building blog...')
  await build()
  console.log('Build complete.')
  serve()
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
