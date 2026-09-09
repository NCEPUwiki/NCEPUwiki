## 欢迎访问 NCEPUwiki

NCEPUwiki 是由华北电力大学学生共同维护的**非官方**校园知识库，旨在提供：

- 高质量、结构化的信息资源
- 实用的升学/学习经验分享
- 持续更新的学习资料

## 反馈与共建

长期更新计划：

- 各专业[学习资料](/categories/?category=学习资料)，提供请注明校区、院系、专业、课程名。
- 各个课程的[评价](/pages/CourseEvaluation)，问卷<https://www.wjx.cn/vm/myKSytv.aspx#>
- [内推码](/pages/EmployeeRefer/)

更新计划：

- 计算机知识
- 专业指南
- 竞赛

如果你发现内容需要补充、修正，欢迎通过以下方式参与共建：

- 提交 [Issue](https://github.com/NCEPUwiki/NCEPUwiki/issues) 或者 [pull request](https://github.com/NCEPUwiki/NCEPUwiki/pulls)
- 加入交流 QQ 群 417695180
- 或发邮件至 `1361942776@qq.com`

## 本地开发与构建

使用 Node.js 22.19+、24.11+ 或 26+，以及 packageManager 固定的 pnpm 11.24.0。无需 Corepack，尚未安装 pnpm 时先执行下面的 npm 安装命令：

```bash
npm install --global pnpm@11.24.0
pnpm install --frozen-lockfile
pnpm dev
```

```bash
pnpm check       # TypeScript、ESLint（含 CSS） 和内容索引测试
pnpm build    # 生产构建，检查 Markdown 内部链接
pnpm preview  # 预览生产产物
```

产物位于 `docs/.vitepress/dist/`。GitHub Actions 使用锁文件安装依赖，构建后发布到 GitHub Pages；域名由 `docs/public/CNAME` 保留。

依赖版本直接维护在 `package.json`；`pnpm-workspace.yaml` 只保留安装脚本白名单等 pnpm 设置。提交 `pnpm-lock.yaml` 保证 CI 安装一致。样式检查参考 [homepage-v5](https://github.com/L33Z22L11/homepage-v5)，由 `@zinkawaii/eslint-config-css` 接入 ESLint 统一处理。`pnpm lint:fix` 可自动修复格式问题。TypeScript 严格检查主题和索引代码；历史 Markdown 示例不参与 ESLint，由生产构建校验。

CSS 按 tokens、base、home、article 分层组织，使用原生自定义属性、逻辑属性和 `color-mix()`；键盘焦点及减少动画偏好在通用样式中统一处理。`.editorconfig` 和 `.gitattributes` 统一 UTF-8 / LF，代码使用 Tab，Markdown / JSON / YAML 使用空格缩进。

## 内容结构与迁移约定

- `docs/.vitepress/config.mts`：中文导航、本地全文搜索、数学公式、blame 查看链接、站点地图。
- `docs/.vitepress/catalog.ts`：扫描编号目录，生成专题侧栏、分类、标签和归档数据。
- `docs/.vitepress/theme/`：首页、文章索引和 Vue 3 组件。
- `docs/public/`：静态资源，目前图片资源已经全部存在Cloudflare R2，上传访问<uploader.ncepuinfo.cc>。
- `docs/01.新生入学/` 等编号目录：保留原有文章层级，目录展示时去掉数字前缀。

表格可以包裹在 `::: cardlist` 容器内，在构建时转为卡片。表头作为字段名，空字段不显示，正文仍为 Markdown 并可被搜索索引。二维码/联系图片使用 vue-tippy 悬浮展示，支持键盘聚焦和触屏点击；微信二维码不提供普通网页跳转。群号后可加 `<CopyContact value="群号" />`。维护表格时请保证各行列数相同。

`DownloadPageImage` 使用按需加载的 modern-screenshot，提供页面长图、分享卡片、预览、PNG 下载和浏览器打印。导出在独立容器中等待字体/图片完成，附上站点标题、分享语、正式网址和 uqr 页面二维码；全文导出会将悬浮二维码还原为内联二维码。远程头像不能嵌入时回退本地图标；iframe 用原文入口代替，跨域资源和超长页面可用分享卡片或打印。favicon 提供深浅 SVG，支持系统及站内主题。

感谢所有[贡献者](https://github.com/NCEPUwiki/NCEPUwiki/graphs/contributors)参与维护。

[![贡献者](https://contrib.rocks/image?repo=NCEPUwiki/NCEPUwiki)](https://github.com/NCEPUwiki/NCEPUwiki/graphs/contributors)
