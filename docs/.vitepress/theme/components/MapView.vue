<script setup lang="ts">
import type { AmapLngLat, AmapMap, AmapMarker, AmapNamespace, AmapOverlay } from '../amap.ts'
import type { LngLat, MapDataset, MapIconData, MapPoi } from '../map-types.ts'
import closeIcon from '@iconify-icons/ri/close-line'
import locateIcon from '@iconify-icons/ri/gps-line'
import searchIcon from '@iconify-icons/ri/search-line'
import { Icon } from '@iconify/vue'
import { useData, withBase } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { amapConfigured, loadAmap } from '../amap.ts'
import { gcj02ToBd09 } from '../gcj02.ts'

const props = defineProps<{ dataset: MapDataset }>()

const { isDark } = useData()

type MapStatus = 'loading' | 'ready' | 'missing-key' | 'error'

const container = ref<HTMLDivElement | null>(null)
/** 点击标记后地图平移的动画时长（ms），越小越快；设为 0 则直接跳转。 */
const PAN_DURATION = 50
const status = ref<MapStatus>('loading')
const statusText = ref('')
const pickMode = ref(false)
const areaId = ref(props.dataset.areas[0]?.id ?? '')
const categoryId = ref('all')
const keyword = ref('')
const selectedId = ref<string | null>(null)
const pickCoord = ref<LngLat | null>(null)
const pickName = ref('')
const pickCategory = ref('other')
const toast = ref('')

let amap: AmapNamespace | null = null
let map: AmapMap | null = null
let overlays: AmapOverlay[] = []
let pickMarker: AmapMarker | null = null
let userMarker: AmapMarker | null = null
let focusFromUrl: string | null = null
let toastTimer: ReturnType<typeof setTimeout> | undefined
let hoverLockedUntil = 0
let panFrame = 0
const markers = new Map<string, AmapMarker>()
const markerEls = new Map<string, HTMLDivElement>()

const area = computed(() => props.dataset.areas.find(item => item.id === areaId.value) ?? props.dataset.areas[0])

const selectedPoi = computed(() => {
	if (!selectedId.value || !area.value)
		return null
	return area.value.pois.find(item => item.id === selectedId.value) ?? null
})

const searchResults = computed(() => {
	const query = keyword.value.trim().toLowerCase()
	if (!query || !area.value)
		return []
	return area.value.pois.filter(poi => poiMatches(poi, query)).slice(0, 8)
})

const pickSnippet = computed(() => {
	if (!pickCoord.value)
		return ''
	const [lng, lat] = pickCoord.value
	const name = pickName.value.trim() || '未命名地点'
	return `{ id: '${areaId.value}-${pickCategory.value}-xx', name: '${name}', category: '${pickCategory.value}', coord: [${lng.toFixed(6)}, ${lat.toFixed(6)}] },`
})

function poiMatches(poi: MapPoi, query: string) {
	return poi.name.toLowerCase().includes(query)
		|| (poi.keywords ?? []).some(item => item.toLowerCase().includes(query))
}

function categoryOf(id: string) {
	return props.dataset.categories.find(item => item.id === id)
}

function colorOf(id: string) {
	return categoryOf(id)?.color ?? '#94a3b8'
}

function labelOf(id: string) {
	return categoryOf(id)?.label ?? '其他'
}

/** HTML 转义，用于把点位名称安全地放进自定义标记模板。 */
function escapeHtml(value: string) {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll('\'', '&#39;')
}

function styleFor(dark: boolean) {
	return dark ? 'amap://styles/dark' : 'amap://styles/normal'
}

/** 读取地址栏参数：?area=校区&focus=点位&pick=1。 */
function readUrl() {
	if (typeof window === 'undefined')
		return
	const params = new URLSearchParams(window.location.search)
	const requestedArea = params.get('area')
	if (requestedArea && props.dataset.areas.some(item => item.id === requestedArea))
		areaId.value = requestedArea
	pickMode.value = params.get('pick') === '1'
	focusFromUrl = params.get('focus')
}

/** 把当前状态写回地址栏，保证链接可分享、可刷新。 */
function syncUrl() {
	if (typeof window === 'undefined')
		return
	const url = new URL(window.location.href)
	if (props.dataset.areas.length > 1)
		url.searchParams.set('area', areaId.value)
	if (selectedId.value)
		url.searchParams.set('focus', selectedId.value)
	else
		url.searchParams.delete('focus')
	if (pickMode.value)
		url.searchParams.set('pick', '1')
	else
		url.searchParams.delete('pick')
	window.history.replaceState(null, '', url)
}

