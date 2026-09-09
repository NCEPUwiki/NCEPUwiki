import type { Theme } from 'vitepress'
import type { Component } from 'vue'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { defineAsyncComponent } from 'vue'
import ArticleIndex from './components/ArticleIndex.vue'
import CopyContact from './components/CopyContact.vue'
import DownloadPageImage from './components/DownloadPageImage.vue'
import FriendLinks from './components/FriendLinks.vue'
import GroupAvatar from './components/GroupAvatar.vue'
import HoverMedia from './components/HoverMedia.vue'
import QrCode from './components/QrCode.vue'
import WidePage from './components/WidePage.vue'
import WikiHome from './components/WikiHome.vue'
import WikiLayout from './components/WikiLayout.vue'
import '@vitepress-plugin/markmap/style.css'
import './styles/index.css'

const CARD_LAYOUT_KEY = 'ncepu-wiki:cardlist-layout'
const CARD_LAYOUT_VALUES = ['cards', 'compact', 'table'] as const
type CardLayout = typeof CARD_LAYOUT_VALUES[number]

function isCardLayout(value: string | null | undefined): value is CardLayout {
	return typeof value === 'string' && (CARD_LAYOUT_VALUES as readonly string[]).includes(value)
}

/** 未主动选择时：手机默认紧凑小卡，桌面保持原有卡片。 */
function defaultCardLayout(): CardLayout {
	return window.matchMedia('(max-width: 640px)').matches ? 'compact' : 'cards'
}

function readCardLayout(): CardLayout {
	const saved = localStorage.getItem(CARD_LAYOUT_KEY)
	return isCardLayout(saved) ? saved : defaultCardLayout()
}

function applyCardLayout(layout: CardLayout) {
	document.documentElement.dataset.wikiCardlistLayout = layout
}

function syncCardLayout() {
	if (typeof window === 'undefined' || typeof document === 'undefined')
		return
	try {
		applyCardLayout(readCardLayout())
	}
	catch {
		applyCardLayout(defaultCardLayout())
	}
}

export default {
	extends: DefaultTheme,
	Layout: WikiLayout,
	enhanceApp({ app, router }) {
		// VitePress 2 no longer exposes the plugin's automatic registration marker.
		app.component('markmap', defineAsyncComponent(async () => (await import('@vitepress-plugin/markmap/markmap')).default as unknown as Component))
		app.component('WikiHome', WikiHome)
		app.component('wide', WidePage)
		app.component('GroupAvatar', GroupAvatar)
		app.component('HoverMedia', HoverMedia)
		app.component('FriendLinks', FriendLinks)
		app.component('CopyContact', CopyContact)
		app.component('QrCode', QrCode)
		app.component('ArticleIndex', ArticleIndex)
		app.component('DownloadPageImage', DownloadPageImage)
		router.onAfterRouteChange = () => {
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new Event('wiki:route-change'))
				syncCardLayout()
			}
		}
		if (typeof document !== 'undefined') {
			syncCardLayout()
			const cardMobileQuery = window.matchMedia('(max-width: 640px)')
			cardMobileQuery.addEventListener('change', () => {
				// 仅在用户没有主动选择时跟随默认布局（手机/桌面）
				if (!localStorage.getItem(CARD_LAYOUT_KEY))
					syncCardLayout()
			})
			document.addEventListener('click', (event) => {
				const target = event.target
				if (!(target instanceof Element))
					return
				const button = target.closest<HTMLButtonElement>('button[data-wiki-cardlist-layout]')
				if (!button)
					return
				const layout = button.dataset.wikiCardlistLayout
				if (isCardLayout(layout)) {
					try {
						localStorage.setItem(CARD_LAYOUT_KEY, layout)
					}
					catch {
						// 隐私模式等场景下无法持久化也不影响本次切换
					}
					applyCardLayout(layout)
				}
			})
			document.addEventListener('click', (event) => {
				const target = event.target
				if (!(target instanceof Element))
					return
				const image = target.closest('img')
				if (!image || !image.closest('.vp-doc'))
					return
				if (image.closest('a'))
					return
				const src = image.currentSrc || image.src
				if (!src || src.startsWith('blob:'))
					return
				event.preventDefault()
				window.open(src, '_blank', 'noopener')
			})
		}
	},
} satisfies Theme
