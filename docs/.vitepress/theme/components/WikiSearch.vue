<script setup lang="ts">
import { useRouter, withBase } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// 与 docs/.vitepress/search-index.ts 中 SearchRecord 对应：
// 一条记录 = 一篇文章的完整纯文本。
interface IndexRecord {
	route: string
	title: string
	folders: string[]
	text: string
}

// 加载索引时预先归一化标题/正文，搜索过程不用反复扫描原始文本。
interface LoadedRecord extends IndexRecord {
	normalizedText: string
	normalizedTitle: string
}

interface ResultItem {
	record: LoadedRecord
	snippet: string
	titleHit: boolean
}

const router = useRouter()
const visible = ref(false)
const query = ref('')
const loading = ref(false)
const results = ref<ResultItem[]>([])
const selectedIndex = ref(-1)
const inputEl = ref<HTMLInputElement | null>(null)
const listEl = ref<HTMLDivElement | null>(null)

let indexPromise: Promise<LoadedRecord[] | null> | null = null
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let searchSeq = 0

/**
 * 归一化策略（索引与查询共用）：
 * - 不做任何中文分词；
 * - 仅去除空白、标点、符号和不可见格式字符并统一小写；
 * - 因此查询必须作为“连续的一段字符”出现在页面文本里才算命中。
 */
function normalize(text: string): string {
	return text.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}\p{Cf}]+/gu, '')
}

/** HTML 转义，用于安全渲染用户可控的查询文本。 */
function escapeHtml(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll('\'', '&#39;')
}

/** 正则转义，用于把普通文本当作字面量去高亮。 */
function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 首次使用时才 fetch search-index.json，之后复用同一个 Promise。 */
function loadIndex(): Promise<LoadedRecord[] | null> {
	if (!indexPromise) {
		loading.value = true
		indexPromise = fetch(withBase('/search-index.json'))
			.then(async (response) => {
				if (!response.ok)
					throw new Error(`搜索索引加载失败：${response.status}`)
				const records = await response.json() as IndexRecord[]
				return records.map(record => ({
					...record,
					normalizedText: normalize(record.text),
					normalizedTitle: normalize(record.title),
				}))
			})
			.catch(() => null)
			.finally(() => {
				loading.value = false
			})
	}
	return indexPromise
}

/**
 * 根据“归一化文本中的命中位置”估算原始文本中的截取范围，
 * 生成结果列表里展示的摘要片段（前后补省略号）。
 */
function makeSnippet(record: LoadedRecord, indexInNormalized: number): string {
	const text = record.text
	const start = Math.max(0, Math.floor(indexInNormalized / Math.max(1, record.normalizedText.length) * text.length) - 48)
	const end = Math.min(text.length, start + 190)
	const prefix = start > 0 ? '…' : ''
	const suffix = end < text.length ? '…' : ''
	return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ')}${suffix}`
}

interface FoundMatch {
	node: Text
	start: number
	end: number
}

/** 直接在单个文本节点里找“和用户输入一字不差”的首次出现。 */
function findExactText(root: Element, query: string): FoundMatch | null {
	const rawQuery = query.trim().replace(/\s+/g, ' ')
	if (!rawQuery)
		return null
	const lowerQuery = rawQuery.toLowerCase()
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const text = node as Text
		const index = text.data.toLowerCase().indexOf(lowerQuery)
		if (index >= 0)
			return { node: text, start: index, end: index + rawQuery.length }
	}
	return null
}

/**
 * 兜底查找：正文可能因换行/标点/零宽字符导致无法“一字不差”匹配，
 * 于是把所有文本节点归一化后拼起来定位首次命中，再映射回原始节点。
 */
function findNormalizedText(root: Element, normalizedQuery: string): FoundMatch | null {
	const segments: { node: Text, norm: string }[] = []
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const text = node as Text
		const norm = normalize(text.data)
		if (norm)
			segments.push({ node: text, norm })
	}
	const combined = segments.map(segment => segment.norm).join('')
	const combinedIndex = combined.indexOf(normalizedQuery)
	if (combinedIndex < 0)
		return null

	let offset = 0
	for (const segment of segments) {
		if (combinedIndex < offset + segment.norm.length) {
			const segmentOffset = combinedIndex - offset
			let rawOffset = 0
			let skipped = 0
			for (let rawIndex = 0; rawIndex < segment.node.data.length && skipped < segmentOffset; rawIndex++) {
				const character = segment.node.data[rawIndex]
				if (!/[\s\p{P}\p{S}\p{Cf}]/u.test(character)) {
					skipped++
					rawOffset = rawIndex + 1
				}
			}
			return { node: segment.node, start: rawOffset, end: Math.min(segment.node.data.length, rawOffset + normalizedQuery.length) }
		}
		offset += segment.norm.length
	}
	return null
}