/** 把 Iconify 图标数据渲染成内联 SVG 字符串。 */
function iconSvg(icon: MapIconData | undefined) {
	if (!icon)
		return ''
	const width = icon.width ?? 24
	const height = icon.height ?? 24
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor" aria-hidden="true">${icon.body}</svg>`
}

/** 生成一枚自定义标记：未选中是小圆点，选中后变成水滴图钉；名称胶囊固定显示在下方。 */
function createPin(poi: MapPoi) {
	const el = document.createElement('div')
	el.className = 'wiki-map-pin'
	el.style.setProperty('--pin-color', colorOf(poi.category))
	const glyph = iconSvg(categoryOf(poi.category)?.icon)
	el.innerHTML = `<span class="wiki-map-pin-dot"></span><div class="wiki-map-pin-body"><svg class="wiki-map-pin-shape" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"/></svg><span class="wiki-map-pin-glyph">${glyph}</span></div><span class="wiki-map-pin-label">${escapeHtml(poi.name)}</span>`
	return el
}

/** 清空并重建当前区域的多边形与标记。 */
function renderArea() {
	const amapNs = amap
	const amapMap = map
	if (!amapNs || !amapMap)
		return
	if (overlays.length)
		amapMap.remove(overlays)
	overlays = []
	markers.clear()
	markerEls.clear()
	const current = area.value
	if (!current)
		return
	// 校区范围只做「淡底色 + 描边」，避免整块颜色盖住底图。
	// 透明度必须用 fillOpacity 控制，不要写进 rgba()：
	// 高德把 fillOpacity 当作填充透明度，rgba() 里的 alpha 会被忽略。
	const palette = isDark.value
		? { strokeColor: '#7EC4AC', fillColor: '#7EC4AC', fillOpacity: 0.14 }
		: { strokeColor: '#2F6F5C', fillColor: '#2F6F5C', fillOpacity: 0.08 }
	const polygons = current.boundaries.map(ring => new amapNs.Polygon({
		path: ring,
		strokeColor: palette.strokeColor,
		fillColor: palette.fillColor,
		fillOpacity: palette.fillOpacity,
		strokeOpacity: 0.9,
		strokeWeight: 2,
		zIndex: 10,
		// 边界多边形不能拦截点击，否则圈内区域在拾取模式下点不了
		bubble: true,
	}))
	for (const poi of current.pois) {
		const el = createPin(poi)
		const marker = new amapNs.Marker({
			position: poi.coord,
			content: el,
			anchor: 'bottom-center',
			zIndex: 120,
			bubble: false,
		})
		marker.on('click', () => selectPoi(poi.id, 'pan'))
		marker.on('mouseover', () => {
			// 地图平移时标记会从指针下方滑过，连续触发 hover 会让画面抖动，直接跳过
			if (performance.now() >= hoverLockedUntil)
				el.classList.add('is-hover')
		})
		marker.on('mouseout', () => el.classList.remove('is-hover'))
		markers.set(poi.id, marker)
		markerEls.set(poi.id, el)
	}
	overlays = [...polygons, ...markers.values()]
	amapMap.add(overlays)
	applyCategory()
	amapMap.setZoomAndCenter(current.zoom, current.center, false, 300)
}

/** 按分类显示/隐藏标记。 */
function applyCategory() {
	const current = area.value
	for (const [id, marker] of markers) {
		const poi = current?.pois.find(item => item.id === id)
		const visible = categoryId.value === 'all' || poi?.category === categoryId.value
		if (visible)
			marker.show()
		else
			marker.hide()
	}
}

function switchArea(id: string) {
	if (id === areaId.value)
		return
	areaId.value = id
	selectedId.value = null
	keyword.value = ''
	categoryId.value = 'all'
	renderArea()
	syncUrl()
}

function selectPoi(id: string, recenter: 'none' | 'pan' | 'zoom' = 'none') {
	selectedId.value = id
	for (const [key, el] of markerEls)
		el.classList.toggle('is-active', key === id)
	for (const [key, marker] of markers) {
		if (typeof marker.setzIndex === 'function')
			marker.setzIndex(key === id ? 320 : 120)
	}
	// 点击图钉只做平滑平移、不改变缩放（与青理工一致）；
	// 只有来自链接的 ?focus= 深链才放大到目标，方便直接看清点位。
	if (recenter !== 'none') {
		const poi = area.value?.pois.find(item => item.id === id)
		if (poi && map) {
			// 平移/缩放动画期间锁定悬停效果，动画结束后恢复正常
			hoverLockedUntil = performance.now() + (recenter === 'zoom' ? 700 : PAN_DURATION + 160)
			if (recenter === 'zoom')
				map.setZoomAndCenter(18, poi.coord, false, 400)
			else
				smoothPanTo(poi.coord, PAN_DURATION)
		}
	}
	syncUrl()
}

