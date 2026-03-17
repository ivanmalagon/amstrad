# amstrad — personal blog

Custom static site generator for Ivan Malagon's personal blog, deployed at `ivanmalagon.com`.

## Commands

```bash
pnpm build       # build the full site into site/
pnpm preview     # build + serve at http://localhost:3000
pnpm clean       # delete site/
```

## How it works

TypeScript source in `src/`, output in `site/` (git-ignored).

- `src/content/*.md` — posts in Markdown with YAML frontmatter
- `src/layouts/base.html` — single HTML template with `{{ variable }}` placeholders
- `src/styles/main.css` — inlined into every page at build time (no external CSS file)
- `src/public/` — static assets copied verbatim to `site/public/`
- `src/config/blog.ts` — site title, author, base URL

Build pipeline (`BlogGenerator`):
1. Parse all `.md` files → `BlogPost[]`, sorted newest first, drafts excluded
2. Copy `src/public/` → `site/public/`
3. Render each post → `site/posts/<slug>.html`
4. Render one page per tag → `site/tags/<tag-slug>.html`
5. Render home → `site/index.html`
6. Generate → `site/rss.xml`

## Content frontmatter

```yaml
---
title: Post title
date: 2025-10-13
tag: Books          # single tag — becomes a category page
draft: true         # omit from build entirely
---
```

Available tags (categories): Books, Posts — add new ones freely, a page is generated automatically.

### Special tags: `Now` and `About`

These tags behave as direct-link single pages (implemented via `DIRECT_TAGS` in `blogGenerator.ts`):

- Always exactly one post per tag.
- `Now` is always first in the sidebar, `About` is always last; other tags appear in between.
- Unlike `Now`, `About` goes last — not first.
- Clicking them in the sidebar links directly to the post page — no tag listing page is generated.
- Excluded from the home page list.
- The tag label is not rendered in the post header.

## Design

- **Font**: Georgia (system font, no external dependency) — change via `--font` in `main.css`
- **Palette**: warm off-white `#f8f6f1`, near-black `#1c1c1c`, muted `#8a8680`
- **Layout**: two-column grid on desktop (fixed sidebar left, content centered right); stacked on mobile
- **CSS variables** to change: `--font`, `--font-size-base`, `--sidebar-width`, `--content-max-width`

## Key files to edit

| What | Where |
|---|---|
| Blog title / author / URL | `src/config/blog.ts` |
| HTML structure | `src/layouts/base.html` |
| All styles | `src/styles/main.css` |
| Page rendering logic | `src/utils/templateRenderer.ts` |
| Markdown parsing | `src/utils/contentProcessor.ts` |
