import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import test from 'node:test'
import { collectAuthors, frontmatterAuthors, gitAuthors, githubLogin, initialsAvatar, mergeAuthors, normalizeEmail, parseGitLog } from '../docs/.vitepress/authors.ts'

function hasGit(): boolean {
	try {
		execFileSync('git', ['--version'], { stdio: 'ignore' })
		return true
	}
	catch {
		return false
	}
}

/** 模拟 `git log --pretty=format:\x1e%an\x1f%ae --name-only` 的一段输出。 */
function commit(name: string, email: string, ...files: string[]): string {
	return `\u001E${name}\u001F${email}\n${files.join('\n')}\n`
}

test('frontmatter author 支持字符串、对象与数组写法', () => {
	assert.deepEqual(frontmatterAuthors('凝雨 NCEPUwiki-Group').map(author => author.name), ['凝雨', 'NCEPUwiki-Group'])
	assert.deepEqual(frontmatterAuthors('Rubbish_Seven、Liu').map(author => author.name), ['Rubbish_Seven', 'Liu'])
	const authors = frontmatterAuthors([
		{ name: '硕动力233 裴一淅', email: 'pyx0726@foxmail.com' },
		{ name: '鹰仓茉子', email: 'mailto:1361942776@qq.com', avatar: 'https://img.ncepuinfo.cc/mako.png' },
	])
	assert.deepEqual(authors.map(author => author.name), ['硕动力233 裴一淅', '鹰仓茉子'])
	assert.equal(authors[0].email, 'pyx0726@foxmail.com')
	assert.equal(authors[1].email, '1361942776@qq.com')
	assert.equal(authors[1].avatar, 'https://img.ncepuinfo.cc/mako.png')
	assert.deepEqual(frontmatterAuthors(null), [])
	// 主页链接不再支持，只有链接没有邮箱时不会解析出任何信息
	assert.deepEqual(frontmatterAuthors([{ name: '凝雨', link: 'https://github.com/TakakuraMako' }, { link: 'mailto:a@b.com' }, 42]).map(author => author.name), ['凝雨'])
	assert.equal(frontmatterAuthors({ name: '凝雨', link: 'https://github.com/TakakuraMako' })[0].email, undefined)
})

test('parseGitLog 按文件累计提交次数，跳过合并提交与目录外文件', () => {
	const output = [
		commit('鹰仓茉子', '“54049735+TakakuraMako@users.noreply.github.com”', 'docs/02.学习专题/06.综测.md', 'docs/index.md'),
		commit('鹰仓茉子', '54049735+TakakuraMako@users.noreply.github.com', 'docs/02.学习专题/06.综测.md'),
		commit('裴一淅', 'pyx0726@foxmail.com', 'docs/02.学习专题/06.综测.md'),
		commit('Merge Bot', 'bot@example.com'),
		commit('Repo Owner', 'owner@example.com', 'package.json'),
	].join('')
	const authors = parseGitLog(output, 'docs')
	assert.deepEqual(authors.get('02.学习专题/06.综测.md')?.map(author => [author.name, author.email, author.commits]), [
		['鹰仓茉子', '54049735+TakakuraMako@users.noreply.github.com', 2],
		['裴一淅', 'pyx0726@foxmail.com', 1],
	])
	assert.deepEqual(authors.get('index.md')?.map(author => author.name), ['鹰仓茉子'])
	assert.equal(authors.has('package.json'), false)
	assert.equal(authors.has('README.md'), false)
})

