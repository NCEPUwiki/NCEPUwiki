<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter: fm } = useData()
</script>

<template>
<div v-if="fm.categories?.length || fm.articleHeader" class="article-meta vp-doc">
	<div class="chips" aria-label="文章分类">
		<a v-for="category in fm.categories" :key="category" :href="`/categories/?category=${encodeURIComponent(category)}`">{{ category }}</a>
	</div>
	<h1 v-if="fm.articleHeader" id="article-title">
		{{ fm.title }}
	</h1>
	<div class="chips tags" aria-label="文章标签">
		<a v-for="tag in fm.tags" :key="tag" :href="`/tags/?tag=${encodeURIComponent(tag)}`"># {{ tag }}</a>
	</div>
	<p v-if="fm.author" class="muted">
		作者：{{ typeof fm.author === 'string' ? fm.author : fm.author.name }}
	</p>
	<p v-if="fm.empty" class="empty-state">
		这篇条目正在等待补充，欢迎点击页末编辑链接参与共建。
	</p>
</div>
</template>
