import fs from 'fs';
import path from 'path';

const isCheckMode = process.argv.includes('--check');
const rootDir = process.cwd();

const partials = {
    'HEAD-COMMON': fs.readFileSync(path.join(rootDir, 'partials', 'head-common.html'), 'utf8'),
    'HEADER': fs.readFileSync(path.join(rootDir, 'partials', 'header.html'), 'utf8'),
    'FOOTER': fs.readFileSync(path.join(rootDir, 'partials', 'footer.html'), 'utf8')
};

let outOfSyncFiles = [];

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
    let originalContent = content;

    for (const [key, partialContent] of Object.entries(partials)) {
        const startMarker = `<!-- ${key}:START -->`;
        const endMarker = `<!-- ${key}:END -->`;
        
        const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'gi');
        
        // Replace it
        content = content.replace(regex, `${startMarker}\n${partialContent}\n  ${endMarker}`);
    }

    if (content !== originalContent) {
        if (isCheckMode) {
            outOfSyncFiles.push(filePath);
        } else {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Synced: ${path.relative(rootDir, filePath)}`);
        }
    }
}

walk(rootDir);

if (isCheckMode) {
    if (outOfSyncFiles.length > 0) {
        console.error('ERROR: The following files are out of sync with shared partials:');
        outOfSyncFiles.forEach(f => console.error(` - ${path.relative(rootDir, f)}`));
        console.error('Run "node scripts/sync-shared.mjs" to fix them.');
        process.exit(1);
    } else {
        console.log('All files are in sync.');
        process.exit(0);
    }
} else {
    console.log('Sync complete.');
}
