<script setup lang="ts">
import sidebarFoldIcon from '@iconify-icons/ri/sidebar-fold-line'
import sidebarUnfoldIcon from '@iconify-icons/ri/sidebar-unfold-line'
import { Icon } from '@iconify/vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { onMounted, ref, watch } from 'vue'
import { applySidebarCollapsed, readSidebarCollapsed, SIDEBAR_COLLAPSED_KEY } from '../sidebar'
import ArticleAuthors from './ArticleAuthors.vue'
import ArticleMeta from './ArticleMeta.vue'
import SiteIcon from './SiteIcon.vue'

const { isDark } = useData()
const sidebarCollapsed = ref(false)
function toggleSidebar() {
	sidebarCollapsed.value = !sidebarCollapsed.value
	applySidebarCollapsed(sidebarCollapsed.value)
	try {
		localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed.value ? '1' : '0')
	}
	catch {
		// 隐私模式等场景下无法持久化，不影响本次切换
	}
}
onMounted(() => {
	sidebarCollapsed.value = readSidebarCollapsed()
	watch(isDark, (dark) => {
		document.querySelectorAll<HTMLLinkElement>('link[data-wiki-icon]').forEach(link => link.href = dark ? '/favicon-dark.svg' : '/favicon-light.svg')
	}, { immediate: true })
})
</script>

<template>
<DefaultTheme.Layout>
	<template #nav-bar-title-before>
		<SiteIcon class="site-icon" />
	</template>
	<template #nav-bar-content-after>
		<button
			class="wiki-sidebar-toggle"
			type="button"
			:title="sidebarCollapsed ? '展开左侧目录' : '收起左侧目录'"
			:aria-label="sidebarCollapsed ? '展开左侧目录' : '收起左侧目录'"
			:aria-expanded="!sidebarCollapsed"
			aria-controls="VPSidebarNav"
			@click="toggleSidebar"
		>
			<Icon :icon="sidebarCollapsed ? sidebarUnfoldIcon : sidebarFoldIcon" aria-hidden="true" />
		</button>
	</template>
	<template #sidebar-nav-before>
		<a class="directory-trigger" href="/categories/">全部目录</a>
	</template>
	<template #doc-footer-before>
		<ArticleMeta />
		<ArticleAuthors />
	</template>
</DefaultTheme.Layout>
</template>
