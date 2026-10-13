/**
 * 高德 JS API v2 的最小封装：按需加载脚本，只声明项目实际用到的 API。
 */
import type { LngLat } from './map-types.ts'
import { amapConfig } from './map-config.ts'

export interface AmapLngLat {
	getLng: () => number
	getLat: () => number
}

export interface AmapMap {
	add: (overlays: AmapOverlay | AmapOverlay[]) => void
	remove: (overlays: AmapOverlay | AmapOverlay[]) => void
	setZoomAndCenter: (zoom: number, center: LngLat, immediately?: boolean, duration?: number) => void
	setCenter: (center: LngLat, immediately?: boolean, duration?: number) => void
	getCenter: () => AmapLngLat
	setMapStyle: (style: string) => void
	addControl: (control: unknown) => void
	on: (event: 'click', handler: (event: { lnglat: AmapLngLat }) => void) => void
	destroy: () => void
}

export interface AmapMarker {
	on: (event: 'click' | 'mouseover' | 'mouseout', handler: () => void) => void
	show: () => void
	hide: () => void
	setzIndex?: (zIndex: number) => void
}

export interface AmapPolygon {
	setOptions?: (options: Record<string, unknown>) => void
}

export type AmapOverlay = AmapMarker | AmapPolygon

export interface AmapGeolocation {
	getCurrentPosition: (callback: (status: string, result: { position?: AmapLngLat }) => void) => void
}

export interface AmapNamespace {
	Map: new (container: HTMLElement, options: Record<string, unknown>) => AmapMap
	Marker: new (options: Record<string, unknown>) => AmapMarker
	Polygon: new (options: Record<string, unknown>) => AmapPolygon
	Geolocation: new (options?: Record<string, unknown>) => AmapGeolocation
	Scale: new (options?: Record<string, unknown>) => unknown
	plugin: (plugins: string[], callback: () => void) => void
}

declare global {
	interface Window {
		AMap?: AmapNamespace
		_AMapSecurityConfig?: { securityJsCode: string }
	}
}

let loader: Promise<AmapNamespace> | null = null

/** 高德 Key 是否已配置。 */
export function amapConfigured(): boolean {
	return Boolean(amapConfig.key)
}

/** 按需注入高德脚本，多个组件共享同一个加载 Promise。 */
export function loadAmap(): Promise<AmapNamespace> {
	if (typeof window === 'undefined')
		return Promise.reject(new Error('高德地图只能在浏览器中加载'))
	if (window.AMap)
		return Promise.resolve(window.AMap)
	if (loader)
		return loader
	loader = new Promise<AmapNamespace>((resolve, reject) => {
		if (!amapConfig.key) {
			reject(new Error('尚未配置高德地图 Key'))
			return
		}
		if (amapConfig.securityJsCode)
			window._AMapSecurityConfig = { securityJsCode: amapConfig.securityJsCode }
		const callbackName = '__ncepuwikiAmapReady'
		const scope = window as unknown as Record<string, unknown>
		scope[callbackName] = () => {
			delete scope[callbackName]
			if (window.AMap)
				resolve(window.AMap)
			else
				reject(new Error('高德地图初始化失败'))
		}
		const script = document.createElement('script')
		script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(amapConfig.key)}&callback=${callbackName}`
		script.async = true
		script.onerror = () => reject(new Error('高德地图脚本加载失败'))
		document.head.append(script)
	})
	return loader
}
