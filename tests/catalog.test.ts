import type { Article, DirectoryItem } from '../docs/.vitepress/types.ts'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import test from 'node:test'
import { buildPagePaths, buildSidebar, buildTree, loadCatalog, outputPath, scanArticles } from '../docs/.vitepress/catalog.ts'
import { categoryChildren, categoryPaths, resolveCategory } from '../docs/.vitepress/category.ts'

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

test('侧边栏按一级分类组织：每页只出现同一级分类的文章，permalink 前缀不会抢走目录', () => {
	const articles = scanArticles()
	const sidebar = buildSidebar(articles, buildPagePaths(articles))
	const groupOf = (article: Article) => article.categories[0]?.split('/')[0]
	const links = (items: DirectoryItem[]): string[] => items.flatMap(item => item.link ? [item.link] : links(item.items || []))
	for (const article of articles) {
		const page = `/${outputPath(article.url)}`
		// VitePress 挑侧栏的规则是「页面路径以键开头」；没写分类的文章不进任何侧栏
		const matched = Object.keys(sidebar).filter(key => page.startsWith(key))
		if (!groupOf(article)) {
			assert.deepEqual(matched, [])
			continue
		}
		assert.deepEqual(matched, [page])
		// 侧栏包含当前文章，且只包含同一级分类的文章
		assert.ok(links(sidebar[page]).includes(article.url))
		for (const link of links(sidebar[page]))
			assert.equal(groupOf(articles.find(other => other.url === link)!), groupOf(article))
	}
	// 回归：课程评价的 permalink /pages/CourseEvaluation 曾命中 /pages/Course 的键，
	// 左侧显示成新生入学目录；现在必须拿到学习专题的目录
	const courseEvaluation = links(sidebar['/pages/CourseEvaluation.md'])
	assert.ok(courseEvaluation.includes('/pages/CourseEvaluation'))
	assert.ok(courseEvaluation.includes('/pages/kaoyan/'))
	assert.ok(!courseEvaluation.includes('/pages/Course'))
	// 没写 categories 的文章（全国大学生数学建模竞赛）不进任何侧栏
	assert.equal(sidebar['/pages/cumcm.md'], undefined)
	assert.ok(!courseEvaluation.includes('/pages/cumcm'))
	// 只写了子分类的文章按一级分类归组，仍然出现在侧栏里
	const nested = links(sidebar['/pages/52fb8b/index.md'])
	assert.ok(nested.includes('/pages/52fb8b/'))
	assert.ok(nested.includes('/pages/CourseEvaluation'))
})

test('分类只在 frontmatter 里声明一次，计数与 tag 计数一致', () => {
	const { articles, tags, categories } = loadCatalog()
	const article = articles.find(article => article.title === '新生-入学准备')!
	assert.ok(article.categories.includes('新生入学'))
	assert.equal(article.categories.filter(category => category === '新生入学').length, 1)
	for (const { name, count } of tags) assert.equal(count, articles.filter(article => article.tags.includes(name)).length)
	// 分类只统计直接属于它的文章：子分类的文章算在子分类里，不再计入上级
	for (const { path, count } of categories) assert.equal(count, articles.filter(article => article.categories.includes(path)).length)
	assert.ok(articles.every(article => !article.lastUpdated || /^\d{4}-\d{2}-\d{2}$/.test(article.lastUpdated)))
})

