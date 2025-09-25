#!/usr/bin/env node

import { BlogGenerator } from './generators/blogGenerator'

class DevServer {
  private generator: BlogGenerator
  private isGenerating = false

  constructor() {
    this.generator = new BlogGenerator()
  }

  async start() {
    console.log('🚀 Iniciando modo desarrollo con hot reload...')

    // Initial build
    await this.generateSite()

    // Start file watching
    this.startWatching()

    // Handle graceful shutdown
    this.setupGracefulShutdown()
  }

  private async generateSite() {
    if (this.isGenerating) {
      console.log('⏳ Generación en curso, saltando...')
      return
    }

    this.isGenerating = true
    const startTime = Date.now()

    try {
      console.log('🔄 Regenerando sitio...')
      await this.generator.generate()
      const duration = Date.now() - startTime
      console.log(`✅ Sitio regenerado en ${duration}ms`)
    } catch (error) {
      console.error('❌ Error durante la regeneración:', error)
    } finally {
      this.isGenerating = false
    }
  }

  private startWatching() {
    const chokidar = require('chokidar')

    const watchPatterns = [
      'src/content/**/*.md',
      'src/layouts/**/*.html',
      'src/styles/**/*.css',
      'src/config/**/*.ts',
      'src/types/**/*.ts',
      'src/utils/**/*.ts',
      'src/generators/**/*.ts'
    ]

    const watcher = chokidar.watch(watchPatterns, {
      ignored: /^\./,
      persistent: true,
      ignoreInitial: true
    })

    watcher.on('change', async (filePath: string) => {
      console.log(`\n📝 Archivo modificado: ${filePath}`)
      await this.generateSite()
    })

    watcher.on('add', async (filePath: string) => {
      console.log(`\n➕ Nuevo archivo: ${filePath}`)
      await this.generateSite()
    })

    watcher.on('unlink', async (filePath: string) => {
      console.log(`\n🗑️ Archivo eliminado: ${filePath}`)
      await this.generateSite()
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
      console.log('\n🔥 Hot reload activado!')
      console.log('🛑 Presiona Ctrl+C para salir')
    })
  }

  private setupGracefulShutdown() {
    const shutdown = () => {
      console.log('\n\n👋 Cerrando modo desarrollo...')
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }
}

// Start the development server
const devServer = new DevServer()
devServer.start().catch(console.error)
