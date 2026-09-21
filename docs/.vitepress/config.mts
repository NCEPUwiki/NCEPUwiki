import type { MarkdownOptions } from 'vitepress'
import { fileURLToPath } from 'node:url'
import markmapPlugin from '@vitepress-plugin/markmap'
import { defineConfig } from 'vitepress'
import { collectAuthors } from './authors.ts'
import { cardlist } from './cardlist.ts'
import { buildTree, docsRoot, outputPath, scanArticles } from './catalog.ts'
import { writeSearchIndex } from './search-index.ts'

const articles = scanArticles()
function findArticle(relativePath: string) {
	return articles.find(item => item.source === relativePath || outputPath(item.url) === relativePath)
}
/** 某个分类下所有文章的路由，用来给「参与共建」这类导航项做高亮 */
function categoryMatch(...folders: string[]) {
	const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const paths = articles.filter(article => folders.includes(article.folders[0])).flatMap(article => [article.url.replace(/\/$/, ''), `/${article.source.replace(/\.md$/, '')}`]).map(escape)
	return `^(?:${paths.join('|')})/?$`
}
const rewrites = new Map(articles.map(article => [article.source, outputPath(article.url)]))
const sidebar = Object.fromEntries(articles.map(article => [article.url, [
	...buildTree(articles.filter(other => other.folders[0] === article.folders[0])),
]]))

