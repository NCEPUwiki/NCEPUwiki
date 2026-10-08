import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import test from 'node:test'
import { scanArticles } from '../docs/.vitepress/catalog.ts'
import { assertSeoTitleMapMatches, seoTitleFor, seoTitleMap, standaloneSeo } from '../docs/.vitepress/seo.ts'

test('404.md is not scanned as an article', () => {
	const articles = scanArticles()
	// 404.md 满足「数字开头」的命名，但它是错误页，不能进入目录树
	assert.equal(articles.find(article => article.source === '404.md'), undefined)
	assert.equal(articles.find(article => article.url === '/404'), undefined)
})

test('404.md stays out of the article catalog in a scratch tree too', () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-404-'))
	try {
		mkdirSync(join(root, '01.专题'))
		writeFileSync(join(root, '404.md'), '---\ntitle: 页面未找到 (404)\n---\n\n正文')
		writeFileSync(join(root, '01.专题/01.文章.md'), '---\ntitle: 文章\n---\n\n正文')
		assert.deepEqual(scanArticles(root).map(article => article.source), ['01.专题/01.文章.md'])
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})

test('every seoTitleMap key matches a real article route', () => {
	// 映射靠 permalink 字符串匹配，写错 key 会静默失效，构建期必须能发现
	assert.doesNotThrow(() => assertSeoTitleMapMatches(scanArticles()))
	assert.throws(
		() => assertSeoTitleMapMatches([{ url: '/pages/kaoyan/' }] as Parameters<typeof assertSeoTitleMapMatches>[0]),
		/映射不会生效/,
	)
})

test('seo title falls back to the frontmatter title when the map has no entry', () => {
	assert.equal(seoTitleFor({ url: '/pages/kaoyan/', title: '考研' }), seoTitleMap['/pages/kaoyan/'])
	assert.equal(seoTitleFor({ url: '/pages/notesHCIPAI/', title: 'HCIP-AI 题目1-10' }), 'HCIP-AI 题目1-10')
})

test('brand name is not repeated in any SEO title', () => {
	// 品牌后缀由 titleTemplate 统一拼一次，主体里再写一遍会得到 “NCEPUwiki … | NCEPUwiki”
	for (const title of [...Object.values(seoTitleMap), ...Object.values(standaloneSeo).map(entry => entry.title).filter(Boolean)])
		assert.equal((title!.match(/NCEPUwiki/g) || []).length, 0, `标题重复出现品牌名：${title}`)
})
