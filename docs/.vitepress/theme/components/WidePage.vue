<script setup lang="ts">
import { useData } from 'vitepress'
import ArticleMeta from './ArticleMeta.vue'

const { page } = useData()
</script>

<template>
<main class="wiki-wide">
	<div class="wiki-article-content vp-doc">
		<ArticleMeta />
		<Content />
	</div>
	<footer class="wide-footer">
		<a :href="`https://github.com/NCEPUwiki/NCEPUwiki/edit/main/docs/${page.filePath}`">在 GitHub 上编辑此页</a>
		<time v-if="page.lastUpdated" :datetime="new Date(page.lastUpdated).toISOString()">内容日期：{{ new Date(page.lastUpdated).toISOString().slice(0, 10) }}</time>
	</footer>
</main>
</template>
