import type { DirectoryItem } from '../docs/.vitepress/types.ts'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import test from 'node:test'
import { buildTree, loadCatalog, outputPath, scanArticles } from '../docs/.vitepress/catalog.ts'

test('existing article URLs are unique and all articles appear once in the directory', () => {
	const articles = scanArticles()
	assert.ok(articles.length > 50)
	const flatten = (items: DirectoryItem[]): string[] => items.flatMap(item => item.link ? [item.link] : flatten(item.items || []))
	assert.deepEqual(flatten(buildTree(articles)).sort(), articles.map(article => article.url).sort())
	assert.equal(articles.find(article => article.title === '新生-入学准备')!.url, '/pages/Preparation')
	assert.equal(articles.find(article => article.title === '友情链接')!.url, '/pages/FriendshipLinks/')
	assert.equal(outputPath('/pages/Preparation'), 'pages/Preparation.md')
	assert.equal(outputPath('/pages/FriendshipLinks/'), 'pages/FriendshipLinks/index.md')
})

test('category counts include both directory ancestors and legacy categories without duplicates', () => {
	const { articles, tags, categories } = loadCatalog()
	const article = articles.find(article => article.title === '新生-入学准备')!
	assert.ok(article.categories.includes('新生'))
	assert.ok(article.categories.includes('新生入学'))
	for (const [field, counts] of [['tags', tags], ['categories', categories]] as const) {
		for (const { name, count } of counts) assert.equal(count, articles.filter(article => article[field].includes(name)).length)
	}
	assert.ok(articles.every(article => !article.updated || /^\d{4}-\d{2}-\d{2}$/.test(article.updated)))
})

test('new files use numeric directory order, preserve tags, infer missing titles, and reject duplicate routes', () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-catalog-'))
	try {
		mkdirSync(join(root, '01.专题'))
		writeFileSync(join(root, '01.专题/10.后一篇.md'), '')
		writeFileSync(join(root, '01.专题/02.前一篇.md'), '---\ntitle: 前一篇\npermalink: /pages/test/\ntags: [测试, 测试, null, ""]\ncategories: [专题]\n---\n```sh\n# A code comment is not an article heading\n```\n正文')
		const articles = scanArticles(root)
		assert.deepEqual(articles.map(article => article.title), ['前一篇', '后一篇'])
		assert.deepEqual(articles[0].tags, ['测试'])
		assert.deepEqual(articles[0].categories, ['专题'])
		assert.equal(articles[1].empty, true)
		assert.equal(articles[0].hasHeading, false)
		mkdirSync(join(root, '01.专题/01.子专题'))
		writeFileSync(join(root, '01.专题/01.子专题/01.文章.md'), '# 文章')
		assert.equal(buildTree(scanArticles(root))[0].items![0].text, '子专题')
		writeFileSync(join(root, '01.专题/03.重复.md'), '---\npermalink: /pages/test\n---')
		assert.throws(() => scanArticles(root), /重复 permalink/)
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})

test('content dates are stable across repository-wide commits', () => {
	const article = loadCatalog().articles.find(article => article.url.includes('PowerGeneration'))!
	assert.ok(article)
	assert.equal(article.updated, '2026-07-28')
	assert.equal(article.updatedTime, Date.parse('2026-07-28'))
})
