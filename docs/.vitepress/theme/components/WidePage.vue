<script setup lang="ts">
import { useData } from 'vitepress'
import ArticleDates from './ArticleDates.vue'
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
		<a :href="`https://github.com/NCEPUwiki/NCEPUwiki/blame/main/docs/${page.filePath}`">源代码</a>
		<ArticleDates />
	</footer>
</main>
</template>