function selectFromSearch(id: string) {
	keyword.value = ''
	selectPoi(id, 'pan')
}

/**
 * 自行驱动的地图平移：固定时长 + easeOutCubic 缓动。
 * 高德内置 panTo 的缓动长尾明显，即使给较短的时长，观感依然拖沓，
 * 这里逐帧 setCenter，前四分之一时间就完成大部分位移，快而跟手。
 */
function smoothPanTo(target: LngLat, duration: number) {
	const amapMap = map
	if (!amapMap)
		return
	cancelAnimationFrame(panFrame)
	if (duration <= 0) {
		amapMap.setCenter(target, true)
		return
	}
	const center = amapMap.getCenter()
	const from: LngLat = [center.getLng(), center.getLat()]
	const startTime = performance.now()
	const step = (now: number) => {
		const progress = Math.min(1, Math.max(0, (now - startTime) / duration))
		const eased = 1 - (1 - progress) ** 3
		amapMap.setCenter([
			from[0] + (target[0] - from[0]) * eased,
			from[1] + (target[1] - from[1]) * eased,
		], true)
		if (progress < 1)
			panFrame = requestAnimationFrame(step)
	}
	panFrame = requestAnimationFrame(step)
}

function clearSelection() {
	selectedId.value = null
	for (const el of markerEls.values()) el.classList.remove('is-active')
	for (const marker of markers.values()) {
		if (typeof marker.setzIndex === 'function')
			marker.setzIndex(120)
	}
	syncUrl()
}

function onMapClick(event: { lnglat: AmapLngLat }) {
	if (pickMode.value) {
		const coord: LngLat = [event.lnglat.getLng(), event.lnglat.getLat()]
		pickCoord.value = coord
		renderPickMarker(coord)
		return
	}
	if (selectedId.value)
		clearSelection()
}

function renderPickMarker(coord: LngLat) {
	const amapNs = amap
	const amapMap = map
	if (!amapNs || !amapMap)
		return
	if (pickMarker)
		amapMap.remove(pickMarker)
	const el = document.createElement('div')
	el.className = 'wiki-map-pick-pin'
	pickMarker = new amapNs.Marker({ position: coord, content: el, anchor: 'center', zIndex: 400 })
	amapMap.add(pickMarker)
}

function exitPick() {
	pickMode.value = false
	if (pickMarker && map) {
		map.remove(pickMarker)
		pickMarker = null
	}
	syncUrl()
}

function togglePick() {
	if (pickMode.value) {
		exitPick()
		return
	}
	pickMode.value = true
	showToast('点击地图任意位置拾取坐标')
	syncUrl()
}

function showToast(message: string) {
	toast.value = message
	clearTimeout(toastTimer)
	toastTimer = setTimeout(() => {
		toast.value = ''
	}, 2200)
}

async function copyText(text: string, message: string) {
	try {
		if (!navigator.clipboard?.writeText)
			throw new Error('clipboard unavailable')
		await navigator.clipboard.writeText(text)
	}
	catch {
		const helper = document.createElement('textarea')
		helper.value = text
		document.body.append(helper)
		helper.select()
		document.execCommand('copy')
		helper.remove()
	}
	showToast(message)
}

function amapLink(poi: MapPoi) {
	const [lng, lat] = poi.coord
	return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(poi.name)}&src=NCEPUwiki&coordinate=gaode&callnative=1`
}

function baiduLink(poi: MapPoi) {
	const [bdLng, bdLat] = gcj02ToBd09(poi.coord[0], poi.coord[1])
	return `https://api.map.baidu.com/marker?location=${bdLat.toFixed(6)},${bdLng.toFixed(6)}&title=${encodeURIComponent(poi.name)}&content=${encodeURIComponent(poi.name)}&output=html&src=webapp.NCEPUwiki`
}

