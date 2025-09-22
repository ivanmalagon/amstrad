# Blog Estático - IVAN's JUNKYARD

Un generador de blog estático simple para artículos en español, construido con TypeScript.

## Características

- ✅ Generación de páginas individuales para cada artículo
- ✅ Página de inicio con índice de artículos
- ✅ Paginación automática
- ✅ Fechas en español
- ✅ Soporte para Markdown con frontmatter
- ✅ Diseño responsive
- ✅ Modo desarrollo con observación de archivos

## Estructura del Proyecto

```
src/
├── content/           # Artículos en Markdown
├── layouts/          # Plantillas HTML
├── styles/           # Estilos CSS
├── types/            # Definiciones TypeScript
├── config/           # Configuración del blog
├── utils/            # Utilidades (procesador de contenido, renderer)
├── generators/       # Generador principal
└── build.ts          # Script de construcción

site/                 # Sitio generado (output)
```

## Uso

### Instalación de dependencias

```bash
npm install
```

### Comandos disponibles

```bash
# Generar todo el blog
npm run build

# Generar un post específico
npm run build:post <slug>

# Modo desarrollo con hot reload
npm run dev

# Limpiar sitio generado
npm run clean
```

### Formato de artículos

Los artículos deben estar en `src/content/` con extensión `.md` y frontmatter:

```markdown
---
title: Título del artículo
date: 2025-01-15
updated: 2025-01-16 # opcional
---

Contenido del artículo en Markdown...
```

### Configuración

Edita `src/config/blog.ts` para personalizar:

- Título del blog
- Descripción
- Autor
- URL base
- Artículos por página
- Idioma

## Desarrollo

El modo desarrollo (`npm run dev`) incluye hot reload que observa cambios en:

- 📝 `src/content/` - Artículos en Markdown
- 🎨 `src/layouts/` - Plantillas HTML
- 💄 `src/styles/` - Estilos CSS
- ⚙️ `src/config/` - Configuración
- 📋 `src/types/` - Definiciones TypeScript
- 🔧 `src/utils/` - Utilidades
- 🏗️ `src/generators/` - Generadores

El sitio se regenera automáticamente cuando detecta cualquier modificación, con feedback en tiempo real y protección contra regeneraciones concurrentes.

## Despliegue

El sitio generado se encuentra en la carpeta `site/`. Puedes desplegarlo en cualquier servidor web estático o servicio como:

- GitHub Pages
- Netlify
- Vercel
- Surge.sh

## Tecnologías utilizadas

- **TypeScript** - Lenguaje principal
- **gray-matter** - Procesamiento de frontmatter
- **marked** - Conversión de Markdown a HTML
- **date-fns** - Formateo de fechas en español
- **chokidar** - Observación de archivos (modo desarrollo)
