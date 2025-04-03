import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const STYLES_DIR = path.join(process.cwd(), 'src/styles');
const DIST_DIR = path.join(process.cwd(), 'dist');

export function processCSS(): { filename: string; content: string } {
    const cssContent = fs.readFileSync(path.join(STYLES_DIR, 'main.css'), 'utf8');
    
    // Create content hash
    const hash = crypto
        .createHash('md5')
        .update(cssContent)
        .digest('hex')
        .slice(0, 8);
    
    const filename = `main.${hash}.css`;
    
    // Ensure dist/public directory exists
    const publicDir = path.join(DIST_DIR, 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write hashed CSS file
    fs.writeFileSync(path.join(publicDir, filename), cssContent);
    
    return {
        filename,
        content: cssContent
    };
} 