/** 浏览器定位（高德 Geolocation 插件）。 */
async function locate() {
	const amapNs = amap
	const amapMap = map
	if (!amapNs || !amapMap)
		return
	try {
		await new Promise<void>((resolve) => {
			amapNs.plugin(['AMap.Geolocation'], () => resolve())
		})
		const geolocation = new amapNs.Geolocation({ enableHighAccuracy: true, timeout: 8000 })
		geolocation.getCurrentPosition((result, data) => {
			if (result === 'complete' && data.position) {
				const coord: LngLat = [data.position.getLng(), data.position.getLat()]
				amapMap.setZoomAndCenter(17, coord)
				addUserMarker(coord)
			}
			else {
				showToast('定位失败，请检查浏览器的定位权限')
			}
		})
	}
	catch {
		showToast('定位组件加载失败')
	}
}

function addUserMarker(coord: LngLat) {
	const amapNs = amap
	const amapMap = map
	if (!amapNs || !amapMap)
		return
	if (userMarker)
		amapMap.remove(userMarker)
	const el = document.createElement('div')
	el.className = 'wiki-map-user-pin'
	userMarker = new amapNs.Marker({ position: coord, content: el, anchor: 'center', zIndex: 350 })
	amapMap.add(userMarker)
}

function setupMap() {
	const amapNs = amap
	const el = container.value
	if (!amapNs || !el)
		return
	const current = area.value
	// 底图元素：默认去掉高德自带的 POI 图标（point），只保留我们自己的点位标记；
	// 文字注记由 showLabel 控制，两者都可以在数据集的 display 字段里调整。
	const display = props.dataset.display ?? {}
	const features = display.showPoi === true
		? ['bg', 'point', 'road', 'building']
		: ['bg', 'road', 'building']
	map = new amapNs.Map(el, {
		viewMode: '2D',
		zoom: current?.zoom ?? 16,
		center: current?.center ?? [116.31, 40.09],
		mapStyle: styleFor(isDark.value),
		features,
		showLabel: display.showLabels !== false,
		resizeEnable: true,
		zooms: [12, 20],
	})
	map.on('click', onMapClick)
	try {
		amapNs.plugin(['AMap.Scale'], () => {
			if (map && typeof amapNs.Scale === 'function')
				map.addControl(new amapNs.Scale())
		})
	}
	catch {
		// 比例尺属于增强项，加载失败不影响地图使用
	}
	renderArea()
	if (focusFromUrl && area.value?.pois.some(item => item.id === focusFromUrl))
		selectPoi(focusFromUrl, 'zoom')
}

function handlePopState() {
	readUrl()
	if (map)
		renderArea()
	if (focusFromUrl && area.value?.pois.some(item => item.id === focusFromUrl))
		selectPoi(focusFromUrl, 'zoom')
}

watch(isDark, (dark) => {
	if (map)
		map.setMapStyle(styleFor(dark))
})

watch(categoryId, () => {
	applyCategory()
})

onMounted(async () => {
	readUrl()
	if (!amapConfigured()) {
		status.value = 'missing-key'
		return
	}
	try {
		amap = await loadAmap()
		setupMap()
		status.value = 'ready'
	}
	catch (error) {
		status.value = 'error'
		statusText.value = error instanceof Error ? error.message : String(error)
	}
	window.addEventListener('popstate', handlePopState)
})

onBeforeUnmount(() => {
	if (typeof window !== 'undefined')
		window.removeEventListener('popstate', handlePopState)
	cancelAnimationFrame(panFrame)
	clearTimeout(toastTimer)
	map?.destroy()
	map = null
	amap = null
})
</script>

