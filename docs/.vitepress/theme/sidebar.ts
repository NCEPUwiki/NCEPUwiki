/**
 * 左侧目录的收放状态。
 *
 * 状态存在 localStorage 里：读文章时收起来一次，之后翻页都保持收起。
 * 是否收起由 <html data-wiki-sidebar="collapsed"> 决定，样式在 cards.css。
 */
export const SIDEBAR_COLLAPSED_KEY = 'ncepu-wiki:sidebar-collapsed'

export function readSidebarCollapsed(): boolean {
	try {
		return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
	}
	catch {
		// 隐私模式等场景下读不到 localStorage，当作没收起
		return false
	}
}

export function applySidebarCollapsed(collapsed: boolean) {
	document.documentElement.dataset.wikiSidebar = collapsed ? 'collapsed' : 'expanded'
}

/** 进页面时尽早套用上次的选择，避免侧边栏先闪一下再收起。 */
export function syncSidebarCollapsed() {
	if (typeof window === 'undefined' || typeof document === 'undefined')
		return
	applySidebarCollapsed(readSidebarCollapsed())
}
