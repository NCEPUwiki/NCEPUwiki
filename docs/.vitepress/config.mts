import { fileURLToPath } from 'node:url'
import markmapPlugin from '@vitepress-plugin/markmap'
import { defineConfig } from 'vitepress'
import { cardlist } from './cardlist.ts'
import { buildTree, outputPath, scanArticles } from './catalog.ts'

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

export default defineConfig({
	lang: 'zh-CN',
	title: 'NCEPUwiki',
	description: '华北电力大学学生共同维护的非官方校园知识库：新生入学、学习升学、校园生活与就业指南。',
	cleanUrls: true,
	lastUpdated: true,
	rewrites: source => rewrites.get(source) || source,
	head: [
		['link', { 'rel': 'icon', 'type': 'image/svg+xml', 'href': '/favicon-light.svg', 'media': '(prefers-color-scheme: light)', 'data-wiki-icon': '' }],
		['link', { 'rel': 'icon', 'type': 'image/svg+xml', 'href': '/favicon-dark.svg', 'media': '(prefers-color-scheme: dark)', 'data-wiki-icon': '' }],
	],
	sitemap: { hostname: 'https://wiki.ncepuinfo.cc' },
	themeConfig: {
		nav: [
			{ text: '新生入学', link: '/topics/newcomers/', activeMatch: topicMatch('newcomers', '新生入学') },
			{ text: '学习专题', link: '/topics/study/', activeMatch: topicMatch('study', '学习专题') },
			{ text: '校园生活', activeMatch: topicMatch('life|groups|career', '校园生活', '群汇总', '就业'), items: [
				{ text: '校园生活', link: '/topics/life/', activeMatch: topicMatch('life', '校园生活') },
				{ text: '群汇总', link: '/topics/groups/', activeMatch: topicMatch('groups', '群汇总') },
				{ text: '就业', link: '/topics/career/', activeMatch: topicMatch('career', '就业') },
			] },
			{ component: 'DirectoryTrigger' },
			{ text: '探索', activeMatch: `${topicMatch('computing', '计算机知识专题')}|^/(categories|tags|archives)(/|$)`, items: [
				{ text: '文章分类', link: '/categories/' },
				{ text: '标签', link: '/tags/' },
				{ text: '最近更新', link: '/archives/' },
				{ text: '计算机知识专题', link: '/topics/computing/', activeMatch: topicMatch('computing', '计算机知识专题') },
			] },
			{ text: '参与共建', link: '/pages/BasicContribution/', activeMatch: topicMatch('contribute', '贡献与其他') },
		],
		sidebar,
		search: { provider: 'local', options: {
			async _render(source, env, md) {
				const article = articles.find(item => item.source === env.relativePath || outputPath(item.url) === env.relativePath)
				const html = await md.renderAsync(source, env)
				if (!article || article.hasHeading)
					return html
				return `<h1 id="article-title">${md.utils.escapeHtml(article.title)}</h1>\n${html}`
			},
			locales: { root: { translations: {
				button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
				modal: { displayDetails: '显示详情', resetButtonTitle: '清除搜索', backButtonTitle: '关闭搜索', noResultsText: '没有找到相关结果', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } },
			} } },
		} },
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
		editLink: { pattern: 'https://github.com/NCEPUwiki/NCEPUwiki/blame/main/docs/:path', text: '在 GitHub 上查看此页' },
		lastUpdated: { text: '最后更新于', formatOptions: { dateStyle: 'medium' } },
		footer: { message: '由华电学生共同维护的非官方校园知识库', copyright: `© 2025–${new Date().getFullYear()} NCEPUwiki-Group · MIT License` },
	},
	vite: { plugins: [markmapPlugin({ containerHeight: 500 })], resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } } },
	markdown: {
		config: md => cardlist(md),
		languageAlias: { gitignore: 'text' },
		math: true,
		container: { tipLabel: '提示', warningLabel: '注意', dangerLabel: '警告', infoLabel: '信息', detailsLabel: '详细信息' },
	},
	transformPageData(page) {
		const article = articles.find(item => item.source === page.relativePath || outputPath(item.url) === page.relativePath)
		if (article) {
			page.title = article.title
			page.lastUpdated = article.updatedTime || undefined
			Object.assign(page.frontmatter, { title: article.title, categories: article.categories, tags: article.tags, articleHeader: !article.hasHeading, empty: article.empty })
		}
	},
})
