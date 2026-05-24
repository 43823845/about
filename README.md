# 杨杰作品集

这是一个用于公开展示的个人作品集与求职主页，聚焦以下方向：

- 硬件研发
- 嵌入式系统
- PCB 设计与仿真
- 工业控制与物联网
- 高可靠产品交付

## 本地开发

```bash
npm install
npm run build
```

构建完成后，产物会输出到 `dist/`。

## Vercel 部署

项目已包含 `vercel.json`，默认使用以下配置：

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

推送到 GitHub 后，Vercel 可自动拉取最新代码并重新部署。

## 项目结构

```text
.
├── build.js
├── img/
├── index.html
├── input.css
├── output.css
├── package.json
├── tailwind.config.js
├── vercel.json
└── dist/
```

## 说明

`output.css` 已纳入仓库，用于保证静态托管和公开展示环境可以直接加载样式。
