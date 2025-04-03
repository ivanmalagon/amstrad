import fs from 'fs';
import path from 'path';
import { getAllPosts, getPaginatedPosts, getPostsByTag } from './contentProcessor';
import { processCSS } from './cssProcessor';

const DIST_DIR = path.join(process.cwd(), 'dist');
const PUBLIC_DIR = path.join(process.cwd(), 'src/public');

// Helper function to render template
function renderTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        result = result.replace(new RegExp(`{{ ${key} }}`, 'g'), value);
    }
    return result;
}

// Read base template
const baseTemplate = fs.readFileSync(
    path.join(process.cwd(), 'src/layouts/base.html'),
    'utf8'
);

// Process CSS and get hashed filename
const { filename: cssFilename } = processCSS();

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Copy public files (excluding styles.css since we process it separately)
if (fs.existsSync(PUBLIC_DIR)) {
    fs.cpSync(PUBLIC_DIR, path.join(DIST_DIR, 'public'), { recursive: true });
}

// Helper function to render HTML with processed CSS
function renderHTML(content: string, title: string): string {
    return renderTemplate(baseTemplate, {
        title,
        content,
        cssPath: `/public/${cssFilename}`
    });
}

// Generate home page
function generateHomePage() {
    const allPosts = getAllPosts();
    const paginated = getPaginatedPosts(allPosts, 1);
    
    const content = `
        <h1>Latest Posts</h1>
        ${paginated.posts.map(post => `
            <article>
                <h2><a href="/posts/${post.slug}.html">${post.metadata.title}</a></h2>
                <p>Posted on ${new Date(post.metadata.date).toLocaleDateString()}</p>
                <div>${post.content}</div>
            </article>
        `).join('')}
        <div class="pagination">
            ${paginated.hasNext ? `<a href="/page/2.html">Next</a>` : ''}
        </div>
    `;
    
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), renderHTML(content, 'Home'));
}

// Generate paginated home pages
function generatePaginatedHomePages() {
    const allPosts = getAllPosts();
    const totalPages = Math.ceil(allPosts.length / 10);
    
    for (let page = 2; page <= totalPages; page++) {
        const paginated = getPaginatedPosts(allPosts, page);
        
        const content = `
            <h1>Latest Posts - Page ${page}</h1>
            ${paginated.posts.map(post => `
                <article>
                    <h2><a href="/posts/${post.slug}.html">${post.metadata.title}</a></h2>
                    <p>Posted on ${new Date(post.metadata.date).toLocaleDateString()}</p>
                    <div>${post.content}</div>
                </article>
            `).join('')}
            <div class="pagination">
                ${paginated.hasPrevious ? `<a href="/page/${page - 1}.html">Previous</a>` : ''}
                ${paginated.hasNext ? `<a href="/page/${page + 1}.html">Next</a>` : ''}
            </div>
        `;
        
        const pageDir = path.join(DIST_DIR, 'page');
        if (!fs.existsSync(pageDir)) {
            fs.mkdirSync(pageDir, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(pageDir, `${page}.html`),
            renderHTML(content, `Home - Page ${page}`)
        );
    }
}

// Generate tags page
function generateTagsPage() {
    const allPosts = getAllPosts();
    const tags = new Set(allPosts.flatMap(post => post.metadata.tags));
    
    const content = `
        <h1>Tags</h1>
        <ul>
            ${Array.from(tags).map(tag => `
                <li><a href="/tags/${tag}.html">${tag}</a></li>
            `).join('')}
        </ul>
    `;
    
    fs.writeFileSync(
        path.join(DIST_DIR, 'tags.html'),
        renderHTML(content, 'Tags')
    );
}

// Generate tag pages
function generateTagPages() {
    const allPosts = getAllPosts();
    const tags = new Set(allPosts.flatMap(post => post.metadata.tags));
    
    for (const tag of tags) {
        const taggedPosts = getPostsByTag(tag);
        const totalPages = Math.ceil(taggedPosts.length / 10);
        
        for (let page = 1; page <= totalPages; page++) {
          const paginated = getPaginatedPosts(taggedPosts, page)

          const content = `
                <h1>Posts tagged with "${tag}"${
            page > 1 ? ` - Page ${page}` : ''
          }</h1>
                ${paginated.posts
                  .map(
                    post => `
                    <article>
                        <h2><a href="/posts/${post.slug}.html">${
                      post.metadata.title
                    }</a></h2>
                        <p>Posted on ${new Date(
                          post.metadata.date
                        ).toLocaleDateString()}</p>
                        <div>${post.content}</div>
                    </article>
                `
                  )
                  .join('')}
                <div class="pagination">
                    ${
                      paginated.hasPrevious
                        ? `<a href="/tags/${tag}/${
                            page === 2 ? '' : page - 1
                          }.html">Previous</a>`
                        : ''
                    }
                    ${
                      paginated.hasNext
                        ? `<a href="/tags/${tag}/${page + 1}.html">Next</a>`
                        : ''
                    }
                </div>
            `

          const tagDir = path.join(DIST_DIR, 'tags', tag)
          if (!fs.existsSync(tagDir)) {
            fs.mkdirSync(tagDir, { recursive: true })
          }

          // Use index.html for first page, otherwise use page number
          const filename = page === 1 ? 'index.html' : `${page}.html`

          fs.writeFileSync(
            path.join(tagDir, filename),
            renderHTML(content, `Tag: ${tag}${page > 1 ? ` - Page ${page}` : ''}`)
          )
        }
    }
}

// Generate individual post pages
function generatePostPages() {
    const allPosts = getAllPosts();
    
    for (const post of allPosts) {
        const content = `
            <article>
                <h1>${post.metadata.title}</h1>
                <p>Posted on ${new Date(post.metadata.date).toLocaleDateString()}</p>
                ${post.content}
            </article>
        `;
        
        const postsDir = path.join(DIST_DIR, 'posts');
        if (!fs.existsSync(postsDir)) {
            fs.mkdirSync(postsDir, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(postsDir, `${post.slug}.html`),
            renderHTML(content, post.metadata.title)
        );
    }
}

// Generate now page
function generateNowPage() {
    const content = `
        <h1>Now</h1>
        <p>This is a static page about what I'm currently working on.</p>
    `;
    
    fs.writeFileSync(
        path.join(DIST_DIR, 'now.html'),
        renderHTML(content, 'Now')
    );
}

// Run all generators
function build() {
    console.log('Starting build process...');
    
    generateHomePage();
    generatePaginatedHomePages();
    generateTagsPage();
    generateTagPages();
    generatePostPages();
    generateNowPage();
    
    console.log('Build completed successfully!');
}

build(); 