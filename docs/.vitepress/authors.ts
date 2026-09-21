import type { Author } from './types.ts'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { relative, resolve } from 'node:path'

/** Git 输出里的字段/记录分隔符，避免作者名和邮箱里的空白或符号打断解析。 */
const FIELD = '\u001F'
const RECORD = '\u001E'
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

/**
 * 清理邮箱：去掉 `mailto:` 前缀、引号包裹和首尾空白；不是合法邮箱时返回空串。
 *
 * Git 里的提交邮箱有时写成 `TakakuraMako <“1361942776@qq.com”>`，
 * frontmatter 里也常用 `mailto:` 表示联系方式。
 */
export function cleanEmail(value: unknown): string {
	if (typeof value !== 'string')
		return ''
	const email = value.trim().replace(/^mailto:/i, '').replace(/^[“”"'<]+|[“”"'>]+$/g, '').trim()
	return EMAIL_RE.test(email) ? email : ''
}

/** 归一化邮箱（小写），用于去重。 */
export function normalizeEmail(value: unknown): string {
	return cleanEmail(value).toLowerCase()
}

/** 从邮箱或主页链接里识别 GitHub 用户名，用于取真实头像。 */
export function githubLogin(value: unknown): string {
	if (typeof value !== 'string')
		return ''
	const raw = value.trim().replace(/^mailto:/i, '')
	const noreply = /^(?:\d+\+)?([\w-]+)@users\.noreply\.github\.com$/i.exec(raw)
	if (noreply)
		return noreply[1]
	const profile = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)(?:[/?#].*)?$/i.exec(raw)
	return profile ? profile[1] : ''
}

function escapeXml(value: string): string {
	return value.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`)
}

/** 没有远程头像时使用的本地兜底图：姓名首字 + 由姓名决定的稳定色相。 */
export function initialsAvatar(name: string): string {
	const trimmed = name.trim()
	const initial = [...trimmed][0] || '?'
	let hue = 0
	for (const char of trimmed)
		hue = (hue * 31 + (char.codePointAt(0) || 0)) % 360
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="hsl(${hue} 45% 62%)"/><text x="32" y="32" fill="#fff" font-family="system-ui,sans-serif" font-size="28" text-anchor="middle" dominant-baseline="central">${escapeXml(initial)}</text></svg>`
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 邮箱能对应上 GitHub 时用 GitHub 头像，否则用 Gravatar；邮箱大小写保留给 GitHub 用户名。 */
function remoteAvatar(rawEmail: string, url: string): string {
	const login = githubLogin(rawEmail) || githubLogin(url)
	if (login)
		return `https://github.com/${login}.png?size=80`
	const email = normalizeEmail(rawEmail)
	return email ? `https://gravatar.com/avatar/${createHash('md5').update(email).digest('hex')}?d=identicon&s=80` : ''
}

/**
 * 把 frontmatter 的 `author` 归一化成作者列表。
 *
 * 只支持一种写法：数组，元素是 `{ name, email, avatar }` 对象。
 *
 * ```
 * author:
 *   - name: 凝雨
 *     email: mailto:ninyu@example.com
 *   - name: 鹰仓茉子
 *     email: 1361942776@qq.com
 *     avatar: https://img.ncepuinfo.cc/avatar.png
 * ```
 *
 * `name` 必填（缺了整条忽略）；`email` 可直接写邮箱或写成 `mailto:`；`avatar` 是图片地址。
 * 字符串、单个对象、数组里的字符串元素都不再支持，会被忽略。
 */
export function frontmatterAuthors(value: unknown): Author[] {
	if (!Array.isArray(value))
		return []
	const authors: Author[] = []
	for (const item of value) {
		if (!item || typeof item !== 'object')
			continue
		const { name, email, avatar } = item as Record<string, unknown>
		const displayName = typeof name === 'string' ? name.trim() : ''
		if (!displayName)
			continue
		authors.push({
			name: displayName,
			email: cleanEmail(email) || undefined,
			avatar: typeof avatar === 'string' && avatar.trim() ? avatar.trim() : undefined,
			origin: 'frontmatter',
		})
	}
	return authors
}

/** 裁剪出文档目录内的相对路径，目录外的文件返回空串。 */
function stripPrefix(path: string, prefix: string): string {
	if (!prefix)
		return path
	return path.startsWith(`${prefix}/`) ? path.slice(prefix.length + 1) : ''
}

/**
 * 解析 `git log --name-only` 的输出，得到「文件相对路径 → 提交作者」映射。
 *
 * 同一个人的多次提交按提交次数累计；合并提交没有文件列表，自然被跳过。
 */
export function parseGitLog(output: string, prefix = ''): Map<string, Author[]> {
	const perPath = new Map<string, Map<string, Author>>()
	for (const chunk of output.split(RECORD)) {
		const [header = '', ...lines] = chunk.replaceAll('\r', '').split('\n')
		const [name = '', email = ''] = header.split(FIELD)
		const author = { name: name.trim(), email: cleanEmail(email) }
		if (!author.name && !author.email)
			continue
		const key = normalizeEmail(author.email) || author.name.toLowerCase()
		for (const line of lines) {
			const path = line.trim()
			// 未启用改名检测，这里仍兜底跳过 `a/{b => c}` 形式的路径
			if (!path || path.includes(' => '))
				continue
			const source = stripPrefix(path, prefix)
			if (!source)
				continue
			if (!perPath.has(source))
				perPath.set(source, new Map())
			const authors = perPath.get(source)!
			const existing = authors.get(key)
			if (existing)
				existing.commits = (existing.commits ?? 0) + 1
			else
				authors.set(key, { name: author.name || author.email, email: author.email || undefined, commits: 1, origin: 'git' })
		}
	}
	return new Map([...perPath].map(([source, authors]) => [
		source,
		// 提交次数多的在前；次数相同保持 git log 顺序（最近提交者在前）。
		// 不用 localeCompare：不同 Node/ICU 版本对中文的排序结果不一致，会让页尾顺序随机变化。
		[...authors.values()].sort((a, b) => (b.commits ?? 0) - (a.commits ?? 0)),
	]))
}

const gitAuthorCache = new Map<string, Map<string, Author[]>>()

function readGitAuthors(root: string): Map<string, Author[]> {
	const git = (args: string[]) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
	try {
		// --no-renames：文件改名后新路径也能拿到原来的作者
		const output = git(['-c', 'core.quotePath=false', 'log', '--no-renames', `--pretty=format:${RECORD}%an${FIELD}%ae`, '--name-only'])
		const top = git(['rev-parse', '--show-toplevel']).trim()
		return parseGitLog(output, relative(top, resolve(root)).replaceAll('\\', '/'))
	}
	catch {
		// 没有 git 命令、不是 Git 仓库或浅克隆时退化为只显示 frontmatter 作者
		return new Map()
	}
}

/** 读取并缓存整个仓库的提交作者，构建期间只执行一次 git 命令。 */
export function gitAuthors(root: string): Map<string, Author[]> {
	const cached = gitAuthorCache.get(root)
	if (cached)
		return cached
	const authors = readGitAuthors(root)
	gitAuthorCache.set(root, authors)
	return authors
}

/** 姓名本身可能就是 GitHub 用户名：网页提交默认把账号名写进 Git 的 author name。 */
function nameLogin(name: string): string {
	return /^[a-z0-9-]{2,}$/i.test(name) ? name.toLowerCase() : ''
}

/** 判定「同一个人」的线索：邮箱、GitHub 用户名（来自邮箱、主页或姓名）与姓名。 */
function identityKeys(author: Author): string[] {
	const name = author.name.trim()
	const keys = [`n:${name.toLowerCase()}`]
	const email = normalizeEmail(author.email)
	if (email)
		keys.push(`e:${email}`)
	const login = githubLogin(author.email) || githubLogin(author.url) || nameLogin(name)
	if (login)
		keys.push(`g:${login.toLowerCase()}`)
	return keys
}

/** 把两份记录合并成一条：frontmatter 写的姓名、邮箱、主页优先，提交次数累加。 */
function absorb(target: Author, source: Author): void {
	target.email ||= source.email
	target.url ||= source.url
	target.avatar ||= source.avatar
	target.commits = (target.commits ?? 0) + (source.commits ?? 0)
	if (source.origin === 'frontmatter')
		target.origin = 'frontmatter'
}

function resolveAuthor(author: Author): Author {
	const email = cleanEmail(author.email)
	const url = author.url?.trim() || undefined
	const fallback = initialsAvatar(author.name)
	return {
		name: author.name,
		email: email || undefined,
		url,
		avatar: author.avatar || remoteAvatar(email, url || '') || fallback,
		fallback,
		commits: author.commits,
		origin: author.origin ?? 'git',
	}
}

/**
 * 合并多份作者列表：邮箱、GitHub 用户名或姓名相同视为同一人，只保留一条记录。
 *
 * frontmatter 里写的姓名、邮箱、主页优先，Git 历史补充提交次数；
 * 展示顺序是 frontmatter 声明的作者在前，其余按提交次数从多到少。
 */
export function mergeAuthors(...lists: Author[][]): Author[] {
	const entries: Author[] = []
	// 并查集：一位作者可能先按邮箱、再按姓名合并进来，需要能把两条已有记录并到一起
	const parents: number[] = []
	const owners = new Map<string, number>()
	const find = (index: number): number => {
		while (parents[index] !== index) {
			parents[index] = parents[parents[index]]
			index = parents[index]
		}
		return index
	}
	for (const list of lists) {
		for (const author of list) {
			const name = author.name.trim()
			if (!name)
				continue
			const created: Author = { ...author, name, email: cleanEmail(author.email) || undefined, origin: author.origin ?? 'git' }
			const keys = identityKeys(created)
			const roots = [...new Set(keys.map(key => owners.get(key)).filter((index): index is number => index !== undefined))].map(find)
			if (!roots.length) {
				parents.push(entries.length)
				entries.push(created)
				for (const key of keys)
					owners.set(key, entries.length - 1)
				continue
			}
			const root = roots[0]
			absorb(entries[root], created)
			for (const other of roots.slice(1)) {
				absorb(entries[root], entries[other])
				parents[other] = root
			}
			for (const key of keys)
				owners.set(key, root)
		}
	}
	return entries
		.filter((_, index) => find(index) === index)
		.map((author, index) => ({ author: resolveAuthor(author), index }))
		.sort((a, b) => Number(a.author.origin !== 'frontmatter') - Number(b.author.origin !== 'frontmatter')
			|| (b.author.commits ?? 0) - (a.author.commits ?? 0)
			|| a.index - b.index)
		.map(item => item.author)
}

/** 汇总一篇文章的完整作者列表：frontmatter 声明 + Git 提交历史，按人去重。 */
export function collectAuthors(source: string, author: unknown, root: string): Author[] {
	const authors = mergeAuthors(frontmatterAuthors(author), gitAuthors(root).get(source) || [])
	// 文件还没提交、历史被压缩或不是 Git 仓库时两个来源都会是空的，回退到组织账号
	return authors.length ? authors : mergeAuthors([{ name: 'NCEPUwiki-Group', url: 'https://github.com/NCEPUwiki' }])
}
