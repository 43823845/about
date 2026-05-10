const fs = require('fs');
const path = require('path');

// 确保 dist 目录存在
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// 复制 index.html
fs.copyFileSync('index.html', path.join('dist', 'index.html'));
console.log('✓ Copied index.html to dist/');

// 复制 img 目录（如果存在）
if (fs.existsSync('img')) {
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir('img', path.join('dist', 'img'));
  console.log('✓ Copied img/ to dist/img/');
}

console.log('✓ Build completed successfully!');
