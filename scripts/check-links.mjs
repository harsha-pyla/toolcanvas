import fs from 'fs';
import path from 'path';

const rootDir = 'c:/Users/harsh/OneDrive/Desktop/experiment';
const baseUrl = 'https://toolcanvas.online';

let allFiles = [];
function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === '.git' || file === 'node_modules' || file === '.agents' || file === 'scripts' || file === 'partials') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.txt') || fullPath.endsWith('.xml')) {
            allFiles.push(fullPath);
        }
    }
}
walk(rootDir);

let errors = [];
let checkedCount = 0;

function resolveLocalPath(urlPath) {
    // URL path starts with /
    let cleanPath = urlPath.split('#')[0].split('?')[0];
    if (cleanPath === '/') return path.join(rootDir, 'index.html');
    if (cleanPath.endsWith('/')) {
        return path.join(rootDir, cleanPath, 'index.html');
    }
    // Might be a direct file like /ads.txt or /sitemap.xml
    return path.join(rootDir, cleanPath);
}

for (const filePath of allFiles.filter(f => f.endsWith('.html'))) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Find all href="..." and src="..."
    const linkRegex = /(?:href|src)=["']([^"']+)["']/gi;
    let match;
    
    // Also parse IDs to check hash links locally
    const idRegex = /id=["']([^"']+)["']/gi;
    let ids = new Set();
    let idMatch;
    while ((idMatch = idRegex.exec(content)) !== null) {
        ids.add(idMatch[1]);
    }

    while ((match = linkRegex.exec(content)) !== null) {
        const link = match[1];
        
        if (link.startsWith('http') && !link.startsWith(baseUrl)) {
            // External link, ignore
            continue;
        }

        if (link.startsWith('data:') || link.startsWith('mailto:') || link.startsWith('javascript:')) {
            continue;
        }

        let urlPath = link;
        let isInternalHash = false;
        
        if (link.startsWith(baseUrl)) {
            urlPath = link.substring(baseUrl.length);
        } else if (link.startsWith('#')) {
            isInternalHash = true;
        } else if (!link.startsWith('/')) {
            // Relative link - we shouldn't have any, but just in case
            errors.push(`File: ${path.relative(rootDir, filePath)}\n  Warning: Relative link found: ${link}`);
            continue;
        }

        let cleanPath = urlPath.split('#')[0].split('?')[0];

        // Also check if they are linking to .html instead of the trailing slash route
        if (cleanPath.endsWith('.html') && cleanPath !== '/404.html') {
             errors.push(`File: ${path.relative(rootDir, filePath)}\n  Link ends with .html instead of trailing slash: ${link}`);
        }

        // Also check if they are missing trailing slash on directories
        if (!cleanPath.endsWith('/') && !cleanPath.includes('.') && cleanPath !== '') {
            errors.push(`File: ${path.relative(rootDir, filePath)}\n  Missing trailing slash: ${link}`);
        }

        if (isInternalHash) {
            const hash = link.substring(1);
            if (hash !== '' && !ids.has(hash)) {
                errors.push(`File: ${path.relative(rootDir, filePath)}\n  Broken hash link: ${link}`);
            }
            continue;
        }

        // Check if local file exists
        let localTargetPath = resolveLocalPath(cleanPath);
        if (!fs.existsSync(localTargetPath)) {
            // Vercel can resolve /path/ to path.html
            if (cleanPath.endsWith('/')) {
                const altPath = resolveLocalPath(cleanPath.slice(0, -1) + '.html');
                if (!fs.existsSync(altPath)) {
                    errors.push(`File: ${path.relative(rootDir, filePath)}\n  Broken internal link: ${link} (maps to ${localTargetPath} or ${altPath})`);
                }
            } else {
                errors.push(`File: ${path.relative(rootDir, filePath)}\n  Broken internal link: ${link} (maps to ${localTargetPath})`);
            }
        }
        
        checkedCount++;
    }
}

console.log(`Checked ${checkedCount} internal links across ${allFiles.filter(f=>f.endsWith('.html')).length} HTML files.`);

if (errors.length > 0) {
    console.error("Link Checker found errors:");
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log("All internal links are valid.");
    process.exit(0);
}
