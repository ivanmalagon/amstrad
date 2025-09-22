#!/usr/bin/env node

import { BlogGenerator } from './generators/blogGenerator'
import fs from 'fs'
import path from 'path'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  // Ensure output directory exists
  const outputDir = 'site'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const generator = new BlogGenerator()

  try {
    switch (command) {
      case 'build':
        console.log('🔨 Construyendo blog completo...')
        await generator.generate()
        break

      case 'post':
        const slug = args[1]
        if (!slug) {
          console.error('❌ Error: Debes especificar el slug del post')
          console.log('Uso: npm run build:post <slug>')
          process.exit(1)
        }
        console.log(`📝 Generando post: ${slug}`)
        await generator.generatePost(slug)
        break

      case 'dev':
        console.log('🚀 Iniciando modo desarrollo con hot reload...')
        await generator.generate()
        console.log('✅ Sitio generado inicialmente')

        // Watch for changes in multiple directories
        const chokidar = await import('chokidar')

        // Watch patterns for different file types
        const watchPatterns = [
          'src/content/**/*.md', // Content files
          'src/layouts/**/*.html', // Layout templates
          'src/styles/**/*.css', // Stylesheets
          'src/config/**/*.ts', // Configuration files
          'src/types/**/*.ts', // Type definitions
          'src/utils/**/*.ts', // Utility files
          'src/generators/**/*.ts' // Generator files
        ]

        const watcher = chokidar.watch(watchPatterns, {
          ignored: /^\./,
          persistent: true,
          ignoreInitial: true
        })

        let isGenerating = false

        const generateWithDebounce = async (path: string, action: string) => {
          if (isGenerating) {
            console.log(`⏳ Generación en curso, saltando ${action}: ${path}`)
            return
          }

          isGenerating = true
          const startTime = Date.now()

          try {
            console.log(`\n🔄 ${action}: ${path}`)
            await generator.generate()
            const duration = Date.now() - startTime
            console.log(`✅ Sitio regenerado en ${duration}ms`)
          } catch (error) {
            console.error(`❌ Error durante la regeneración:`, error)
          } finally {
            isGenerating = false
          }
        }

        watcher.on('change', async path => {
          await generateWithDebounce(path, 'Archivo modificado')
        })

        watcher.on('add', async path => {
          await generateWithDebounce(path, 'Nuevo archivo')
        })

        watcher.on('unlink', async path => {
          await generateWithDebounce(path, 'Archivo eliminado')
        })

        watcher.on('ready', () => {
          console.log('\n👀 Observando cambios en:')
          console.log('  📝 src/content/ - Artículos en Markdown')
          console.log('  🎨 src/layouts/ - Plantillas HTML')
          console.log('  💄 src/styles/ - Estilos CSS')
          console.log('  ⚙️  src/config/ - Configuración')
          console.log('  📋 src/types/ - Definiciones TypeScript')
          console.log('  🔧 src/utils/ - Utilidades')
          console.log('  🏗️  src/generators/ - Generadores')
          console.log('\n🔥 Hot reload activado! Presiona Ctrl+C para salir')
        })

        // Handle graceful shutdown
        process.on('SIGINT', () => {
          console.log('\n\n👋 Cerrando modo desarrollo...')
          watcher.close()
          process.exit(0)
        })

        break

      default:
        console.log('📖 Generador de Blog Estático')
        console.log('')
        console.log('Comandos disponibles:')
        console.log('  build     - Generar todo el blog')
        console.log('  post      - Generar un post específico')
        console.log('  dev       - Modo desarrollo con observación de archivos')
        console.log('')
        console.log('Ejemplos:')
        console.log('  npm run build')
        console.log('  npm run build:post todas-las-personas-que-fui')
        console.log('  npm run dev')
        break
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('❌ Error no capturado:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason)
  process.exit(1)
})

main()