test('mergeAuthors 按邮箱或姓名去重，frontmatter 作者优先且头像逐级回退', () => {
	const authors = mergeAuthors(
		frontmatterAuthors([
			{ name: '鹰仓茉子', email: '1361942776@qq.com' },
			{ name: '凝雨', avatar: 'https://img.ncepuinfo.cc/ninyu.png' },
		]),
		[
			{ name: '鹰仓茉子', email: '54049735+TakakuraMako@users.noreply.github.com', commits: 12, origin: 'git' },
			{ name: 'TakakuraMako', email: '1361942776@qq.com', commits: 3, origin: 'git' },
			{ name: '孟小骇', email: '48383878+DreamHelium@users.noreply.github.com', commits: 5, origin: 'git' },
			{ name: 'Zhilu', email: 'hi@zhilu.cyou', commits: 2, origin: 'git' },
			{ name: '裴一淅', commits: 1, origin: 'git' },
		],
	)
	// 姓名相同（两个鹰仓茉子）与邮箱相同（鹰仓茉子 ↔ TakakuraMako）都会并成一条
	assert.deepEqual(authors.map(author => author.name), ['鹰仓茉子', '凝雨', '孟小骇', 'Zhilu', '裴一淅'])
	assert.equal(authors[0].commits, 15)
	assert.equal(authors[0].email, '1361942776@qq.com')
	assert.match(authors[0].avatar!, /^https:\/\/gravatar\.com\/avatar\/[0-9a-f]{32}\?d=identicon&s=80$/)
	assert.equal(authors[1].avatar, 'https://img.ncepuinfo.cc/ninyu.png')
	assert.equal(authors[2].avatar, 'https://github.com/DreamHelium.png?size=80')
	assert.match(authors[3].avatar!, /^https:\/\/gravatar\.com\/avatar\/[0-9a-f]{32}\?d=identicon&s=80$/)
	assert.equal(authors[4].avatar, authors[4].fallback)
	assert.ok(authors[4].avatar!.startsWith('data:image/svg+xml'))
})

test('邮箱与 GitHub 用户名识别兼容引号、mailto 和主页链接', () => {
	assert.equal(normalizeEmail('“1361942776@qq.com”'), '1361942776@qq.com')
	assert.equal(normalizeEmail('mailto:pyx0726@foxmail.com'), 'pyx0726@foxmail.com')
	assert.equal(normalizeEmail(' https://github.com/TakakuraMako '), '')
	assert.equal(githubLogin('54049735+TakakuraMako@users.noreply.github.com'), 'TakakuraMako')
	assert.equal(githubLogin('TakakuraMako@users.noreply.github.com'), 'TakakuraMako')
	assert.equal(githubLogin('https://github.com/NCEPUwiki/NCEPUwiki'), 'NCEPUwiki')
	assert.equal(githubLogin('mailto:pyx0726@foxmail.com'), '')
	assert.equal(initialsAvatar('凝雨'), initialsAvatar('凝雨'))
	assert.notEqual(initialsAvatar('凝雨'), initialsAvatar('鹰仓茉子'))
})

test('两个来源都没有作者时回退到 NCEPUwiki-Group 组织账号', () => {
	const [fallback] = collectAuthors('01.专题/未提交.md', undefined, join(tmpdir(), 'ncepu-authors-missing'))
	assert.equal(fallback.name, 'NCEPUwiki-Group')
	assert.equal(fallback.url, 'https://github.com/NCEPUwiki')
	assert.equal(fallback.avatar, 'https://github.com/NCEPUwiki.png?size=80')
})

test('gitAuthors 读取仓库历史，collectAuthors 与 frontmatter 作者合并', { skip: !hasGit() }, () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-authors-'))
	try {
		const docs = join(root, 'docs')
		const file = join(docs, '01.专题/01.文章.md')
		mkdirSync(join(docs, '01.专题'), { recursive: true })
		const run = (args: string[]) => execFileSync('git', ['-C', root, ...args], { stdio: 'ignore' })
		const commitAs = (name: string, email: string, message: string) => run(['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-m', message])
		writeFileSync(file, '# 文章\n')
		run(['init', '--initial-branch=main'])
		run(['add', '.'])
		commitAs('甲', 'jia@example.com', '第一篇')
		writeFileSync(file, '# 文章\n\n补充\n')
		run(['add', '.'])
		commitAs('乙', 'yi@example.com', '第二篇')

		const authors = gitAuthors(docs).get('01.专题/01.文章.md') ?? []
		assert.deepEqual(authors.map(author => [author.name, author.commits]), [['甲', 1], ['乙', 1]])

		const merged = collectAuthors('01.专题/01.文章.md', { name: '甲', email: 'jia@example.com' }, docs)
		assert.deepEqual(merged.map(author => author.name), ['甲', '乙'])
		assert.equal(merged[0].email, 'jia@example.com')
		assert.equal(merged[0].origin, 'frontmatter')
		assert.equal(merged[1].origin, 'git')
		assert.ok(merged[1].fallback!.startsWith('data:image/svg+xml'))
		assert.deepEqual(collectAuthors('01.专题/02.不存在.md', '凝雨', docs).map(author => author.name), ['凝雨'])
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})