<template>
<div class="wiki-map" :class="{ 'is-picking': pickMode }">
	<div ref="container" class="wiki-map-canvas" />

	<div v-if="status !== 'ready'" class="wiki-map-state">
		<p v-if="status === 'loading'">
			地图加载中……
		</p>
		<div v-else-if="status === 'missing-key'" class="wiki-map-state-card">
			<h2>地图还没配置高德 Key</h2>
			<p>本页使用高德 JS API v2。请管理员到 <a href="https://console.amap.com/dev/key/app" target="_blank" rel="noopener">高德开放平台控制台</a> 申请一个「Web端(JS API)」Key（建议配置域名白名单），再把 Key 与安全密钥填进 <code>docs/.vitepress/theme/map-config.ts</code>。</p>
		</div>
		<div v-else class="wiki-map-state-card">
			<h2>地图加载失败</h2>
			<p>{{ statusText }}</p>
		</div>
	</div>

	<div v-if="status === 'ready' && !pickMode" class="wiki-map-panel">
		<div v-if="dataset.areas.length > 1" class="wiki-map-tabs">
			<button v-for="item in dataset.areas" :key="item.id" type="button" class="wiki-map-tab" :class="{ 'is-active': item.id === areaId }" @click="switchArea(item.id)">
				{{ item.name }}
			</button>
		</div>
		<div class="wiki-map-search">
			<Icon :icon="searchIcon" aria-hidden="true" />
			<input v-model="keyword" type="search" :placeholder="`搜索${area?.name ?? ''}的地点`" aria-label="搜索地点">
		</div>
		<ul v-if="searchResults.length" class="wiki-map-results">
			<li v-for="poi in searchResults" :key="poi.id">
				<button type="button" @click="selectFromSearch(poi.id)">
					<span class="wiki-map-dot" :style="{ background: colorOf(poi.category) }" />
					<span class="wiki-map-result-name">{{ poi.name }}</span>
					<span class="wiki-map-result-cat">{{ labelOf(poi.category) }}</span>
				</button>
			</li>
		</ul>
	</div>

	<div v-if="status === 'ready' && !pickMode" class="wiki-map-chips">
		<button type="button" class="wiki-map-chip" :class="{ 'is-active': categoryId === 'all' }" @click="categoryId = 'all'">
			全部
		</button>
		<button v-for="item in dataset.categories" :key="item.id" type="button" class="wiki-map-chip" :class="{ 'is-active': categoryId === item.id }" @click="categoryId = item.id">
			<span class="wiki-map-dot" :style="{ background: item.color }" />{{ item.label }}
		</button>
	</div>

	<div v-if="status === 'ready'" class="wiki-map-tools">
		<button type="button" class="wiki-map-tool" :class="{ 'is-active': pickMode }" @click="togglePick">
			{{ pickMode ? '退出拾取' : '拾取坐标' }}
		</button>
		<button type="button" class="wiki-map-tool" @click="locate">
			<Icon :icon="locateIcon" aria-hidden="true" />定位
		</button>
	</div>

	<div v-if="pickMode" class="wiki-map-pick">
		<div class="wiki-map-pick-head">
			<strong>坐标拾取模式</strong>
			<button type="button" aria-label="退出拾取模式" @click="exitPick">
				<Icon :icon="closeIcon" aria-hidden="true" />
			</button>
		</div>
		<p class="wiki-map-pick-tip">
			点击地图上的位置即可拾取坐标（GCJ-02，可直接粘贴进数据文件）。
		</p>
		<template v-if="pickCoord">
			<p class="wiki-map-pick-coord">
				{{ pickCoord[0].toFixed(6) }}, {{ pickCoord[1].toFixed(6) }}
			</p>
			<input v-model="pickName" type="text" placeholder="地点名称（选填）" aria-label="地点名称">
			<select v-model="pickCategory" aria-label="分类">
				<option v-for="item in dataset.categories" :key="item.id" :value="item.id">
					{{ item.label }}
				</option>
			</select>
			<textarea readonly :value="pickSnippet" aria-label="数据条代码" />
			<div class="wiki-map-pick-actions">
				<button type="button" @click="copyText(`${pickCoord[0].toFixed(6)}, ${pickCoord[1].toFixed(6)}`, '已复制坐标')">
					复制坐标
				</button>
				<button type="button" @click="copyText(pickSnippet, '已复制数据条')">
					复制数据条
				</button>
			</div>
		</template>
	</div>

	<aside v-if="selectedPoi" class="wiki-map-card">
		<div class="wiki-map-card-head">
			<strong>{{ selectedPoi.name }}</strong>
			<button type="button" aria-label="关闭" @click="clearSelection">
				<Icon :icon="closeIcon" aria-hidden="true" />
			</button>
		</div>
		<div class="wiki-map-card-meta">
			<span class="wiki-map-badge"><span class="wiki-map-dot" :style="{ background: colorOf(selectedPoi.category) }" />{{ labelOf(selectedPoi.category) }}</span>
			<span class="wiki-map-badge">{{ area?.name }}</span>
		</div>
		<p v-if="selectedPoi.aliases?.length" class="wiki-map-card-alias">
			又称：{{ selectedPoi.aliases.join('、') }}
		</p>
		<p v-if="selectedPoi.description" class="wiki-map-card-desc">
			{{ selectedPoi.description }}
		</p>
		<div class="wiki-map-card-actions">
			<a :href="amapLink(selectedPoi)" target="_blank" rel="noopener">高德导航</a>
			<a :href="baiduLink(selectedPoi)" target="_blank" rel="noopener">百度地图</a>
		</div>
		<a v-if="selectedPoi.link" class="wiki-map-card-link" :href="withBase(selectedPoi.link)">查看相关文章 →</a>
	</aside>

	<div v-if="toast" class="wiki-map-toast">
		{{ toast }}
	</div>
