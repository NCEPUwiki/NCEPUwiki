import type { MarkdownOptions } from 'vitepress'
import { fileURLToPath } from 'node:url'
import markmapPlugin from '@vitepress-plugin/markmap'
import { defineConfig } from 'vitepress'
import { cardlist } from './cardlist.ts'
import { buildTree, docsRoot, outputPath, scanArticles } from './catalog.ts'
import { writeSearchIndex } from './search-index.ts'

const articles = scanArticles()
function topicMatch(slug: string, ...folders: string[]) {
	const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const paths = articles.filter(article => folders.includes(article.folders[0])).flatMap(article => [article.url.replace(/\/$/, ''), `/${article.source.replace(/\.md$/, '')}`]).map(escape)
	return `^(?:/topics/(?:${slug})|${paths.join('|')})/?$`
}
const rewrites = new Map(articles.map(article => [article.source, outputPath(article.url)]))
const sidebar = Object.fromEntries(articles.map(article => [article.url, [
	...buildTree(articles.filter(other => other.folders[0] === article.folders[0])),
]]))

const markdownOptions: MarkdownOptions = {
	config: (md) => {
		cardlist(md)
		// 无 Markdown 一级标题的文章，正文渲染时不包含标题文本。
		// 这里插入一个隐藏 h1，保证搜索索引能拿到标题，也让标题可被整串匹配。
		md.core.ruler.push('article-search-title', (state) => {
			const article = articles.find(item => item.source === state.env.relativePath || outputPath(item.url) === state.env.relativePath)
			if (!article || article.hasHeading)
				return
			const heading = new state.Token('html_block', '', 0)
			heading.content = `<h1 hidden aria-hidden="true">${md.utils.escapeHtml(article.title)}<a class="header-anchor" href="#article-title" aria-hidden="true"></a></h1>\n`
			state.tokens.unshift(heading)
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
	lastUpdated: true,
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
			{ text: '新生入学', link: '/topics/newcomers/', activeMatch: topicMatch('newcomers', '新生入学') },
			{ text: '学习专题', link: '/topics/study/', activeMatch: topicMatch('study', '学习专题') },
			{ text: '群汇总', link: '/topics/groups/', activeMatch: topicMatch('groups', '群汇总') },
			{ text: '全部目录', link: '/categories/' },
			{ text: '参与共建', link: '/pages/BasicContribution/', activeMatch: topicMatch('contribute', '贡献与其他') },
		],
		sidebar,
		socialLinks: [{ icon: 'github', link: 'https://github.com/NCEPUwiki/NCEPUwiki' }],
		externalLinkIcon: true,
		langMenuLabel: '切换语言',
		sidebarMenuLabel: '专题目录',
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
		const article = articles.find(item => item.source === page.relativePath || outputPath(item.url) === page.relativePath)
		if (article) {
			page.title = article.title
			page.lastUpdated = article.updatedTime || undefined
			Object.assign(page.frontmatter, { title: article.title, breadcrumbs: article.folders, categories: article.categories, tags: article.tags, articleHeader: !article.hasHeading, empty: article.empty })
		}
	},
})