test('分类只由 frontmatter 决定，目录不参与判断', () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-category-'))
	try {
		mkdirSync(join(root, '01.学习专题/01.竞赛专题/01.数学建模'), { recursive: true })
		writeFileSync(join(root, '01.学习专题/01.入门.md'), '---\ntitle: 入门\ncategories:\n  - 学习专题\n---\n正文')
		// 上级和更深的子分类都写上时两条都算，文章在两个分类里都出现
		writeFileSync(join(root, '01.学习专题/01.竞赛专题/01.数学建模.md'), '---\ntitle: 数学建模\ncategories:\n  - 学习专题\n    - 竞赛专题\n  - 学习专题\n---\n正文')
		// 不写 categories 就不会出现在任何分类里，哪怕目录在分类目录下面
		writeFileSync(join(root, '01.学习专题/01.竞赛专题/01.数学建模/01.国赛.md'), '---\ntitle: 国赛\n---\n正文')

		const { articles, categories } = loadCatalog(root)
		const intro = articles.find(article => article.title === '入门')!
		const competition = articles.find(article => article.title === '数学建模')!
		const nested = articles.find(article => article.title === '国赛')!
		assert.deepEqual(intro.categories, ['学习专题'])
		assert.deepEqual(competition.categories, ['学习专题/竞赛专题', '学习专题'])
		assert.deepEqual(nested.categories, [])
		assert.deepEqual(categories, [
			{ name: '学习专题', path: '学习专题', count: 2 },
			{ name: '竞赛专题', path: '学习专题/竞赛专题', count: 1 },
		])
		assert.deepEqual(categoryChildren(categories, '学习专题').map(category => category.path), ['学习专题/竞赛专题'])
		assert.deepEqual(categoryChildren(categories, '学习专题/竞赛专题'), [])
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})

test('真实文档：同时写了上级和子分类的文章两处都在', () => {
	const { articles, categories } = loadCatalog()
	const count = (path: string) => articles.filter(article => article.categories.includes(path)).length
	const competition = articles.find(article => article.title === '学科竞赛简介')!
	// frontmatter 里写了「学习专题 - 竞赛专题」又写了「学习专题」，两条都算
	assert.deepEqual(competition.categories, ['学习专题/竞赛专题', '学习专题'])
	assert.equal(count('学习专题'), categories.find(category => category.path === '学习专题')!.count)
	assert.ok(count('学习专题/竞赛专题') > 0)
	// 放在分类目录里但 frontmatter 没写 categories 的文章不属于任何分类
	assert.deepEqual(articles.find(article => article.title === '全国大学生数学建模竞赛')!.categories, [])
	// 每个分类的计数只算写了这条分类的文章，不做任何累加
	for (const category of categories)
		assert.equal(count(category.path), category.count)
})

test('分类层级只认 frontmatter 的缩进写法', () => {
	assert.deepEqual(categoryPaths('学习专题'), ['学习专题'])
	// YAML 会把缩进折行解析成 “学习专题 - test1 - test2” 这样的一行
	assert.deepEqual(categoryPaths('学习专题 - test1 - test2'), ['学习专题/test1/test2'])
	// 没有缩进的多条是同级分类
	assert.deepEqual(categoryPaths(['学习专题', '竞赛专题']), ['学习专题', '竞赛专题'])
	assert.deepEqual(categoryPaths([' 学习专题 ', null, '']), ['学习专题'])
	// 层级只认缩进，嵌套数组之类的写法不作为分类
	assert.deepEqual(categoryPaths([['学习专题', 'test1']]), [])
})

