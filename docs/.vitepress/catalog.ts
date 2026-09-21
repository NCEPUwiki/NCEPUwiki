import type { Article, Catalog, DirectoryItem, TaxonomyCount } from './types.ts'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { frontmatterAuthors } from './authors.ts'
import { categoryPaths, collectCategories } from './category.ts'

export const docsRoot = fileURLToPath(new URL('../', import.meta.url))
const label = (name: string) => name.replace(/^\d+\./, '').replace(/\.md$/, '')
function strings(value: unknown): string[] {
	const values: unknown[] = Array.isArray(value) ? value : [value]
	return [...new Set(values.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean))]
}

/**
 * 正文是否自带一级标题。
 *
 * 正文没有一级标题时，页面会用 frontmatter 的 title 自动生成一级标题；
 * 一旦作者自己写了一级标题（ATX `# 标题` 或 Setext `标题\n====`），
 * 就以作者写的为准，不再自动生成。
 *
 * 代码块里的 `#` 和 `:::markmap` 脑图内容都不算标题。
 */
function hasTitleHeading(content: string): boolean {
	let fence = ''
	let previous = ''
	for (const line of content.replace(/^:::markmap[^\S\n]*\n[\s\S]*?^:::[^\S\n]*$/gm, '').split('\n')) {
		const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1]
		if (marker) {
			if (!fence)
				fence = marker
			else if (marker[0] === fence[0] && marker.length >= fence.length)
				fence = ''
			previous = ''
			continue
		}
		if (!fence) {
			// ATX 一级标题：# 标题
			if (/^ {0,3}#\s+/.test(line))
				return true
			// Setext 一级标题：标题换行后跟一行等号
			if (/^ {0,3}=+\s*$/.test(line) && previous.trim() && !/^ {0,3}(?:#{1,6}\s|>|[-+*]\s|\d+[.)]\s|\||:::)/.test(previous))
				return true
		}
		previous = line
	}
	return false
}

export function scanArticles(root = docsRoot) {
	const articles: Article[] = []
	function visit(dir: string) {
		for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))) {
			if (entry.name.startsWith('.') || entry.name.startsWith('@') || entry.name === 'public')
				continue
			const file = join(dir, entry.name)
			if (entry.isDirectory()) {
				visit(file)
				continue
			}
			if (!entry.name.endsWith('.md'))
				continue
			const source = relative(root, file).replaceAll('\\', '/')
			if (!/^\d+\./.test(source))
				continue
			const { data: fm, content } = matter(readFileSync(file, 'utf8'))
			if (fm.article === false)
				continue
			const lastUpdated = fm.lastUpdated ? new Date(fm.lastUpdated).toISOString().slice(0, 10) : ''
			const folders = source.split('/').slice(0, -1).map(label)
			const url = fm.permalink || `/${source.replace(/\.md$/, '')}`
			if (!url.startsWith('/') || /[?#]|\.\./.test(url))
				throw new Error(`无效 permalink: ${source}`)
			articles.push({
				source,
				url,
				title: fm.title || label(entry.name),
				folders,
				// 分类只看 frontmatter 的 categories（缩进表示层级），与文章所在目录无关；
				// 写了上级又写了更深的子分类时两条都算，文章会同时出现在两个分类里。
				categories: categoryPaths(fm.categories),
				tags: strings(fm.tags),
				date: fm.date ? new Date(fm.date).toISOString().slice(0, 10) : '',
				// 卡片只显示 frontmatter 声明的名字，多个作者用「、」连接；没声明时回退组织账号
				author: frontmatterAuthors(fm.author).map(author => author.name).join('、') || 'NCEPUwiki-Group',
				lastUpdated,
				lastUpdatedTime: lastUpdated ? Date.parse(lastUpdated) : 0,
				hasHeading: hasTitleHeading(content),
				empty: !content.trim(),
			})
		}
	}
	visit(root)
	const urls = new Set<string>()
	for (const article of articles) {
		const key = article.url.replace(/\/$/, '').toLowerCase()
		if (urls.has(key))
			throw new Error(`重复 permalink: ${article.url}`)
		urls.add(key)
	}
	return articles
}

export function outputPath(url: string) {
	return url.slice(1) + (url.endsWith('/') ? 'index.md' : '.md')
}

export function buildTree(articles: Article[], depth = 0): DirectoryItem[] {
	const items: DirectoryItem[] = []
	const groups = new Map<string, Article[]>()
	for (const article of articles) {
		const folder = article.folders[depth]
		if (!folder) {
			items.push({ text: article.title, link: article.url })
			continue
		}
		if (!groups.has(folder)) {
			groups.set(folder, [])
			items.push({ text: folder, collapsed: depth > 0, items: [] })
		}
		groups.get(folder)!.push(article)
	}
	for (const item of items) {
		if (!item.link)
			item.items = buildTree(groups.get(item.text)!, depth + 1)
	}
	return items
}

export function loadCatalog(root = docsRoot): Catalog {
	const articles = scanArticles(root)
	return { articles, tree: buildTree(articles), categories: collectCategories(articles), tags: countTags(articles) }
}

function countTags(articles: Article[]): TaxonomyCount[] {
	const counts = new Map<string, number>()
	for (const article of articles) {
		for (const tag of article.tags) counts.set(tag, (counts.get(tag) || 0) + 1)
	}
	return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
}
