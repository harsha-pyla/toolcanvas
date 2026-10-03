import fs from 'fs';
import path from 'path';

const root = 'c:/Users/harsh/OneDrive/Desktop/experiment';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === '.git' || file === 'node_modules' || file === '.agents' || file === 'scripts') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.html')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = filePath.replace(root.replace(/\//g, '\\'), '').replace(/\\/g, '/');
    let dirPath = relativePath.replace(/\/index\.html$/, '/');
    
    if (dirPath === '/404.html') {
        dirPath = '/404.html';
    } else if (dirPath.endsWith('.html')) {
        dirPath = dirPath.replace(/\.html$/, '/');
    }
    
    const canonicalUrl = `https://toolcanvas.online${dirPath}`;
    
    // Remove all existing canonical tags
    content = content.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, '');
    content = content.replace(/<link[^>]*href=["'][^"']*["'][^>]*rel=["']canonical["'][^>]*>/gi, '');
    
    // Add canonical tag right after <head>
    content = content.replace(/(<head[^>]*>)/i, `$1\n    <link rel="canonical" href="${canonicalUrl}">`);
    
    // Fix og:url
    content = content.replace(/<meta[^>]*property=["']og:url["'][^>]*>/gi, '');
    content = content.replace(/<meta[^>]*content=["'][^"']*["'][^>]*property=["']og:url["'][^>]*>/gi, '');
    content = content.replace(/(<head[^>]*>)/i, `$1\n    <meta property="og:url" content="${canonicalUrl}">`);
    
    // Replace all internal URLs in href
    content = content.replace(/href=["']([^"']+)["']/gi, (match, url) => {
        if (url.startsWith('http') && !url.includes('toolcanvas.online')) return match; 
        if (url.startsWith('#')) return match; 
        if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) return match;
        if (url.startsWith('https://fonts.googleapis.com')) return match; // just in case
        
        let newUrl = url;
        newUrl = newUrl.replace(/https?:\/\/(www\.)?toolcanvas\.online/gi, '');
        
        if (!newUrl.startsWith('/')) {
            const currentDir = path.dirname(relativePath).replace(/\\/g, '/');
            newUrl = path.posix.join(currentDir, newUrl);
        }
        
        if (!newUrl.startsWith('/')) newUrl = '/' + newUrl;
        
        const parts = newUrl.split('#');
        let basePath = parts[0];
        const hash = parts[1] ? '#' + parts[1] : '';
        
        if (basePath.endsWith('index.html')) {
            basePath = basePath.slice(0, -10);
        } else if (basePath.endsWith('.html') && !basePath.includes('404.html')) {
            basePath = basePath.slice(0, -5) + '/';
        }
        
        const hasExtension = /\.[a-z0-9]+$/i.test(basePath.split('?')[0]);
        if (!hasExtension && !basePath.endsWith('/')) {
            basePath += '/';
        }
        
        return `href="https://toolcanvas.online${basePath}${hash}"`;
    });

    // Replace src
    content = content.replace(/src=["']([^"']+)["']/gi, (match, url) => {
        if (url.startsWith('http') && !url.includes('toolcanvas.online')) return match;
        if (url.startsWith('data:')) return match;
        
        let newUrl = url;
        newUrl = newUrl.replace(/https?:\/\/(www\.)?toolcanvas\.online/gi, '');
        if (!newUrl.startsWith('/')) {
            const currentDir = path.dirname(relativePath).replace(/\\/g, '/');
            newUrl = path.posix.join(currentDir, newUrl);
        }
        if (!newUrl.startsWith('/')) newUrl = '/' + newUrl;
        
        return `src="https://toolcanvas.online${newUrl}"`;
    });

    // 404 special rules
    if (relativePath === '/404.html') {
        if (!content.includes('noindex')) {
            content = content.replace(/(<head[^>]*>)/i, `$1\n    <meta name="robots" content="noindex">`);
        }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
}

walk(root);
console.log("HTML processing done.");
