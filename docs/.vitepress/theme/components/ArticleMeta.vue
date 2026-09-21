<script setup lang="ts">
import timeIcon from '@iconify-icons/ri/time-line'
import { Icon } from '@iconify/vue'
import { useData } from 'vitepress'
import { computed } from 'vue'
import { tagChips } from '../chips'
import WikiChips from './WikiChips.vue'

const { frontmatter: fm } = useData()
const date = computed(() => fm.value.date ? new Date(fm.value.date).toISOString().slice(0, 10) : '')
</script>

<template>
<div v-if="fm.categories?.length" class="article-meta vp-doc">
	<nav v-if="fm.breadcrumbs?.length" class="article-breadcrumbs" aria-label="文章所在目录">
		<ol>
			<li v-for="category in fm.breadcrumbs" :key="category">
				<a :href="`/categories/?category=${encodeURIComponent(category)}`">{{ category }}</a>
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
