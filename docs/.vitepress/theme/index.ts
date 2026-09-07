import type { Theme } from 'vitepress'
import type { Component } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'
import ArticleIndex from './components/ArticleIndex.vue'
import CopyContact from './components/CopyContact.vue'
import DirectoryTree from './components/DirectoryTree.vue'
import DirectoryTrigger from './components/DirectoryTrigger.vue'
import DownloadPageImage from './components/DownloadPageImage.vue'
import FriendLinks from './components/FriendLinks.vue'
import GroupAvatar from './components/GroupAvatar.vue'
import HoverMedia from './components/HoverMedia.vue'
import QrCode from './components/QrCode.vue'
import WidePage from './components/WidePage.vue'
import WikiHome from './components/WikiHome.vue'
import WikiLayout from './components/WikiLayout.vue'
import { directoryOpen } from './directory'
import '@vitepress-plugin/markmap/style.css'
import './styles/index.css'

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
		app.component('DirectoryTrigger', DirectoryTrigger)
		app.component('QrCode', QrCode)
		app.component('ArticleIndex', ArticleIndex)
		app.component('DirectoryTree', DirectoryTree)
		app.component('DownloadPageImage', DownloadPageImage)
		router.onAfterRouteChange = () => {
			directoryOpen.value = false
			if (typeof window !== 'undefined')
				window.dispatchEvent(new Event('wiki:route-change'))
		}
	},
} satisfies Theme
