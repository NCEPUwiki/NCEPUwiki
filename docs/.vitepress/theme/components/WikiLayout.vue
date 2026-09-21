<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { onMounted, watch } from 'vue'
import ArticleAuthors from './ArticleAuthors.vue'
import ArticleMeta from './ArticleMeta.vue'
import SidebarToggle from './SidebarToggle.vue'
import SiteIcon from './SiteIcon.vue'

const { isDark } = useData()
onMounted(() => {
	watch(isDark, (dark) => {
		document.querySelectorAll<HTMLLinkElement>('link[data-wiki-icon]').forEach(link => link.href = dark ? '/favicon-dark.svg' : '/favicon-light.svg')
	}, { immediate: true })
})
</script>

<template>
<DefaultTheme.Layout>
	<!-- 目录收起后，左边缘浮一个按钮把它放回来 -->
	<template #layout-top>
		<SidebarToggle class="wiki-sidebar-toggle-floating" />
	</template>
	<template #nav-bar-title-before>
		<SiteIcon class="site-icon" />
	</template>
	<template #sidebar-nav-before>
		<div class="sidebar-top">
			<a class="directory-trigger" href="/categories/">全部分类</a>
			<SidebarToggle />
		</div>
	</template>
	<template #doc-footer-before>
		<ArticleMeta />
		<ArticleAuthors />
	</template>
</DefaultTheme.Layout>
</template>