</div>
</template>

<style scoped>
.wiki-map {
	position: relative;
	overflow: hidden;
	width: 100%;
	height: calc(100vh - var(--vp-nav-height));
	min-height: 480px;
	background: var(--vp-c-bg-soft);
	color: var(--vp-c-text-1);
}

@supports (height: 100dvh) {
	.wiki-map {
		height: calc(100dvh - var(--vp-nav-height));
	}
}

.wiki-map-canvas {
	position: absolute;
	inset: 0;
	z-index: 0;
}

.wiki-map.is-picking :deep(.amap-container) {
	cursor: crosshair;
}

.wiki-map-state {
	display: grid;
	place-items: center;
	position: absolute;
	inset: 0;
	padding: 24px;
	font-size: 14px;
	color: var(--vp-c-text-2);
	z-index: 8;
}

.wiki-map-state-card {
	width: min(460px, 100%);
	padding: 20px 22px;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--wiki-radius-large);
	box-shadow: var(--vp-shadow-2);
	background: var(--vp-c-bg);
	line-height: 1.7;
	text-align: left;
}

.wiki-map-state-card h2 {
	margin: 0 0 8px;
	font-size: 16px;
	font-weight: 600;
	color: var(--vp-c-text-1);
}

.wiki-map-state-card p {
	margin: 0;
}

.wiki-map-state-card code {
	padding: 2px 6px;
	border-radius: 6px;
	background: var(--vp-c-default-soft);
	font-size: 12px;
}

.wiki-map-panel {
	display: flex;
	flex-direction: column;
	gap: 10px;
	position: absolute;
	top: 12px;
	left: 12px;
	width: min(320px, calc(100% - 24px));
	padding: 12px;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--wiki-radius-large);
	box-shadow: var(--vp-shadow-2);
	background: color-mix(in srgb, var(--vp-c-bg) 94%, transparent);
	z-index: 5;
}

.wiki-map-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.wiki-map-tab {
	padding: 4px 12px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 999px;
	background: var(--vp-c-bg);
	font-size: 13px;
	color: var(--vp-c-text-1);
	transition: background var(--wiki-duration), border-color var(--wiki-duration), color var(--wiki-duration);
	cursor: pointer;
}

.wiki-map-tab:hover {
	border-color: var(--vp-c-brand-1);
}

.wiki-map-tab.is-active {
	border-color: var(--vp-c-brand-1);
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
}

.wiki-map-search {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--wiki-radius);
	background: var(--vp-c-bg);
	color: var(--vp-c-text-3);
}

.wiki-map-search input {
	flex: 1;
	min-width: 0;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: var(--vp-c-text-1);
}

.wiki-map-results {
	display: flex;
	flex-direction: column;
	gap: 2px;
	overflow-y: auto;
	max-height: 220px;
	margin: 0;
	padding: 6px 0 0;
	border-top: 1px solid var(--vp-c-divider);
	list-style: none;
}

.wiki-map-results button {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	padding: 6px 8px;
	border: none;
	border-radius: var(--wiki-radius-small);
	background: transparent;
	font-size: 13px;
	text-align: left;
	color: var(--vp-c-text-1);
	cursor: pointer;
}

.wiki-map-results button:hover {
	background: var(--vp-c-default-soft);
}

.wiki-map-result-name {
	flex: 1;
}

.wiki-map-result-cat {
	font-size: 12px;
	color: var(--vp-c-text-3);
}

.wiki-map-chips {
	display: flex;
	gap: 6px;
	position: absolute;
	bottom: 12px;
	left: 50%;
	max-width: calc(100% - 24px);
	padding: 4px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 999px;
	box-shadow: var(--vp-shadow-2);
	background: color-mix(in srgb, var(--vp-c-bg) 92%, transparent);
	transform: translateX(-50%);
	z-index: 5;
}

.wiki-map-chip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 5px 12px;
	border: none;
	border-radius: 999px;
	background: transparent;
	font-size: 12px;
	white-space: nowrap;
	color: var(--vp-c-text-2);
	transition: background var(--wiki-duration), color var(--wiki-duration);
	cursor: pointer;
}

.wiki-map-chip:hover {
	background: var(--vp-c-default-soft);
	color: var(--vp-c-text-1);
}

.wiki-map-chip.is-active {
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
}

