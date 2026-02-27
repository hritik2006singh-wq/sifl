const fs = require('fs');
const path = require('path');

const directories = [
    path.join(__dirname, 'app'),
    path.join(__dirname, 'components')
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Buttons sizes
    content = content.replace(/(?<!(?:w-full\s+))px-6 py-3/g, 'w-full md:w-auto px-6 py-3');
    content = content.replace(/(?<!(?:w-full\s+))px-8 py-4/g, 'w-full md:w-auto px-8 py-4');

    // Also there is "px-10 py-4" on the homepage buttons.
    content = content.replace(/(?<!(?:w-full\s+))px-10 py-4/g, 'w-full md:w-auto px-10 py-4');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated buttons in ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

directories.forEach(dir => {
    if (fs.existsSync(dir)) walkDir(dir);
});

console.log("Button css rules applied.");
