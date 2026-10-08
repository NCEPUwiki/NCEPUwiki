import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
	buildIndexNowPayload,
	indexNowEndpoint,
	indexNowKeyLocation,
	parseSitemapUrls,
	submitToIndexNow,
	waitForKeyLocation,
} from '../docs/.vitepress/indexnow.ts'
import { siteUrl } from '../docs/.vitepress/seo.ts'

/**
 * 把站点地图里的全部页面提交给 IndexNow。
 *
 * 用法（在 pnpm build 之后执行，需要 docs/.vitepress/dist/sitemap.xml）：
 *   node scripts/indexnow.ts                提交构建产物里的页面
 *   node scripts/indexnow.ts --dry-run      只打印将要提交的 URL，不发请求
 *   node scripts/indexnow.ts --remote       改用线上 sitemap.xml，不依赖本地构建
 *
 * 提交前会先确认密钥文件已发布，避免搜索引擎校验失败却没有任何提示。
 */
const publicDir = fileURLToPath(new URL('../docs/public/', import.meta.url))
const defaultDist = fileURLToPath(new URL('../docs/.vitepress/dist/', import.meta.url))

function resolveDistDir(argv: string[]) {
	const index = argv.indexOf('--dist')
	if (index === -1)
		return defaultDist
	const value = argv[index + 1]
	if (!value)
		throw new Error('--dist 后面需要给出产物目录')
	return value
}

/**
 * 密钥藏在密钥文件名里，所以直接从 docs/public 里找唯一的 {32位十六进制}.txt。
 * 这样密钥只有一个来源，indexnow.ts 与密钥文件不会各写一份而对不上。
 */
function readKeyFromPublicDir() {
	const keyFile = readdirSync(publicDir).find(name => /^[0-9a-f]{8,128}\.txt$/i.test(name))
	if (!keyFile)
		throw new Error(`docs/public/ 下没有找到 IndexNow 密钥文件（形如 <key>.txt）`)
	return keyFile.replace(/\.txt$/, '')
}

async function loadUrls(argv: string[]) {
	if (argv.includes('--remote')) {
		const remote = `${siteUrl}/sitemap.xml`
		const response = await fetch(remote)
		if (!response.ok)
			throw new Error(`抓取线上站点地图失败：HTTP ${response.status} ${remote}`)
		return { source: remote, urls: parseSitemapUrls(await response.text()) }
	}
	const sitemapPath = join(resolveDistDir(argv), 'sitemap.xml')
	return { source: sitemapPath, urls: parseSitemapUrls(readFileSync(sitemapPath, 'utf8')) }
}

const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const key = readKeyFromPublicDir()
const keyFile = join(publicDir, `${key}.txt`)

if (readFileSync(keyFile, 'utf8').trim() !== key)
	throw new Error(`${keyFile} 的内容与文件名不一致，IndexNow 校验会返回 403`)

const { source, urls } = await loadUrls(argv)
if (!urls.length)
	throw new Error(`${source} 里没有解析到任何 <loc>，先执行 pnpm build`)

const payload = buildIndexNowPayload(urls, { key })

console.log(`站点地图：${source}`)
console.log(`待提交页面：${payload.urlList.length} 条`)

if (dryRun) {
	console.log(`提交地址：${indexNowEndpoint}`)
	console.log(`密钥文件：${indexNowKeyLocation}`)
	for (const url of payload.urlList) console.log(`  ${url}`)
	console.log('--dry-run：未发送请求')
}
else {
	const check = await waitForKeyLocation({
		key,
		onRetry: (attempt, message) => console.log(`密钥文件暂不可用（${message}），第 ${attempt} 次重试…`),
	})
	console.log(check.message)
	if (!check.ok)
		throw new Error('密钥文件尚未发布，提交后无法通过校验，已中止')
	const result = await submitToIndexNow(payload)
	if (!result.ok)
		throw new Error(`IndexNow 提交失败：HTTP ${result.status}（${result.reason}）`)
	console.log(`IndexNow 已提交 ${result.count} 条：HTTP ${result.status} ${result.reason}`)
}
