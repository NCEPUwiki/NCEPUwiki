<script setup lang="ts">
import timeIcon from '@iconify-icons/ri/time-line'
import { Icon } from '@iconify/vue'
import { useData } from 'vitepress'
import { computed } from 'vue'
import { tagChips } from '../chips'
import WikiChips from './WikiChips.vue'

const { frontmatter: fm } = useData()
const date = computed(() => fm.value.date ? new Date(fm.value.date).toISOString().slice(0, 10) : '')
// 分类来自 frontmatter，面包屑用最具体的那条分类路径，每一级都指向完整路径
const breadcrumbs = computed(() => {
	const paths: string[] = fm.value.categories || []
	const segments = [...paths].sort((a, b) => b.split('/').length - a.split('/').length)[0]?.split('/').filter(Boolean) || []
	return segments.map((name, depth) => ({ name, href: `/categories/?category=${encodeURIComponent(segments.slice(0, depth + 1).join('/'))}` }))
})
</script>

<template>
<div v-if="date || breadcrumbs.length || fm.tags?.length || fm.empty" class="article-meta vp-doc">
	<nav v-if="breadcrumbs.length" class="article-breadcrumbs" aria-label="文章分类">
		<ol>
			<li v-for="item in breadcrumbs" :key="item.name">
				<a :href="item.href">{{ item.name }}</a>
			</li>
		</ol>
	</nav>
	<div v-if="date" class="article-byline">
		<span class="article-date">
			<Icon :icon="timeIcon" aria-hidden="true" />
			<time :datetime="date">{{ date }}</time>
		</span>
	</div>
	<WikiChips :items="tagChips(fm.tags || [])" class="tags" label="文章标签" />
	<p v-if="fm.empty" class="empty-state">
		这篇条目正在等待补充，欢迎通过页末源代码链接参与共建。
	</p>
</div>
</template>