/**
 * 用 <mark> 包裹命中文字、滚动到视野中央，并在数秒后还原原文。
 */
function markAndScroll(match: FoundMatch) {
	const parent = match.node.parentNode
	if (!parent)
		return
	// 先把命中片段从文本节点里“切”出来，再用 mark 替换它
	match.node.splitText(match.end)
	const matchNode = match.node.splitText(match.start)
	const mark = document.createElement('mark')
	mark.className = 'wiki-search-jump'
	parent.replaceChild(mark, matchNode)
	mark.appendChild(matchNode)
	mark.scrollIntoView({ block: 'center', behavior: 'smooth' })
	setTimeout(() => {
		if (!mark.isConnected)
			return
		// 还原被 mark 包裹的文本，避免永久改变文章 DOM
		const content = mark.firstChild
		if (content)
			parent.insertBefore(content, mark)
		mark.remove()
	}, 3500)
}

/**
 * 跳转后等文章正文渲染出来，然后定位并高亮第一个命中位置。
 * 页面存在多个 .vp-doc（例如 ArticleMeta 与正文），因此遍历正文根节点。
 */
async function jumpToFirstMatch(query: string) {
	const normalizedQuery = normalize(query)
	if (!normalizedQuery)
		return

	await nextTick()
	const deadline = Date.now() + 3000
	while (Date.now() < deadline) {
		const roots = [...document.querySelectorAll('main .vp-doc')]
		if (!roots.length)
			roots.push(...document.querySelectorAll('.vp-doc:not(.article-meta)'))
		if (!roots.length)
			roots.push(document.querySelector('main')!)
		for (const root of roots) {
			const exact = findExactText(root, query)
			if (exact) {
				markAndScroll(exact)
				return
			}
			const normalized = findNormalizedText(root, normalizedQuery)
			if (normalized) {
				markAndScroll(normalized)
				return
			}
		}
		await new Promise(resolve => setTimeout(resolve, 80))
	}
}

/** 生成结果摘要，并把命中的整串文字用 <mark> 高亮。 */
function highlightSnippet(record: LoadedRecord, indexInNormalized: number): string {
	const snippet = escapeHtml(makeSnippet(record, indexInNormalized))
	const rawQuery = query.value.trim().replace(/\s+/g, ' ')
	if (!rawQuery)
		return snippet
	const pattern = new RegExp(`(${escapeRegExp(rawQuery)})`, 'gi')
	return snippet.replace(pattern, '<mark>$1</mark>')
}

/**
 * 真正的搜索：对每一页执行“归一化全文 contains 归一化查询”。
 * 标题命中优先，其次按正文中首次出现位置排序，最多展示 20 条。
 */
async function performSearch() {
	const normalizedQuery = normalize(query.value)
	const seq = ++searchSeq
	if (!normalizedQuery) {
		results.value = []
		selectedIndex.value = -1
		return
	}

	const records = await loadIndex()
	if (seq !== searchSeq)
		return
	if (!records) {
		results.value = []
		selectedIndex.value = -1
		return
	}

	const matches: { record: LoadedRecord, index: number, titleHit: boolean }[] = []
	for (const record of records) {
		const index = record.normalizedText.indexOf(normalizedQuery)
		if (index >= 0) {
			matches.push({
				record,
				index,
				titleHit: record.normalizedTitle.includes(normalizedQuery),
			})
		}
	}

	matches.sort((a, b) => Number(b.titleHit) - Number(a.titleHit) || a.index - b.index)
	results.value = matches.slice(0, 20).map(match => ({
		record: match.record,
		snippet: highlightSnippet(match.record, match.index),
		titleHit: match.titleHit,
	}))
	selectedIndex.value = results.value.length ? 0 : -1
}

/** 用方向键在结果间移动选择。 */
function moveSelection(step: number) {
	if (!results.value.length)
		return
	selectedIndex.value = (selectedIndex.value + step + results.value.length) % results.value.length
}

/** 打开结果页面，并在正文里跳到输入内容首次出现的位置。 */
async function openResult(route: string) {
	const matchedQuery = query.value
	closeSearch()
	await router.go(withBase(route))
	await jumpToFirstMatch(matchedQuery)
}

/** 搜索框内键盘操作：上下选择、回车打开、Esc 关闭。 */
function onInputKeydown(event: KeyboardEvent) {
	if (event.key === 'ArrowDown') {
		event.preventDefault()
		moveSelection(1)
	}
	else if (event.key === 'ArrowUp') {
		event.preventDefault()
		moveSelection(-1)
	}
	else if (event.key === 'Enter') {
		event.preventDefault()
		const item = results.value[selectedIndex.value]
		if (item)
			openResult(item.record.route)
	}
	else if (event.key === 'Escape') {
		event.preventDefault()
		closeSearch()
	}
}