/** 标题文字来自 frontmatter，转义行内语法，避免标题里的符号被当成 Markdown。 */
function escapeTitleText(title: string) {
	return title.replace(/[\\`*_[\]<>&]/g, '\\$1')
}

/** 把一级标题拼在正文最前面（frontmatter 若还在，则接在其后）。 */
function prependTitleHeading(source: string, title: string) {
	const heading = `# ${escapeTitleText(title)}\n\n`
	const frontmatter = source.match(/^(-{3,}\r?\n[\s\S]*?\r?\n-{3,}\r?\n?)/)
	return frontmatter ? frontmatter[1] + heading + source.slice(frontmatter[1].length) : heading + source
}

const markdownOptions: MarkdownOptions = {
	config: (md) => {
		cardlist(md)
		// 正文没有一级标题的文章，把 frontmatter 的 title 作为一级标题拼在正文最前面，
		// 交给 markdown-it 正常渲染，得到的标题、锚点与间距和作者手写的 `# 标题` 完全一致；
		// 正文里自己写了一级标题（#）的文章以作者写的为准，不再自动生成。
		// 卡片容器会用同一个 env 再解析一次内层 Markdown，这里只处理页面正文本身。
		md.core.ruler.before('block', 'article-title', (state) => {
			if (state.env.wikiTitleInserted)
				return
			const article = findArticle(state.env.relativePath)
			if (!article || article.hasHeading)
				return
			state.env.wikiTitleInserted = true
			state.src = prependTitleHeading(state.src, article.title)
		})
		const image = md.renderer.rules.image
		md.renderer.rules.image = (tokens, index, options, env, self) => {
			const rendered = image?.(tokens, index, options, env, self) ?? self.renderToken(tokens, index, options)
			const src = tokens[index].attrGet('src') || ''
			if (!src || src.startsWith('data:'))
				return rendered
			return `<a class="wiki-image-zoom" href="${md.utils.escapeHtml(src)}" target="_blank" rel="noopener" aria-label="查看原图">${rendered}</a>`
		}
		const headingOpen = md.renderer.rules.heading_open
		md.renderer.rules.heading_open = (tokens, index, options, env, self) => {
			const decoration = tokens[index].tag === 'h2' ? '<span class="heading-wordmark" aria-hidden="true"></span>' : ''
			return (headingOpen?.(tokens, index, options, env, self) ?? self.renderToken(tokens, index, options)) + decoration
		}
	},
	languageAlias: { gitignore: 'text' },
	math: true,
	container: { tipLabel: '提示', warningLabel: '注意', dangerLabel: '警告', infoLabel: '信息', detailsLabel: '详细信息' },
}

export default defineConfig({
	lang: 'zh-CN',
	title: 'NCEPUwiki',
	description: '华北电力大学学生共同维护的非官方校园知识库：新生入学、学习升学、校园生活与就业指南。',
	cleanUrls: true,
	lastUpdated: false,
	srcExclude: ['activity/**'],
	rewrites: source => rewrites.get(source) || source,
	head: [
		['link', { rel: 'stylesheet', href: 'https://s4.zstatic.net/npm/inter-ui@4.1.1/inter-variable.css' }],
		['link', { rel: 'stylesheet', href: 'https://s4.zstatic.net/npm/inter-ui@4.1.1/inter.css' }],
		['link', { 'rel': 'icon', 'type': 'image/svg+xml', 'href': '/favicon-light.svg', 'media': '(prefers-color-scheme: light)', 'data-wiki-icon': '' }],
		['link', { 'rel': 'icon', 'type': 'image/svg+xml', 'href': '/favicon-dark.svg', 'media': '(prefers-color-scheme: dark)', 'data-wiki-icon': '' }],
	],
	sitemap: { hostname: 'https://wiki.ncepuinfo.cc' },
	themeConfig: {
		nav: [
			{ text: '新生入学', link: '/categories/?category=新生入学' },
			{ text: '学习专题', link: '/categories/?category=学习专题' },
			{ text: '群汇总', link: '/categories/?category=群汇总' },
			{ text: '全部分类', link: '/categories/' },
			{ text: '参与共建', link: '/pages/BasicContribution/', activeMatch: categoryMatch('贡献与其他') },
		],
		sidebar,
		socialLinks: [{ icon: 'github', link: 'https://github.com/NCEPUwiki/NCEPUwiki' }],
		externalLinkIcon: true,
		langMenuLabel: '切换语言',
		sidebarMenuLabel: '分类文章',
		darkModeSwitchLabel: '主题',
		lightModeSwitchTitle: '切换到浅色模式',
		darkModeSwitchTitle: '切换到深色模式',
		returnToTopLabel: '返回顶部',
		outline: { level: [2, 3], label: '本页目录' },
		docFooter: { prev: '上一篇', next: '下一篇' },
		editLink: { pattern: 'https://github.com/NCEPUwiki/NCEPUwiki/blame/main/docs/:path', text: '源代码' },
		lastUpdated: { text: '最后更新于', formatOptions: { dateStyle: 'medium' } },
		footer: { message: '由华电学生共同维护的非官方校园知识库', copyright: `© 2025–${new Date().getFullYear()} NCEPUwiki-Group · MIT License` },
	},
	vite: {
		plugins: [markmapPlugin({ containerHeight: 500 })],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./', import.meta.url)),
				// 用自研整串搜索替换 VitePress 默认主题导航栏里的搜索组件
				'./VPNavBarSearch.vue': fileURLToPath(new URL('./theme/components/WikiSearch.vue', import.meta.url)),
			},
		},
	},
	markdown: markdownOptions,
	// 站点构建完成后，把渲染后的纯文本索引写入 dist/search-index.json，
	// WikiSearch.vue 打开搜索框时再按需 fetch。
	async buildEnd(siteConfig) {
		await writeSearchIndex({ articles, docsRoot, outDir: siteConfig.outDir, markdown: markdownOptions })
	},
	transformPageData(page) {
		const article = findArticle(page.relativePath)
		if (article) {
			page.title = article.title
			page.lastUpdated = article.lastUpdatedTime || undefined
			Object.assign(page.frontmatter, { title: article.title, categories: article.categories, tags: article.tags, empty: article.empty })
			// 页尾作者列表：frontmatter 与 Git 提交历史合并去重，构建期算好后随页面数据下发
			page.frontmatter.authors = collectAuthors(article.source, page.frontmatter.author, docsRoot)
		}
	},
})
