import { setTimeout } from 'node:timers/promises'
import { siteUrl } from './seo.ts'

/**
 * IndexNow 协议接入（https://www.indexnow.org/documentation）。
 *
 * 提交 URL 之前，搜索引擎会先抓取 keyLocation 指向的密钥文件验证站点归属，
 * 因此密钥文件 docs/public/{key}.txt 会随构建产物发布到站点根目录。
 * 密钥可以包含 a-z、A-Z、0-9 和短横线，长度 8–128 位。
 */
export const indexNowKey = 'd793882a93998188251d6bc0f1b5b9d4'

/** 密钥文件的公开地址，对应 docs/public/d793882a93998188251d6bc0f1b5b9d4.txt。 */
export const indexNowKeyLocation = `${siteUrl}/d793882a93998188251d6bc0f1b5b9d4.txt`

/** 通用提交入口，会把 URL 转发给所有接入 IndexNow 的搜索引擎。 */
export const indexNowEndpoint = 'https://api.indexnow.org/indexnow'

/** 协议上限：单次 POST 最多 10,000 条 URL。 */
export const indexNowUrlLimit = 10000

/** sitemap.xml 里需要按 XML 实体还原的字符。 */
const xmlEntities: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&apos;': '\'',
	'&#39;': '\'',
}

export function decodeXmlText(value: string) {
	return value.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, entity => xmlEntities[entity])
}

/**
 * 从 sitemap.xml 取出全部 <loc> 地址。
 *
 * 站点地图已经是「可收录页面」的最终名单：404、空占位页和代码块示例页
 * 都已在 sitemap.transformItems 阶段过滤掉，这里不再重复判断。
 */
export function parseSitemapUrls(xml: string) {
	return [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)]
		.map(match => decodeXmlText(match[1].trim()))
		.filter(url => /^https?:\/\//i.test(url))
}

export interface IndexNowPayload {
	host: string
	key: string
	keyLocation: string
	urlList: string[]
}

/**
 * 组装提交体：去重、剔除同一个 host 之外的 URL，并截断到协议上限。
 *
 * 提交其他 host 的 URL 会被搜索引擎以 422 拒绝，因此在本地直接抛错，
 * 避免一个手误让整批 URL 都提交失败。
 */
export function buildIndexNowPayload(urls: string[], options: { host?: string, key?: string, keyLocation?: string, limit?: number } = {}): IndexNowPayload {
	const host = options.host || new URL(siteUrl).host
	const limit = options.limit ?? indexNowUrlLimit
	const unique = [...new Set(urls.map(url => url.trim()).filter(Boolean))]
	const foreign = unique.filter((url) => {
		try {
			return new URL(url).host !== host
		}
		catch {
			return true
		}
	})
	if (foreign.length)
		throw new Error(`以下 URL 不属于 ${host}，IndexNow 会拒绝整批请求：${foreign.join(', ')}`)
	return {
		host,
		key: options.key || indexNowKey,
		keyLocation: options.keyLocation || indexNowKeyLocation,
		urlList: unique.slice(0, limit),
	}
}

/** 把协议文档里的状态码翻译成可读原因，方便在 CI 日志里定位失败。 */
export function explainIndexNowStatus(status: number) {
	const reasons: Record<number, string> = {
		200: 'URL 已成功提交',
		202: 'URL 已接收，等待校验密钥',
		400: '请求格式无效',
		403: '密钥无效：密钥文件缺失，或文件内容与密钥不一致',
		422: 'URL 不属于该 host，或密钥不符合协议格式',
		429: '提交过于频繁（可能被判定为垃圾请求）',
	}
	return reasons[status] || `未预期的状态码 ${status}`
}

export interface IndexNowResult {
	ok: boolean
	status: number
	reason: string
	count: number
}

/**
 * 提交一批 URL。IndexNow 用 200 表示成功、202 表示已接收待校验，两者都算提交成功。
 * fetch 允许注入，便于测试在不发真实请求的情况下覆盖各种响应。
 */
export async function submitToIndexNow(
	payload: IndexNowPayload,
	options: { endpoint?: string, fetch?: typeof fetch } = {},
): Promise<IndexNowResult> {
	const response = await (options.fetch ?? fetch)(options.endpoint || indexNowEndpoint, {
		method: 'POST',
		headers: { 'content-type': 'application/json; charset=utf-8' },
		body: JSON.stringify(payload),
	})
	return {
		ok: response.ok,
		status: response.status,
		reason: explainIndexNowStatus(response.status),
		count: payload.urlList.length,
	}
}

/**
 * 提交前确认密钥文件已经能公开访问。
 *
 * 搜索引擎是提交时才去抓密钥文件的：文件还没同步上去就会拿到 202「等待校验」，
 * 之后校验失败不会有任何回调，提交等于白费。所以这里先自己抓一次，
 * GitHub Pages 首次发布需要一点时间，因此允许重试。
 */
export async function waitForKeyLocation(options: {
	keyLocation?: string
	key?: string
	fetch?: typeof fetch
	attempts?: number
	delayMs?: number
	onRetry?: (attempt: number, message: string) => void
} = {}) {
	const key = options.key || indexNowKey
	const keyLocation = options.keyLocation || indexNowKeyLocation
	const attempts = options.attempts ?? 5
	const delayMs = options.delayMs ?? 4000
	const doFetch = options.fetch ?? fetch
	let last = ''
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			const response = await doFetch(keyLocation)
			const body = response.ok ? (await response.text()).trim() : ''
			if (body === key)
				return { ok: true, message: `密钥文件可访问：${keyLocation}` }
			last = response.ok ? '内容与密钥不一致' : `HTTP ${response.status}`
		}
		catch (error) {
			last = error instanceof Error ? error.message : String(error)
		}
		if (attempt < attempts) {
			options.onRetry?.(attempt, last)
			await setTimeout(delayMs)
		}
	}
	return { ok: false, message: `密钥文件不可用（${last}）：${keyLocation}` }
}
