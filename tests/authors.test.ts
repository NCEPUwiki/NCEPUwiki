import assert from 'node:assert/strict'
import test from 'node:test'
import { applyAuthorPrivacy, parseAuthorPrivacy } from '../docs/.vitepress/authors.ts'
import type { Author } from '../docs/.vitepress/types.ts'

const authors: Author[] = [
	{ name: '甲', email: 'jia@example.com', avatar: 'https://example.com/jia.png', origin: 'frontmatter' },
	{ name: '乙', email: 'yi@example.com', origin: 'git', commits: 2 },
]

test('author privacy accepts matching rules by name or email', () => {
	assert.deepEqual(parseAuthorPrivacy([
		{ match: ' 甲 ', display: 'name' },
		{ match: 'YI@example.com', display: 'hidden' },
		{ match: '', display: 'hidden' },
		{ match: '乙', display: 'unknown' },
		'无效规则',
	]), [
		{ match: '甲', display: 'name' },
		{ match: 'YI@example.com', display: 'hidden' },
	])
})

test('name rules remove only the matched author email', () => {
	const visible = applyAuthorPrivacy(authors, [{ match: '甲', display: 'name' }])
	assert.deepEqual(visible.map(author => author.name), ['甲', '乙'])
	assert.equal(visible[0].avatar, 'https://example.com/jia.png')
	assert.ok(!('email' in visible[0]))
	assert.equal(visible[1].email, 'yi@example.com')
})

test('email matching can hide an author completely without affecting others', () => {
	const visible = applyAuthorPrivacy(authors, [{ match: 'YI@EXAMPLE.COM', display: 'hidden' }])
	assert.deepEqual(visible.map(author => author.name), ['甲'])
})

test('hidden takes precedence when an author matches multiple rules', () => {
	const visible = applyAuthorPrivacy(authors, [
		{ match: '甲', display: 'name' },
		{ match: 'jia@example.com', display: 'hidden' },
	])
	assert.deepEqual(visible.map(author => author.name), ['乙'])
})

test('empty and unmatched rules keep the existing author data', () => {
	assert.deepEqual(applyAuthorPrivacy(authors), authors)
	assert.deepEqual(applyAuthorPrivacy(authors, [{ match: '丙', display: 'hidden' }]), authors)
})
