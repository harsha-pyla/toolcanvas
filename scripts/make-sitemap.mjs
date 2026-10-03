import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = 'c:/Users/harsh/OneDrive/Desktop/experiment';

function walk(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === '.git' || file === 'node_modules' || file === '.agents' || file === 'scripts' || file === 'partials') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, filesList);
        } else if (fullPath.endsWith('.html')) {
            filesList.push(fullPath);
        }
    }
    return filesList;
}

function getLastCommitDate(filePath) {
    try {
        const relativePath = path.relative(root, filePath);
        // Note: this assumes the repo uses git
        const dateString = execSync(`git log -1 --format=%cI "${relativePath}"`, { cwd: root }).toString().trim();
        if (dateString) {
            return dateString.split('T')[0]; // YYYY-MM-DD
        }
    } catch (e) {
        // Fallback or empty if not in git
    }
    return new Date().toISOString().split('T')[0];
}

const allHtml = walk(root);
let sitemapUrls = [];

for (const filePath of allHtml) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('noindex')) {
        continue; // Skip noindex pages like 404
    }
    
    const relativePath = filePath.replace(root.replace(/\//g, '\\'), '').replace(/\\/g, '/');
    let dirPath = relativePath.replace(/\/index\.html$/, '/');
    
    if (dirPath.endsWith('.html') && dirPath !== '/404.html') {
        dirPath = dirPath.replace(/\.html$/, '/');
    }
    
    // Ignore 404 regardless, just in case
    if (dirPath === '/404.html') continue;

    const url = `https://toolcanvas.online${dirPath}`;
    const lastmod = getLastCommitDate(filePath);
    
    sitemapUrls.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);
}

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemapContent, 'utf8');
console.log('Sitemap generated successfully.');
