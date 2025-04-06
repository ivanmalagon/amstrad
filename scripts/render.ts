import fs from 'fs'
import path from 'path'
import { processCSS } from './cssProcessor'

// Process CSS and get hashed filename
const { filename: cssFilename } = processCSS()

// Read base template
const baseTemplate = fs.readFileSync(
    path.join(process.cwd(), 'src/layouts/base.html'),
    'utf8'
  )

// Helper function to render template
function renderTemplate(template: string, data: Record<string, any>): string {
  let result = template
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{ ${key} }}`, 'g'), value)
  }
  return result
}

// Helper function to render HTML with processed CSS
export function renderHTML(content: string, title: string): string {
  return renderTemplate(baseTemplate, {
    title,
    content,
    cssPath: `/public/${cssFilename}`
  })
}
