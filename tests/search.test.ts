import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { createMarkdownRenderer } from 'vitepress'
import { docsRoot } from '../docs/.vitepress/catalog.ts'
import config from '../docs/.vitepress/config.mts'

const renderer = createMarkdownRenderer(docsRoot, config.markdown)
const search = config.themeConfig!.search!
assert.ok(search.provider === 'local')
const render = search.options!._render!

test('title-less table articles expose an anchored search heading and body', async () => {
	const md = await renderer
	const relativePath = '05.校园生活/01.常用账号与默认密码.md'
	const html = await render(readFileSync(join(docsRoot, relativePath), 'utf8'), { relativePath, path: join(docsRoot, relativePath), cleanUrls: true }, md)
	assert.match(html, /<h1 id="article-title">常用账号与默认密码<a[^>]+href="#article-title"[^>]*><\/a><\/h1>/)
	assert.match(html, /华电邮箱/)
})

test('heading decorations preserve the trailing anchor required by local search', async () => {
	const md = await renderer
	const html = await md.renderAsync('## 知识技能掌握\n\n正文')
	assert.match(html, /<h2[^>]*><span class="heading-wordmark" aria-hidden="true"><\/span>知识技能掌握\s*<a[^>]+href="#知识技能掌握"[^>]*>.*?<\/a><\/h2>/)
})

test('custom search rendering respects search false', async () => {
	const md = await renderer
	assert.equal(await render('---\nsearch: false\n---\n# 不索引\n\n正文', { relativePath: 'hidden.md', path: join(docsRoot, 'hidden.md'), cleanUrls: true }, md), '')
})
