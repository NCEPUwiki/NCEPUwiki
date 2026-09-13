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

test('title-less articles open with a first-level heading built from the frontmatter title', async () => {
	const md = await renderer
	const relativePath = '05.校园生活/01.常用账号与默认密码.md'
	const source = readFileSync(join(docsRoot, relativePath), 'utf8')
	const pageHtml = await md.renderAsync(source, { relativePath })
	assert.match(pageHtml, /^<h1 id="常用账号与默认密码"[^>]*>常用账号与默认密码\s*<a class="header-anchor" href="#常用账号与默认密码"/)
	assert.match(pageHtml, /华电邮箱/)
})

test('heading decorations preserve the trailing anchor', async () => {
	const md = await renderer
	const html = await md.renderAsync('## 知识技能掌握\n\n正文')
	assert.match(html, /<h2[^>]*><span class="heading-wordmark" aria-hidden="true"><\/span>知识技能掌握\s*<a[^>]+href="#知识技能掌握"[^>]*>.*?<\/a><\/h2>/)
})

// 正文自带一级标题时以作者写的为准，只有正文没写一级标题才用 frontmatter 的 title 生成
test('frontmatter title becomes the first-level heading only when the article has none', async () => {
	const md = await renderer
	// 该文章正文自带一级标题，渲染时不应再用 frontmatter 的 title 生成标题
	const manual = await md.renderAsync('# 手写标题\n\n正文', { relativePath: '10.贡献与其他/01.基础贡献.md' })
	assert.equal((manual.match(/<h1/g) || []).length, 1)
	assert.match(manual, /<h1[^>]*>.*手写标题/)
	assert.doesNotMatch(manual, /基础贡献/)

	// 该文章正文没有一级标题，正文开头用 frontmatter 的 title 生成一级标题
	const auto = await md.renderAsync('## 小节\n\n正文', { relativePath: '05.校园生活/01.常用账号与默认密码.md' })
	assert.match(auto, /^<h1 id="常用账号与默认密码"[^>]*>常用账号与默认密码\s*<a class="header-anchor" href="#常用账号与默认密码"/)
	assert.equal((auto.match(/<h1/g) || []).length, 1)
	assert.match(auto, /<h2[^>]*>.*小节/)
})

// 卡片容器会用同一个 env 再解析一次内层 Markdown，自动标题不能跟着插进去
test('generated heading stays out of card list containers', async () => {
	const md = await renderer
	const relativePath = '04.群汇总/01.同好群.md'
	const pageHtml = await md.renderAsync(readFileSync(join(docsRoot, relativePath), 'utf8'), { relativePath })
	assert.match(pageHtml, /^<h1 id="同好群"[^>]*>同好群/)
	assert.equal((pageHtml.match(/<h1/g) || []).length, 1)
	assert.ok((pageHtml.match(/class="campus-card"/g) || []).length > 0)
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