/** 全局快捷键：任意页面按 Ctrl/Cmd+K 打开搜索。 */
function onGlobalKeydown(event: KeyboardEvent) {
	if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
		event.preventDefault()
		openSearch()
	}
}

/** 打开搜索弹窗并预加载索引，避免首次输入等待。 */
async function openSearch() {
	if (!visible.value) {
		query.value = ''
		results.value = []
	}
	visible.value = true
	await nextTick()
	inputEl.value?.focus()
	void loadIndex()
}

/** 关闭并清空状态，下次打开从空白开始。 */
function closeSearch() {
	visible.value = false
	query.value = ''
	results.value = []
	selectedIndex.value = -1
}

// 输入防抖：停止输入 180ms 后再搜索
watch(query, () => {
	clearTimeout(debounceTimer)
	debounceTimer = setTimeout(() => {
		void performSearch()
	}, 180)
})

// 键盘/鼠标选中项变化时保证它在可视区域内
watch(selectedIndex, async () => {
	await nextTick()
	listEl.value?.querySelector('.selected')?.scrollIntoView({ block: 'nearest' })
})

const resultCountText = computed(() => results.value.length ? `共 ${results.value.length} 条结果` : '')

onMounted(() => {
	window.addEventListener('keydown', onGlobalKeydown)
})

// 卸载时移除全局快捷键与待执行的防抖任务
onBeforeUnmount(() => {
	window.removeEventListener('keydown', onGlobalKeydown)
	clearTimeout(debounceTimer)
})
</script>

<template>
<div class="wiki-search">
	<button class="wiki-search-button" type="button" aria-label="搜索文档" @click="openSearch">
		<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" /></svg>
		<span class="label">搜索文档</span>
		<span class="shortcut">Ctrl K</span>
	</button>

	<Teleport to="body">
		<div v-if="visible" class="wiki-search-mask" @click.self="closeSearch">
			<div class="wiki-search-panel" role="dialog" aria-modal="true" aria-label="搜索文档">
				<div class="wiki-search-bar">
					<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" /></svg>
					<input
						ref="inputEl"
						v-model="query"
						class="wiki-search-input"
						type="text"
						placeholder="输入要查找的文字，例如：华电邮箱"
						autocomplete="off"
						spellcheck="false"
						@keydown="onInputKeydown"
					>
					<button v-if="query" class="wiki-search-clear" type="button" aria-label="清除搜索" @click="query = ''">
						<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M18 6 6 18M6 6l12 12" /></svg>
					</button>
				</div>

				<div v-if="resultCountText" class="wiki-search-summary">
					{{ resultCountText }}
				</div>

				<div ref="listEl" class="wiki-search-results" role="listbox">
					<p v-if="loading && !results.length" class="wiki-search-status">
						正在加载索引…
					</p>
					<p v-else-if="query && !loading && !results.length" class="wiki-search-status">
						没有找到完整包含这段文字的页面
					</p>
					<p v-else-if="!query" class="wiki-search-status">
						搜索时会把整段文字当作连续内容匹配
					</p>

					<button
						v-for="(item, index) in results"
						:key="item.record.route"
						class="wiki-search-result"
						:class="{ selected: index === selectedIndex }"
						type="button"
						role="option"
						:aria-selected="index === selectedIndex"
						@click="openResult(item.record.route)"
						@mouseenter="selectedIndex = index"
					>
						<span class="wiki-search-result-title">
							<svg v-if="item.titleHit" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6 9 17l-5-5" /></svg>
							{{ item.record.title }}
						</span>
						<span v-if="item.record.folders.length" class="wiki-search-result-path">{{ item.record.folders.join(' / ') }}</span>
						<!-- eslint-disable-next-line vue/no-v-html -->
						<span class="wiki-search-result-snippet" v-html="item.snippet" />
					</button>
				</div>

				<div class="wiki-search-footer">
					<span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
					<span><kbd>Enter</kbd> 打开</span>
					<span><kbd>Esc</kbd> 关闭</span>
				</div>
			</div>
		</div>
	</Teleport>
</div>
</template>

<style scoped>
.wiki-search {
	display: flex;
	flex: 1;
	padding-left: 24px;
}

.wiki-search-button {
	display: flex;
	align-items: center;
	gap: 8px;
	height: 40px;
	padding: 0 10px 0 12px;
	border: 1px solid transparent;
	border-radius: 8px;
	background: var(--vp-c-bg-alt);
	color: var(--vp-c-text-2);
	transition: border-color 0.2s, color 0.2s;
	cursor: pointer;
}

