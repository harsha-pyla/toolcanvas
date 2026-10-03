import fs from 'fs';
import path from 'path';

const root = 'c:/Users/harsh/OneDrive/Desktop/experiment';
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const headerMatch = indexHtml.match(/(<header class="site-header">[\s\S]*?<\/header>)/i);
const footerMatch = indexHtml.match(/(<footer class="site-footer">[\s\S]*?<\/footer>)/i);

// common head (exclude title, meta description, robots, canonical, og:*)
const commonHeadContent = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://toolcanvas.online/css/style.css">
  <link rel="icon" type="image/png" href="https://toolcanvas.online/logo/logo.png">
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-QGKGRK5NFL"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QGKGRK5NFL');</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7620625712605338" crossorigin="anonymous"></script>`;

const headerContent = headerMatch[1];
const footerContent = footerMatch[1];

fs.writeFileSync(path.join(root, 'partials', 'header.html'), headerContent, 'utf8');
fs.writeFileSync(path.join(root, 'partials', 'footer.html'), footerContent, 'utf8');
fs.writeFileSync(path.join(root, 'partials', 'head-common.html'), commonHeadContent, 'utf8');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === '.git' || file === 'node_modules' || file === '.agents' || file === 'scripts' || file === 'partials') continue;
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

    // Remove existing markers if any
    content = content.replace(/<!-- HEADER:START -->\n?/g, '').replace(/\n?<!-- HEADER:END -->/g, '');
    content = content.replace(/<!-- FOOTER:START -->\n?/g, '').replace(/\n?<!-- FOOTER:END -->/g, '');
    content = content.replace(/<!-- HEAD-COMMON:START -->\n?/g, '').replace(/\n?<!-- HEAD-COMMON:END -->/g, '');

    // Wrap header
    content = content.replace(/(<header class="site-header">[\s\S]*?<\/header>)/i, `<!-- HEADER:START -->\n$1\n<!-- HEADER:END -->`);
    
    // Wrap footer
    content = content.replace(/(<footer class="site-footer">[\s\S]*?<\/footer>)/i, `<!-- FOOTER:START -->\n$1\n<!-- FOOTER:END -->`);
    
    // For head common, since they might be slightly out of order or vary across files, 
    // the safest way is to find the end of <head>, insert the marker block there, and strip the individual tags from the rest of the head.
    // Let's strip known common elements
    const strips = [
        /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/gi,
        /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>/gi,
        /<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"[^>]*>/gi,
        /<link rel="stylesheet" href="[^"]*style\.css">/gi,
        /<link rel="icon"[^>]*>/gi,
        /<script src="https:\/\/unpkg\.com\/lucide[^"]*"><\/script>/gi,
        /<script async src="https:\/\/www\.googletagmanager\.com[^"]*"><\/script>/gi,
        /<script>window\.dataLayer[\s\S]*?<\/script>/gi,
        /<script async src="https:\/\/pagead2\.googlesyndication\.com[\s\S]*?<\/script>/gi
    ];
    
    let headMatch = content.match(/<head>([\s\S]*?)<\/head>/i);
    if (headMatch) {
        let newHead = headMatch[1];
        for (let regex of strips) {
            newHead = newHead.replace(regex, '');
        }
        // remove multiple blank lines
        newHead = newHead.replace(/\n\s*\n/g, '\n');
        
        // append common head block
        newHead += `\n  <!-- HEAD-COMMON:START -->\n${commonHeadContent}\n  <!-- HEAD-COMMON:END -->\n`;
        
        content = content.replace(/<head>[\s\S]*?<\/head>/i, `<head>${newHead}</head>`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

walk(root);
console.log("Bootstrap done.");
