<script setup lang="ts">
import timeIcon from '@iconify-icons/ri/time-line'
import userIcon from '@iconify-icons/ri/user-line'
import { Icon } from '@iconify/vue'
import { useData } from 'vitepress'
import { computed } from 'vue'
import { tagChips } from '../chips'
import WikiChips from './WikiChips.vue'

const { frontmatter: fm, page } = useData()
const author = computed(() => typeof fm.value.author === 'string' ? fm.value.author : fm.value.author?.name)
const authorUrl = computed(() => typeof fm.value.author === 'object' ? fm.value.author?.url || fm.value.author?.link : undefined)
const date = computed(() => page.value.lastUpdated ? new Date(page.value.lastUpdated).toISOString().slice(0, 10) : '')
</script>

<template>
<div v-if="fm.categories?.length || fm.articleHeader" class="article-meta vp-doc">
	<nav v-if="fm.breadcrumbs?.length" class="article-breadcrumbs" aria-label="文章所在目录">
		<ol>
			<li v-for="category in fm.breadcrumbs" :key="category">
				<a :href="`/categories/?category=${encodeURIComponent(category)}`">{{ category }}</a>
			</li>
		</ol>
	</nav>
	<h1 v-if="fm.articleHeader" id="article-title">
		{{ fm.title }}
	</h1>
	<div v-if="author || date" class="article-byline">
		<span v-if="author" class="article-author">
			<Icon :icon="userIcon" aria-hidden="true" />
			<a v-if="authorUrl" :href="authorUrl" target="_blank" rel="noopener noreferrer">{{ author }}</a>
			<span v-else>{{ author }}</span>
		</span>
		<span v-if="date" class="article-date">
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
