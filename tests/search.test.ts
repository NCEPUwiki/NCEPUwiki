import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createMarkdownRenderer } from 'vitepress'
import { docsRoot, scanArticles } from '../docs/.vitepress/catalog.ts'
import config from '../docs/.vitepress/config.mts'
import { writeSearchIndex } from '../docs/.vitepress/search-index.ts'

// 与正式站点共用同一份 markdown 配置来渲染测试内容
const renderer = createMarkdownRenderer(docsRoot, config.markdown!)

test('title-less table articles expose an anchored heading and body text', async () => {
	const md = await renderer
	const relativePath = '05.校园生活/01.常用账号与默认密码.md'
	const source = readFileSync(join(docsRoot, relativePath), 'utf8')
	const pageHtml = await md.renderAsync(source, { relativePath })
	assert.match(pageHtml, /<h1 hidden aria-hidden="true">常用账号与默认密码<a[^>]+href="#article-title"[^>]*><\/a><\/h1>/)
	assert.match(pageHtml, /华电邮箱/)
})

test('heading decorations preserve the trailing anchor', async () => {
	const md = await renderer
	const html = await md.renderAsync('## 知识技能掌握\n\n正文')
	assert.match(html, /<h2[^>]*><span class="heading-wordmark" aria-hidden="true"><\/span>知识技能掌握\s*<a[^>]+href="#知识技能掌握"[^>]*>.*?<\/a><\/h2>/)
})

test('search index stores whole article text and skips empty placeholders', async () => {
	const articles = scanArticles().filter(article => [
		'05.校园生活/01.常用账号与默认密码.md',
		'02.学习专题/03.等级、资格考试专题/01.四六级.md',
	].includes(article.source))
	const outDir = mkdtempSync(join(tmpdir(), 'wiki-search-'))
	try {
		await writeSearchIndex({ articles, docsRoot, outDir, markdown: config.markdown! })
		const records = JSON.parse(readFileSync(join(outDir, 'search-index.json'), 'utf8')) as { route: string, text: string }[]
		assert.equal(records.length, 1)
		assert.equal(records[0].route, '/pages/accountpassword')
		assert.ok(records[0].text.includes('华电邮箱'))
	}
	finally {
		rmSync(outDir, { recursive: true, force: true })
	}
})