.wiki-map-dot {
	flex: none;
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

.wiki-map-tools {
	display: flex;
	gap: 8px;
	position: absolute;
	top: 12px;
	right: 12px;
	z-index: 5;
}

.wiki-map-tool {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 999px;
	box-shadow: var(--vp-shadow-2);
	background: color-mix(in srgb, var(--vp-c-bg) 94%, transparent);
	font-size: 13px;
	color: var(--vp-c-text-1);
	cursor: pointer;
}

.wiki-map-tool.is-active {
	border-color: var(--vp-c-brand-1);
	color: var(--vp-c-brand-1);
}

.wiki-map-card {
	position: absolute;
	right: 12px;
	bottom: 12px;
	width: min(340px, calc(100% - 24px));
	padding: 14px 16px 12px;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--wiki-radius-large);
	box-shadow: var(--vp-shadow-3);
	background: var(--vp-c-bg);
	z-index: 6;
}

.wiki-map-card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.wiki-map-card-head strong {
	font-size: 15px;
}

.wiki-map-card-head button {
	display: inline-flex;
	padding: 2px;
	border: none;
	background: transparent;
	color: var(--vp-c-text-2);
	cursor: pointer;
}

.wiki-map-card-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 8px;
}

.wiki-map-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 2px 10px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 999px;
	font-size: 12px;
	color: var(--vp-c-text-2);
}

.wiki-map-card-alias {
	margin: 8px 0 0;
	font-size: 13px;
	line-height: 1.7;
	color: var(--vp-c-text-2);
}

.wiki-map-card-desc {
	margin: 8px 0 0;
	font-size: 13px;
	line-height: 1.7;
	color: var(--vp-c-text-2);
}

.wiki-map-card-actions {
	display: flex;
	gap: 8px;
	margin-top: 12px;
}

.wiki-map-card-actions a {
	display: inline-flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	gap: 4px;
	padding: 6px 0;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--wiki-radius-small);
	background: var(--vp-c-bg-soft);
	font-size: 13px;
	text-decoration: none;
	color: var(--vp-c-text-1);
	cursor: pointer;
}

.wiki-map-card-actions a:hover {
	border-color: var(--vp-c-brand-1);
	color: var(--vp-c-brand-1);
}

.wiki-map-card-link {
	display: inline-block;
	margin-top: 10px;
	font-size: 13px;
}

.wiki-map-pick {
	display: flex;
	flex-direction: column;
	gap: 8px;
	position: absolute;
	top: 12px;
	left: 12px;
	width: min(320px, calc(100% - 24px));
	padding: 12px;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--wiki-radius-large);
	box-shadow: var(--vp-shadow-2);
	background: var(--vp-c-bg);
	font-size: 13px;
	z-index: 6;
}

.wiki-map-pick-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.wiki-map-pick-head button {
	display: inline-flex;
	border: none;
	background: transparent;
	color: var(--vp-c-text-2);
	cursor: pointer;
}

.wiki-map-pick-tip {
	margin: 0;
	line-height: 1.6;
	color: var(--vp-c-text-2);
}

.wiki-map-pick-coord {
	margin: 0;
	font-family: var(--vp-font-family-mono);
	font-size: 13px;
}

.wiki-map-pick input,
.wiki-map-pick select,
.wiki-map-pick textarea {
	width: 100%;
	padding: 6px 8px;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--wiki-radius-small);
	box-sizing: border-box;
	background: var(--vp-c-bg-soft);
	font-size: 13px;
	color: var(--vp-c-text-1);
}

.wiki-map-pick textarea {
	height: 72px;
	font-family: var(--vp-font-family-mono);
	font-size: 12px;
	resize: vertical;
}

.wiki-map-pick-actions {
	display: flex;
	gap: 8px;
}

.wiki-map-pick-actions button {
	flex: 1;
	padding: 6px 0;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--wiki-radius-small);
	background: var(--vp-c-bg-soft);
	font-size: 13px;
	color: var(--vp-c-text-1);
	cursor: pointer;
}

.wiki-map-toast {
	position: absolute;
	bottom: 56px;
	left: 50%;
	padding: 6px 14px;
	border-radius: 999px;
	box-shadow: var(--vp-shadow-2);
	background: var(--vp-c-text-1);
	font-size: 13px;
	color: var(--vp-c-bg);
	transform: translateX(-50%);
	z-index: 10;
}

@media (max-width: 720px) {
	.wiki-map-chips {
		justify-content: flex-start;
		overflow-x: auto;
		right: 12px;
		left: 12px;
		transform: none;
		scrollbar-width: none;
	}

	.wiki-map-chips::-webkit-scrollbar {
		display: none;
	}

	.wiki-map-tools {
		top: auto;
		bottom: 64px;
	}

	.wiki-map-card {
		right: 0;
		bottom: 0;
		left: 0;
		width: 100%;
		padding-bottom: 18px;
		border-radius: var(--wiki-radius-large) var(--wiki-radius-large) 0 0;
	}
}
</style>

