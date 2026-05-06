# Git 使用指南

## 目录
- [Git 基础概念](#git-基础概念)
- [初始配置](#初始配置)
- [常用命令](#常用命令)
- [工作流程](#工作流程)
- [分支管理](#分支管理)
- [远程仓库](#远程仓库)
- [常见问题](#常见问题)

---

## Git 基础概念

### 什么是 Git？
Git 是一个分布式版本控制系统，用于跟踪代码变更、协作开发和项目管理。

### 核心概念
- **Repository (仓库)**: 存储项目文件和历史记录的地方
- **Commit (提交)**: 保存当前更改的快照
- **Branch (分支)**: 独立的开发线路
- **Merge (合并)**: 将不同分支的更改结合在一起
- **Remote (远程)**: 存储在服务器上的仓库副本（如 GitHub、GitLab）

---

## 初始配置

### 首次使用 Git 需要配置用户信息

```bash
# 设置用户名
git config --global user.name "Your Name"

# 设置邮箱
git config --global user.email "your.email@example.com"

# 查看配置
git config --list
```

### 初始化新仓库

```bash
# 进入项目目录
cd c:\Users\Origin\Desktop\about

# 初始化 Git 仓库
git init
```

---

## 常用命令

### 查看状态

```bash
# 查看文件状态
git status

# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看差异
git diff
```

### 添加文件

```bash
# 添加单个文件
git add filename.html

# 添加所有更改的文件
git add .

# 添加特定类型的文件
git add *.css
```

### 提交更改

```bash
# 提交更改并添加消息
git commit -m "描述你的更改"

# 示例
git commit -m "Update to production-ready Tailwind CSS setup"
git commit -m "Fix: Update CSS path and add Netlify configuration"
```

### 撤销操作

```bash
# 撤销工作区的更改（未 add）
git checkout -- filename

# 取消暂存（已 add 但未 commit）
git reset HEAD filename

# 修改最后一次提交
git commit --amend -m "新的提交消息"
```

---

## 工作流程

### 标准工作流程

```
1. 修改文件 → 2. git add → 3. git commit → 4. git push
```

### 详细步骤

```bash
# 1. 查看哪些文件被修改
git status

# 2. 添加要提交的文件
git add .

# 3. 提交更改
git commit -m "描述本次更改的内容"

# 4. 推送到远程仓库
git push origin main
```

### 提交消息规范

好的提交消息应该清晰描述更改内容：

```bash
# 格式：<类型>: <简短描述>

# 示例
git commit -m "feat: Add Netlify deployment configuration"
git commit -m "fix: Correct CSS file path for production"
git commit -m "docs: Update README with deployment instructions"
git commit -m "style: Format code according to style guide"
git commit -m "refactor: Simplify Tailwind CSS configuration"
```

**常用类型：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构代码
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具变动

---

## 分支管理

### 创建和管理分支

```bash
# 查看所有分支
git branch

# 创建新分支
git branch feature-name

# 切换分支
git checkout feature-name

# 创建并切换到新分支
git checkout -b feature-name

# 删除分支
git branch -d feature-name
```

### 合并分支

```bash
# 切换到主分支
git checkout main

# 合并特性分支
git merge feature-name

# 如果有冲突，解决后提交
git add .
git commit -m "Resolve merge conflicts"
```

### 常用分支策略

```
main (或 master)    - 生产环境代码
develop             - 开发环境代码
feature/*           - 新功能分支
bugfix/*            - bug 修复分支
```

---

## 远程仓库

### 连接远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/username/repository.git

# 查看远程仓库
git remote -v

# 移除远程仓库
git remote remove origin
```

### 推送和拉取

```bash
# 推送到远程仓库
git push origin main

# 首次推送（设置上游分支）
git push -u origin main

# 从远程仓库拉取最新更改
git pull origin main

# 仅获取不合并
git fetch origin
```

### 克隆仓库

```bash
# 克隆远程仓库
git clone https://github.com/username/repository.git

# 克隆到指定目录
git clone https://github.com/username/repository.git my-project
```

---

## 针对本项目的 Git 操作

### 项目当前状态

您的项目 `yj-portfolio` 已经配置好，可以开始使用 Git。

### 快速开始

```bash
# 1. 进入项目目录
cd c:\Users\Origin\Desktop\about

# 2. 初始化 Git（如果还未初始化）
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "Initial commit: Portfolio website with Tailwind CSS"

# 5. 在 GitHub/GitLab 创建新仓库

# 6. 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/yourusername/yj-portfolio.git

# 7. 推送
git push -u origin main
```

### 日常开发流程

```bash
# 每次修改后的标准流程
git status              # 查看更改
git add .               # 添加所有更改
git commit -m "描述更改" # 提交
git push                # 推送到远程
```

### 部署到 Netlify

Netlify 会自动从 Git 仓库拉取代码并部署：

1. 推送代码到 GitHub/GitLab
2. Netlify 检测到新提交
3. 自动执行 `npm install && npm run build`
4. 部署 `dist/` 目录

---

## 常见问题

### Q1: 如何忽略某些文件？

创建 `.gitignore` 文件，添加要忽略的文件或目录：

```
node_modules/
dist/
.DS_Store
*.log
.env
```

### Q2: 提交后发现漏了文件怎么办？

```bash
# 添加遗漏的文件
git add forgotten-file.js

# 修改最后一次提交
git commit --amend --no-edit
```

### Q3: 如何查看某次提交的详细内容？

```bash
# 查看特定提交的详情
git show <commit-hash>

# 查看某个文件的修改历史
git log --follow filename.html
```

### Q4: 如何处理合并冲突？

```bash
# 1. 查看冲突文件
git status

# 2. 手动编辑冲突文件，解决冲突标记（<<<<<<<, =======, >>>>>>>）

# 3. 标记为已解决
git add resolved-file.html

# 4. 完成合并
git commit -m "Resolve merge conflicts"
```

### Q5: 如何回退到之前的版本？

```bash
# 查看提交历史
git log --oneline

# 回退到特定提交（保留更改在工作区）
git reset <commit-hash>

# 完全回退（丢弃更改）
git reset --hard <commit-hash>

# ⚠️ 警告：--hard 会永久删除更改，谨慎使用！
```

### Q6: 如何撤销已经 push 的提交？

```bash
# 创建一个新的提交来撤销之前的更改（推荐）
git revert <commit-hash>
git push

# 或者强制推送（仅在你确定其他人没有基于此工作时使用）
git reset --hard <previous-commit>
git push --force
```

---

## Git 最佳实践

### ✅ 推荐做法

1. **频繁提交**: 小的、专注的提交更容易理解和回退
2. **清晰的提交消息**: 描述"为什么"而不是"做了什么"
3. **使用分支**: 为每个新功能或修复创建独立分支
4. **定期推送**: 避免本地积累太多未推送的更改
5. **同步远程**: 经常 `git pull` 保持与远程同步
6. **审查更改**: 提交前用 `git diff` 检查更改

### ❌ 避免的做法

1. 不要提交敏感信息（密码、API 密钥）
2. 不要提交大型二进制文件
3. 不要在主分支上直接进行重大更改
4. 不要使用模糊的提交消息（如 "update", "fix"）
5. 不要强制推送到共享分支

---

## 有用资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 学习实验室](https://lab.github.com/)
- [Git 可视化学习工具](https://learngitbranching.js.org/)
- [Pro Git 书籍（免费）](https://git-scm.com/book/zh/v2)

---

## 快速参考卡片

```bash
# 基本工作流
git status                    # 查看状态
git add .                     # 添加所有更改
git commit -m "消息"          # 提交
git push                      # 推送

# 分支操作
git branch                    # 查看分支
git checkout -b new-feature   # 创建并切换分支
git merge new-feature         # 合并分支

# 同步操作
git pull                      # 拉取并合并
git fetch                     # 仅获取
git push -u origin main       # 首次推送

# 查看历史
git log --oneline             # 简洁历史
git diff                      # 查看差异
git show <hash>               # 查看提交详情
```

---

**提示**: 遇到问题时，随时使用 `git status` 了解当前状态，这是最有用的命令！
