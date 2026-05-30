const fs = require('fs');
const path = require('path');

/** 确保目录存在 */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/** 递归克隆目录 */
const copyDir = (src, dest) => {
  ensureDir(dest);
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

console.log('🚀 开始项目构建与打包...');
ensureDir('dist');

// 需要复制的单文件
const filesToCopy = ['index.html', 'manifest.json', 'output.css'];
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
    console.log(`✓ 已成功拷贝文件 ${file} 至 dist/`);
  } else {
    console.log(`⚠️  警告: 未找到 ${file} 文件，跳过。`);
  }
});

// 需要深度复制的子目录
const dirsToCopy = ['src', 'img'];
dirsToCopy.forEach(dir => {
  if (fs.existsSync(dir)) {
    copyDir(dir, path.join('dist', dir));
    console.log(`✓ 已成功深度拷贝子目录 ${dir}/ 至 dist/${dir}/`);
  } else {
    console.log(`⚠️  警告: 未找到 ${dir}/ 目录，跳过。`);
  }
});

console.log('🎉 项目打包成功！所有静态资源均已收敛至 dist/ 目录。');
