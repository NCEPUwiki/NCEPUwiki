import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { docsRoot } from '../docs/.vitepress/catalog.ts'
import {
	buildIndexNowPayload,
	explainIndexNowStatus,
	indexNowKey,
	indexNowKeyLocation,
	indexNowUrlLimit,
	parseSitemapUrls,
	submitToIndexNow,
	waitForKeyLocation,
} from '../docs/.vitepress/indexnow.ts'
import { siteUrl } from '../docs/.vitepress/seo.ts'

const host = new URL(siteUrl).host

test('密钥文件与 indexnow.ts 里的密钥一致，且满足协议格式', () => {
	// 搜索引擎会抓取 /{key}.txt 校验归属，文件名或内容对不上就会返回 403
	const content = readFileSync(join(docsRoot, 'public', `${indexNowKey}.txt`), 'utf8').trim()
	assert.equal(content, indexNowKey)
	assert.match(indexNowKey, /^[0-9a-z-]{8,128}$/i)
	assert.equal(indexNowKeyLocation, `${siteUrl}/${indexNowKey}.txt`)
})

test('解析站点地图时还原 XML 实体并忽略非 http 地址', () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
		<urlset>
			<url><loc>https://wiki.ncepuinfo.cc/pages/a?x=1&amp;y=2</loc></url>
			<url><loc>  https://wiki.ncepuinfo.cc/pages/Pre</loc></url>
			<url><loc>mailto:someone@example.com</loc></url>
		</urlset>`
	assert.deepEqual(parseSitemapUrls(xml), [
		'https://wiki.ncepuinfo.cc/pages/a?x=1&y=2',
		'https://wiki.ncepuinfo.cc/pages/Pre',
	])
	assert.deepEqual(parseSitemapUrls('<urlset></urlset>'), [])
})

test('提交体会去重、按上限截断并使用站点 host', () => {
	const payload = buildIndexNowPayload([
		`${siteUrl}/pages/a`,
		`${siteUrl}/pages/a`,
		`${siteUrl}/pages/b`,
	], { limit: 1 })
	assert.equal(payload.host, host)
	assert.equal(payload.key, indexNowKey)
	assert.equal(payload.keyLocation, indexNowKeyLocation)
	assert.deepEqual(payload.urlList, [`${siteUrl}/pages/a`])
	assert.equal(indexNowUrlLimit, 10000)
})

test('提交外域或非法 URL 直接报错，避免整批被搜索引擎拒绝', () => {
	assert.throws(
		() => buildIndexNowPayload([`${siteUrl}/pages/a`, 'https://example.com/b']),
		/不属于/,
	)
	assert.throws(() => buildIndexNowPayload(['not-a-url']), /不属于/)
})

test('状态码翻译覆盖协议文档里的失败原因', () => {
	assert.match(explainIndexNowStatus(200), /成功/)
	assert.match(explainIndexNowStatus(202), /校验/)
	assert.match(explainIndexNowStatus(403), /密钥文件/)
	assert.match(explainIndexNowStatus(429), /频繁/)
	assert.match(explainIndexNowStatus(500), /500/)
})

test('200 与 202 都算提交成功，403 视为失败', async () => {
	const payload = buildIndexNowPayload([`${siteUrl}/pages/a`, `${siteUrl}/pages/b`])
	const fake = (status: number): typeof fetch => async () => new Response('', { status })

	const submitted = await submitToIndexNow(payload, { fetch: fake(200) })
	assert.equal(submitted.ok, true)
	assert.equal(submitted.count, 2)

	const pending = await submitToIndexNow(payload, { fetch: fake(202) })
	assert.equal(pending.ok, true)

	const rejected = await submitToIndexNow(payload, { fetch: fake(403) })
	assert.equal(rejected.ok, false)
	assert.match(rejected.reason, /密钥文件/)
})

test('提交请求使用协议规定的 POST JSON 请求体', async () => {
	const payload = buildIndexNowPayload([`${siteUrl}/pages/a`])
	let seen: { url: string, init?: RequestInit } | undefined
	const spy: typeof fetch = async (input, init) => {
		seen = { url: String(input), init }
		return new Response('', { status: 200 })
	}
	await submitToIndexNow(payload, { endpoint: 'https://api.indexnow.org/indexnow', fetch: spy })
	assert.equal(seen!.url, 'https://api.indexnow.org/indexnow')
	assert.equal(seen!.init!.method, 'POST')
	assert.equal((seen!.init!.headers as Record<string, string>)['content-type'], 'application/json; charset=utf-8')
	assert.deepEqual(JSON.parse(String(seen!.init!.body)), {
		host,
		key: indexNowKey,
		keyLocation: indexNowKeyLocation,
		urlList: [`${siteUrl}/pages/a`],
	})
})

test('密钥文件未发布或内容不符时提交前就会失败', async () => {
	const ok = await waitForKeyLocation({
		fetch: async () => new Response(indexNowKey, { status: 200 }),
		attempts: 1,
		delayMs: 0,
	})
	assert.equal(ok.ok, true)
	assert.match(ok.message, /密钥文件可访问/)

	const wrongBody = await waitForKeyLocation({
		fetch: async () => new Response('another-key', { status: 200 }),
		attempts: 1,
		delayMs: 0,
	})
	assert.equal(wrongBody.ok, false)
	assert.match(wrongBody.message, /内容与密钥不一致/)

	const missing = await waitForKeyLocation({
		fetch: async () => new Response('', { status: 404 }),
		attempts: 1,
		delayMs: 0,
	})
	assert.equal(missing.ok, false)
	assert.match(missing.message, /HTTP 404/)
})

test('密钥文件先在 404 后恢复时会重试成功', async () => {
	let calls = 0
	const retries: number[] = []
	const result = await waitForKeyLocation({
		fetch: async () => {
			calls += 1
			return calls === 1 ? new Response('', { status: 404 }) : new Response(indexNowKey, { status: 200 })
		},
		attempts: 3,
		delayMs: 0,
		onRetry: attempt => retries.push(attempt),
	})
	assert.equal(result.ok, true)
	assert.equal(calls, 2)
	assert.deepEqual(retries, [1])
})