test('侧栏分组只看 frontmatter 分类：和文件放在哪个目录无关', () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-sidebar-'))
	try {
		// 文章躺在「甲专题」的目录树里，但分类写的是「乙专题 - 子分类」，
		// 缩进写法的一级分类是乙专题，所以它归到乙专题的侧栏，不出现在甲专题
		mkdirSync(join(root, '01.甲专题/01.子目录'), { recursive: true })
		mkdirSync(join(root, '02.乙专题'), { recursive: true })
		writeFileSync(join(root, '01.甲专题/01.子目录/01.文章.md'), '---\ntitle: 文章\npermalink: /pages/test-nested/\ncategories:\n  - 乙专题\n    - 子分类\n---\n正文')
		writeFileSync(join(root, '01.甲专题/01.普通.md'), '---\ntitle: 普通\npermalink: /pages/test-plain/\ncategories:\n  - 甲专题\n---\n正文')
		writeFileSync(join(root, '02.乙专题/01.同组.md'), '---\ntitle: 同组\npermalink: /pages/test-sibling\ncategories:\n  - 乙专题\n---\n正文')

		const articles = scanArticles(root)
		const sidebar = buildSidebar(articles, buildPagePaths(articles))
		const links = (items: DirectoryItem[]): string[] => items.flatMap(item => item.link ? [item.link] : links(item.items || []))
		assert.equal(articles.find(article => article.title === '文章')!.categories[0], '乙专题/子分类')
		// 「文章」和「同组」在同一棵侧栏树里，互相能看到
		assert.deepEqual(links(sidebar['/pages/test-nested/index.md']).sort(), ['/pages/test-nested/', '/pages/test-sibling'])
		assert.ok(links(sidebar['/pages/test-sibling.md']).includes('/pages/test-nested/'))
		// 「文章」不因为文件在甲专题目录下就出现在甲专题的侧栏里
		assert.deepEqual(links(sidebar['/pages/test-plain/index.md']), ['/pages/test-plain/'])
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})

test('分类链接优先精确匹配，旧链接只写末级名字时按唯一名字回退', () => {
	const categories = [
		{ name: '学习专题', path: '学习专题', count: 1 },
		{ name: '学习资料', path: '学习专题/学习资料', count: 1 },
		{ name: '学习资料', path: '就业/学习资料', count: 1 },
		{ name: '竞赛专题', path: '学习专题/竞赛专题', count: 1 },
	]
	assert.equal(resolveCategory(categories, '学习专题/竞赛专题'), '学习专题/竞赛专题')
	assert.equal(resolveCategory(categories, '竞赛专题'), '学习专题/竞赛专题')
	assert.equal(resolveCategory(categories, ''), '')
	// 末级名字有歧义时保持原样，不去猜是哪一条
	assert.equal(resolveCategory(categories, '学习资料'), '学习资料')
	assert.equal(resolveCategory(categories, '不存在的分类'), '不存在的分类')
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

test('lastUpdated is explicit and never falls back to creation dates or legacy updated', () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-dates-'))
	try {
		mkdirSync(join(root, '01.专题'))
		writeFileSync(join(root, '01.专题/01.文章.md'), '---\ndate: 2025-08-31\nlastUpdated: 2026-09-14\n---\n正文')
		writeFileSync(join(root, '01.专题/02.无修改日期.md'), '---\ndate: 2025-08-31\nupdated: 2026-09-14\n---\n正文')
		const [article, missing] = loadCatalog(root).articles
		assert.equal(article.date, '2025-08-31')
		assert.equal(article.lastUpdated, '2026-09-14')
		assert.equal(article.lastUpdatedTime, Date.parse('2026-09-14'))
		assert.equal(missing.lastUpdated, '')
		assert.equal(missing.lastUpdatedTime, 0)
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})

test('articles take the frontmatter title as the first-level heading only when the body has none', () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-title-'))
	try {
		mkdirSync(join(root, '01.专题'))
		const write = (name: string, body: string) => writeFileSync(
			join(root, `01.专题/${name}.md`),
			`---\ntitle: ${name}\n---\n${body}`,
		)
		write('01.自动标题', '## 二级标题\n\n正文')
		write('02.手写标题', '# 手写标题\n\n正文')
		write('03.Setext标题', '手写 Setext 标题\n=====\n\n正文')
		write('04.代码块', '```md\n# 只是代码\n```\n\n正文')
		write('05.脑图', ':::markmap\n# 脑图节点\n:::\n\n正文')
		write('06.引用里的标题', '> # 引用中的标题\n\n正文')

		const headings = Object.fromEntries(scanArticles(root).map(article => [article.title, article.hasHeading]))
		assert.deepEqual(headings, {
			'01.自动标题': false,
			'02.手写标题': true,
			'03.Setext标题': true,
			'04.代码块': false,
			'05.脑图': false,
			'06.引用里的标题': false,
		})
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})
