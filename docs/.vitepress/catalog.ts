import type { Article, Catalog, DirectoryItem } from './types.ts'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

export const docsRoot = fileURLToPath(new URL('../', import.meta.url))
const label = (name: string) => name.replace(/^\d+\./, '').replace(/\.md$/, '')
function strings(value: unknown): string[] {
	const values: unknown[] = Array.isArray(value) ? value : [value]
	return [...new Set(values.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean))]
}

function hasTitleHeading(content: string): boolean {
	let fence = ''
	for (const line of content.replace(/^:::markmap[^\S\n]*\n[\s\S]*?^:::[^\S\n]*$/gm, '').split('\n')) {
		const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1]
		if (marker) {
			if (!fence)
				fence = marker
			else if (marker[0] === fence[0] && marker.length >= fence.length)
				fence = ''
			continue
		}
		if (!fence && /^ {0,3}#\s+/.test(line))
			return true
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
			const folders = source.split('/').slice(0, -1).map(label)
			const url = fm.permalink || `/${source.replace(/\.md$/, '')}`
			if (!url.startsWith('/') || /[?#]|\.\./.test(url))
				throw new Error(`无效 permalink: ${source}`)
			articles.push({
				source,
				url,
				title: fm.title || label(entry.name),
				folders,
				categories: strings([...folders, ...strings(fm.categories).flatMap(category => category.split(/\s+-\s+/))]),
				tags: strings(fm.tags),
				date: fm.date ? new Date(fm.date).toISOString().slice(0, 10) : '',
				author: typeof fm.author === 'string' ? fm.author : fm.author?.name || 'NCEPUwiki-Group',
				updated: fm.updated || fm.date ? new Date(fm.updated || fm.date).toISOString().slice(0, 10) : '',
				updatedTime: fm.updated || fm.date ? new Date(fm.updated || fm.date).getTime() : 0,
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

export function loadCatalog(): Catalog {
	const articles = scanArticles()
	const count = (field: 'categories' | 'tags') => {
		const counts = new Map<string, number>()
		for (const article of articles) {
			for (const name of article[field]) counts.set(name, (counts.get(name) || 0) + 1)
		}
		return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
	}
	return { articles, tree: buildTree(articles), categories: count('categories'), tags: count('tags') }
}