<style>
/*
 * 图钉、拾取点和定位点是脚本动态创建的高德覆盖物 DOM，
 * 不会带上 <style scoped> 编译出的 data-v 作用域属性，因此这批样式
 * 必须放在非 scoped 块里，否则浏览器会按默认样式渲染（黑色填充 + 文字竖排）。
 */
.wiki-map-pin {
	display: flex;
	align-items: flex-end;
	justify-content: center;
	position: relative;
	width: 28px;
	height: 28px;
	cursor: pointer;
	pointer-events: auto;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
}

/* 未选中：小圆点；中心与图钉尖端对齐，切换时不会跳动 */
.wiki-map-pin-dot {
	position: absolute;
	top: calc(100% - 2px);
	left: 50%;
	width: 10px;
	height: 10px;
	border: 2px solid #FFF;
	border-radius: 50%;
	box-shadow: 0 1px 4px rgb(15 23 42 / 0.35);
	background: var(--pin-color);
	transform: translate(-50%, -50%);
	transition: transform 0.2s ease-out, opacity 0.15s ease-out;
}

.wiki-map-pin.is-hover .wiki-map-pin-dot {
	transform: translate(-50%, -50%) scale(1.35);
}

.wiki-map-pin.is-active .wiki-map-pin-dot {
	opacity: 0;
}

/* 未选中时隐藏，选中后从圆点位置弹出；以图钉尖端为缩放原点，不会产生位移 */
.wiki-map-pin-body {
	position: relative;
	visibility: hidden;
	opacity: 0;
	width: 28px;
	height: 28px;
	transform: scale(0.5);
	transform-origin: 50% 92%;
	transition: transform 0.2s ease-out, opacity 0.15s ease-out, visibility 0s linear 0.15s;
}

.wiki-map-pin-shape {
	position: absolute;
	inset: 0;
	width: 28px;
	height: 28px;
	transition: fill 160ms ease;
	filter: drop-shadow(0 1px 2px rgb(15 23 42 / 0.2));
	fill: var(--pin-color);
	stroke: rgb(255 255 255 / 0.9);
	stroke-width: 1;
	stroke-linejoin: round;
}

.wiki-map-pin.is-active .wiki-map-pin-shape {
	fill: color-mix(in srgb, var(--pin-color) 78%, #FFF);
}

.wiki-map-pin-glyph {
	display: grid;
	place-items: center;
	position: absolute;
	top: 38%;
	left: 50%;
	color: #FFF;
	transform: translate(-50%, -50%);
}

.wiki-map-pin-glyph svg {
	display: block;
	width: 11px;
	height: 11px;
}

.wiki-map-pin.is-active .wiki-map-pin-body {
	visibility: visible;
	opacity: 1;
	transform: scale(1.4);
	transition: transform 0.2s ease-out, opacity 0.15s ease-out, visibility 0s;
}

/* 名称固定显示在标记正下方，横向一行；浅色底胶囊保证压在底图上也能看清 */
.wiki-map-pin-label {
	position: absolute;
	top: calc(100% + 7px);
	left: 50%;
	padding: 0 6px;
	border-radius: 6px;
	box-shadow: 0 1px 4px rgb(15 23 42 / 0.16);
	background: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
	font-size: 11px;
	font-weight: 500;
	line-height: 1.5;
	white-space: nowrap;
	color: var(--vp-c-text-1);
	transform: translateX(-50%);
	pointer-events: none;
}

.wiki-map-pin.is-hover .wiki-map-pin-label,
.wiki-map-pin.is-active .wiki-map-pin-label {
	color: var(--vp-c-brand-1);
}

.wiki-map-pick-pin {
	width: 16px;
	height: 16px;
	border: 3px solid #FFF;
	border-radius: 50%;
	box-shadow: 0 0 0 3px rgb(239 68 68 / 0.35), 0 3px 8px rgb(0 0 0 / 0.3);
	background: #EF4444;
}

.wiki-map-user-pin {
	width: 14px;
	height: 14px;
	border: 3px solid #FFF;
	border-radius: 50%;
	box-shadow: 0 0 0 3px rgb(47 124 246 / 0.35), 0 3px 8px rgb(0 0 0 / 0.3);
	background: #2F7CF6;
}
</style>
