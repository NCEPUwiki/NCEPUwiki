import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import test from 'node:test'
import matter from 'gray-matter'
import { createMarkdownRenderer } from 'vitepress'
import { cardlist } from '../docs/.vitepress/cardlist.ts'

test('card lists preserve rich cells, omit empty fields, and leave ordinary tables intact', async () => {
	const md = await createMarkdownRenderer(process.cwd(), { config: cardlist })
	const table = '| 名称 | 加入方式 | 备注 |\n| --- | --- | --- |\n| A & B | [12345](https://example.com) | |'
	const html = md.render(`::: cardlist\n\n${table}\n\n:::\n\n${table}`)
	assert.equal((html.match(/class="campus-card"/g) || []).length, 1)
	assert.match(html, /A &amp; B/)
	assert.match(html, /href="https:\/\/example.com"/)
	assert.doesNotMatch(html, /campus-card-label">备注/)
	assert.equal((html.match(/<table\b/g) || []).length, 1)
})

test('all group and food rows reach the cards with no hidden overflow columns', async () => {
	const md = await createMarkdownRenderer(process.cwd(), { config: cardlist })
	for (const file of ['04.群汇总/01.同好群.md', '04.群汇总/02.老乡群.md', '04.群汇总/03.学生组织与社团名单.md', '05.校园生活/09.美食.md']) {
		const { content } = matter(readFileSync(`docs/${file}`, 'utf8').replaceAll('\r\n', '\n'))
		const tables = [...content.matchAll(/::: cardlist[^\S\r\n]*\n([\s\S]*?)\n:::/g)]
		let count = 0
		for (const [, table] of tables) {
			const rows = table.trim().split('\n').filter(line => line.startsWith('|'))
			const columns = rows[0].split('|').length
			for (const row of rows) assert.equal(row.split('|').length, columns, `${file}: ${row}`)
			count += rows.length - 2
		}
		assert.ok(count > 50, file)
		const html = md.render(content)
		assert.equal((html.match(/class="campus-card"/g) || []).length, count, file)
		assert.doesNotMatch(html, /<table[ >]/, file)
		assert.doesNotMatch(html, /<img[^>]+src=""/, file)
	}
})