.wiki-search-button:hover {
	border-color: var(--vp-c-brand-1);
	color: var(--vp-c-text-1);
}

.wiki-search-button svg {
	width: 14px;
	height: 14px;
}

.wiki-search-button .shortcut {
	padding: 1px 6px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 4px;
	font-size: 12px;
	line-height: 18px;
}

.wiki-search-mask {
	display: flex;
	align-items: flex-start;
	justify-content: center;
	position: fixed;
	inset: 0;
	padding: 12vh 16px 24px;
	background: rgb(0 0 0 / 45%);
	z-index: 90;
}

.wiki-search-panel {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	width: min(680px, 100%);
	max-height: 72vh;
	border: 1px solid var(--vp-c-divider);
	border-radius: 12px;
	box-shadow: 0 18px 50px rgb(0 0 0 / 20%);
	background: var(--vp-c-bg);
}

.wiki-search-bar {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 14px 16px;
	border-bottom: 1px solid var(--vp-c-divider);
}

.wiki-search-bar > svg {
	flex: none;
	width: 18px;
	height: 18px;
	color: var(--vp-c-text-2);
}

.wiki-search-input {
	flex: 1;
	min-width: 0;
	border: 0;
	outline: 0;
	background: transparent;
	font: inherit;
	color: var(--vp-c-text-1);
}

.wiki-search-input::placeholder {
	color: var(--vp-c-text-3);
}

.wiki-search-clear {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 6px;
	border: 0;
	border-radius: 6px;
	background: transparent;
	color: var(--vp-c-text-2);
	cursor: pointer;
}

.wiki-search-clear:hover {
	background: var(--vp-c-bg-alt);
	color: var(--vp-c-brand-1);
}

.wiki-search-clear svg {
	width: 14px;
	height: 14px;
}

.wiki-search-summary {
	padding: 8px 16px 0;
	font-size: 12px;
	color: var(--vp-c-text-2);
}

.wiki-search-results {
	flex: 1;
	overflow: auto;
	padding: 8px;
}

.wiki-search-status {
	margin: 0;
	padding: 18px 12px;
	font-size: 14px;
	text-align: center;
	color: var(--vp-c-text-2);
}

.wiki-search-result {
	display: block;
	width: 100%;
	padding: 10px 12px;
	border: 0;
	border-radius: 8px;
	background: transparent;
	text-align: left;
	color: var(--vp-c-text-1);
	cursor: pointer;
}

.wiki-search-result.selected,
.wiki-search-result:hover {
	background: var(--vp-c-bg-alt);
}

.wiki-search-result-title {
	display: flex;
	align-items: center;
	gap: 6px;
	font-weight: 600;
}

.wiki-search-result-title svg {
	width: 13px;
	height: 13px;
	color: var(--vp-c-brand-1);
}

.wiki-search-result-path {
	display: block;
	margin-top: 2px;
	font-size: 12px;
	color: var(--vp-c-text-3);
}

.wiki-search-result-snippet {
	display: -webkit-box;
	overflow: hidden;
	margin-top: 5px;
	font-size: 13px;
	-webkit-line-clamp: 3;
	line-height: 1.6;
	word-break: break-word;
	color: var(--vp-c-text-2);
	-webkit-box-orient: vertical;
}

.wiki-search-result-snippet :deep(mark) {
	padding: 0 1px;
	border-radius: 3px;
	background: var(--vp-c-brand-soft);
	color: var(--vp-c-brand-1);
}

.wiki-search-footer {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 8px 16px;
	border-top: 1px solid var(--vp-c-divider);
	font-size: 12px;
	color: var(--vp-c-text-3);
}

.wiki-search-footer kbd {
	display: inline-block;
	min-width: 20px;
	margin: 0 2px;
	padding: 1px 5px;
	border: 1px solid var(--vp-c-divider);
	border-bottom-width: 2px;
	border-radius: 4px;
	font-family: inherit;
	font-size: 11px;
	text-align: center;
}

@media (max-width: 767px) {
	.wiki-search {
		flex: 0;
		padding-left: 0;
	}

	.wiki-search-button {
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 0;
		background: transparent;
	}

	.wiki-search-button .label,
	.wiki-search-button .shortcut {
		display: none;
	}

	.wiki-search-button svg {
		width: 18px;
		height: 18px;
	}
}
</style>

<style>
.wiki-search-jump {
	padding: 0 1px;
	border-radius: 3px;
	background: var(--vp-c-yellow-soft, #FFE58A);
	color: inherit;
}
</style>
