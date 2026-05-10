# Vercel 部署指南

## 快速部署

### 1. 推送到 GitHub

```bash
git add .
git commit -m "Update build configuration for Vercel deployment"
git push
```

### 2. 在 Vercel 上导入项目

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 选择您的 GitHub 仓库
4. Vercel 会自动检测到 `vercel.json` 配置文件

### 3. 部署配置

Vercel 会自动读取 `vercel.json` 中的配置：

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

无需手动配置，直接点击 "Deploy" 即可。

## 构建流程

部署时，Vercel 会执行以下步骤：

1. **安装依赖**: `npm install`
2. **构建 CSS**: `tailwindcss -i ./input.css -o ./dist/output.css --minify`
3. **复制文件**: 
   - 复制 `index.html` 到 `dist/`
   - 复制 `img/` 目录到 `dist/img/`

## 项目结构

```
about/
├── dist/              # 构建输出目录（自动创建）
│   ├── index.html     # 主页面
│   ├── output.css     # 编译后的 CSS
│   └── img/           # 图片资源
├── src/
│   └── input.css      # Tailwind CSS 输入
├── index.html         # 源 HTML 文件
├── img/               # 源图片目录
├── build.js           # 构建脚本
├── vercel.json        # Vercel 配置
├── tailwind.config.js # Tailwind 配置
└── package.json       # 项目配置
```

## 本地测试

在部署前，您可以在本地测试构建：

```bash
# 清理并重新构建
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run build

# 查看 dist 目录内容
ls dist
```

## 常见问题

### Q: 部署后样式未加载？

**解决方案：**
1. 检查浏览器控制台是否有 404 错误
2. 确认 `output.css` 文件存在于 `dist/` 目录
3. 检查 `index.html` 中的 CSS 引用路径是否正确

### Q: 图片未显示？

**解决方案：**
1. 确认 `img/` 目录已正确复制到 `dist/img/`
2. 检查 HTML 中的图片路径是否使用相对路径
3. 验证图片文件格式和大小

### Q: 构建失败？

**解决方案：**
1. 检查 Vercel 部署日志中的错误信息
2. 确认 `package.json` 中的依赖正确
3. 验证 `tailwind.config.js` 配置

## 环境变量（如需要）

如果项目需要环境变量：

1. 在 Vercel 仪表板中进入项目设置
2. 导航到 "Environment Variables"
3. 添加所需的环境变量
4. 重新部署项目

## 自定义域名

1. 在 Vercel 仪表板中进入 "Domains" 设置
2. 添加您的自定义域名
3. 按照 DNS 配置指南更新记录
4. 等待 DNS 传播（通常几分钟到几小时）

## 持续部署

配置完成后，每次推送到主分支时：
- Vercel 会自动检测新提交
- 自动触发构建和部署
- 生成预览 URL 供测试

## 优化建议

### 1. 图片优化
- 使用 WebP 格式以减少文件大小
- 压缩图片以提高加载速度
- 考虑使用 CDN 服务

### 2. CSS 优化
- Tailwind CSS 已配置为只包含使用的类
- 生产环境已启用压缩（--minify）

### 3. 缓存策略
Vercel 自动提供：
- CDN 全球加速
- 智能缓存
- HTTP/2 支持

## 监控和分析

Vercel 提供：
- 实时部署日志
- 性能分析
- 访问统计
- 错误追踪

访问 Vercel 仪表板查看详细数据。

---

**提示**: 如果遇到任何问题，请检查 Vercel 部署日志获取详细错误信息。
