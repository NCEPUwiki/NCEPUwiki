import { ref } from 'vue'

/**
 * 左侧目录的收放状态。
 *
 * 状态存在 localStorage 里：读文章时收起来一次，之后翻页都保持收起。
 * 是否收起由 <html data-wiki-sidebar="collapsed"> 决定，样式在 cards.css；
 * 侧栏顶部的按钮和收起后浮在左边缘的按钮共用这里的 sidebarCollapsed。
 */
export const SIDEBAR_COLLAPSED_KEY = 'ncepu-wiki:sidebar-collapsed'

/** 侧边栏是否收起（两个按钮共用） */
export const sidebarCollapsed = ref(false)

function readSidebarCollapsed(): boolean {
	try {
		return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
	}
	catch {
		// 隐私模式等场景下读不到 localStorage，当作没收起
		return false
	}
}

export function applySidebarCollapsed(collapsed: boolean) {
	sidebarCollapsed.value = collapsed
	document.documentElement.dataset.wikiSidebar = collapsed ? 'collapsed' : 'expanded'
}

export function toggleSidebarCollapsed() {
	const collapsed = !sidebarCollapsed.value
	applySidebarCollapsed(collapsed)
	try {
		localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0')
	}
	catch {
		// 隐私模式等场景下无法持久化，不影响本次切换
	}
}

/** 进页面时尽早套用上次的选择，避免侧边栏先闪一下再收起。 */
export function syncSidebarCollapsed() {
	if (typeof window === 'undefined' || typeof document === 'undefined')
		return
	applySidebarCollapsed(readSidebarCollapsed())
}
