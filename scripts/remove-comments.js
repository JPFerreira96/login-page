const fs = require('fs');
const path = require('path');

const allowedExtensions = new Set(['.ts', '.html', '.scss', '.css', '.js', '.json']);
const skipDirs = new Set(['node_modules', 'dist', '.git', '.angular', '.vscode']);

function stripLineComments(content) {
  return content
    
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*(?=$|\r?\n)/gm, (_, prefix) => prefix);
}

function stripHtmlComments(content) {
  return content.replace(/<!--([\s\S]*?)-->/g, '');
}

function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExtensions.has(ext)) return;

  const original = fs.readFileSync(filePath, 'utf8');
  let cleaned = original;

  switch (ext) {
    case '.ts':
    case '.js':
      cleaned = stripLineComments(cleaned);
      break;
    case '.scss':
    case '.css':
      cleaned = stripLineComments(cleaned);
      break;
    case '.html':
      cleaned = stripHtmlComments(cleaned);
      break;
    case '.json':
      
      cleaned = cleaned.replace(/(^|\s)\/\/.*(?=$|\r?\n)/gm, '');
      cleaned = cleaned.replace(/(^|\s)\/\/.*(?=$|\r?\n)/gm, '');
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
      break;
      break;
  }

  if (cleaned !== original) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`Strip comments: ${path.relative(process.cwd(), filePath)}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      processFile(fullPath);
    }
  }
}

walk(path.resolve(__dirname, '..'));
