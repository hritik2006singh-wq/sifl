const fs = require('fs');
const path = require('path');

const directories = [
    path.join(__dirname, 'app'),
    path.join(__dirname, 'components')
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Horizontal flex replacements
    // Wait, the user said "Replace any horizontal flex layout like: flex justify-between items-center With: flex flex-col md:flex-row". 
    // Let's replace "flex justify-between items-center" -> "flex flex-col md:flex-row justify-between items-center" 
    // OR "flex items-center justify-between" -> "flex flex-col md:flex-row items-center justify-between"
    content = content.replace(/flex\s+justify-between\s+items-center/g, 'flex flex-col md:flex-row justify-between items-center');
    content = content.replace(/flex\s+items-center\s+justify-between/g, 'flex flex-col md:flex-row items-center justify-between');

    // But we MUST NOT ruin the Navbar if it's already there. 
    // For Navbar specifically, it was:
    // "flex items-center justify-between\n        px-6 py-4"
    // Let's do the exact Navbar replacement first:
    // Since it's in components/Navbar.tsx
    if (filePath.endsWith('Navbar.tsx')) {
        content = content.replace(/px-6 py-4/, 'px-4 md:px-8 py-4');
    }

    // Grid replaces
    // Note: we only replace if it's NOT already preceded by md:, lg:, sm:
    content = content.replace(/(?<!(?:md|lg|sm|xl):)grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');
    content = content.replace(/(?<!(?:md|lg|sm|xl):)grid-cols-3/g, 'grid-cols-1 md:grid-cols-3');
    content = content.replace(/(?<!(?:md|lg|sm|xl):)grid-cols-4/g, 'grid-cols-1 md:grid-cols-4');

    // "grid grid-cols-1 md:grid-cols-1 md:grid-cols-2" fix if any double-ups happen
    content = content.replace(/grid-cols-1 md:grid-cols-1 md:grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');
    content = content.replace(/grid-cols-1 md:grid-cols-1 md:grid-cols-3/g, 'grid-cols-1 md:grid-cols-3');
    content = content.replace(/grid-cols-1 md:grid-cols-1 md:grid-cols-4/g, 'grid-cols-1 md:grid-cols-4');

    // Widths
    content = content.replace(/(?<!(?:md|lg|sm|xl):)w-24/g, 'w-full md:w-24');
    content = content.replace(/(?<!(?:md|lg|sm|xl):)w-1\/2/g, 'w-full md:w-1/2');
    // min-w-[800px] was already handled in why-sifl/page.tsx, but globally:
    content = content.replace(/min-w-\[800px\]/g, 'w-full md:w-auto');

    // Padding & Spacing
    content = content.replace(/(?<!(?:md|lg|sm|xl):)px-10/g, 'px-4 md:px-10');
    content = content.replace(/(?<!(?:md|lg|sm|xl):)gap-12/g, 'gap-6 md:gap-12');
    content = content.replace(/(?<!(?:md|lg|sm|xl):)max-w-5xl/g, 'max-w-full md:max-w-5xl');

    // Remove horizontal scroll
    content = content.replace(/overflow-x-auto/g, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

directories.forEach(dir => {
    if (fs.existsSync(dir)) walkDir(dir);
});

console.log("Responsive CSS rules applied.");
