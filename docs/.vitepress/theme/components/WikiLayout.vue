<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { onMounted, watch } from 'vue'
import ArticleMeta from './ArticleMeta.vue'
import DirectoryModal from './DirectoryModal.vue'
import DirectoryTrigger from './DirectoryTrigger.vue'
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
	<template #nav-bar-title-before>
		<SiteIcon class="site-icon" />
	</template>
	<template #sidebar-nav-before>
		<DirectoryTrigger />
	</template>
	<template #doc-before>
		<ArticleMeta />
	</template>
</DefaultTheme.Layout>
<DirectoryModal />
</template>
