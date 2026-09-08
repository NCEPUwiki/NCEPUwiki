<script setup lang="ts">
import type { Article, IndexMode } from '../../types'
import gridIcon from '@iconify-icons/ri/grid-line'
import listIcon from '@iconify-icons/ri/list-check'
import { Icon } from '@iconify/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { data } from '../catalog.data'
import { tagChips } from '../chips'
import ArticleByline from './ArticleByline.vue'
import WikiChips from './WikiChips.vue'

const props = withDefaults(defineProps<{ mode?: IndexMode, category?: string }>(), { mode: 'archives', category: '' })
const selected = ref(props.category)
const view = ref('cards')
const query = ref('')
const key = computed(() => props.mode === 'categories' ? 'category' : 'tag')
const choices = computed(() => props.mode === 'archives' ? [] : data[props.mode])
function readQuery() {
	const params = new URLSearchParams(window.location.search)
	selected.value = props.category || params.get(key.value) || ''
	query.value = params.get('q') || ''
}
function updateQuery(value = selected.value, replace = false) {
	selected.value = value
	const params = new URLSearchParams()
	if (value && !props.category)
		params.set(key.value, value)
	if (query.value)
		params.set('q', query.value)
	window.history[replace ? 'replaceState' : 'pushState']({}, '', window.location.pathname + (params.size ? `?${params}` : ''))
}
onMounted(() => {
	readQuery()
	window.addEventListener('popstate', readQuery)
	window.addEventListener('wiki:route-change', readQuery)
})
onUnmounted(() => {
	window.removeEventListener('popstate', readQuery)
	window.removeEventListener('wiki:route-change', readQuery)
})
const articles = computed(() => data.articles.filter((article) => {
	const matches = !selected.value || props.mode === 'archives' || article[props.mode].includes(selected.value)
	const text = [article.title, ...article.categories, ...article.tags].join(' ').toLocaleLowerCase()
	return matches && text.includes(query.value.trim().toLocaleLowerCase())
}).sort((a, b) => b.updatedTime - a.updatedTime || b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'zh-CN')))
const groups = computed(() => {
	const result = new Map<string, Article[]>()
	for (const article of articles.value) {
		const group = props.mode === 'archives' ? (article.updated.slice(0, 7) || '日期待补充') : article.folders[0]
		if (!result.has(group))
			result.set(group, [])
		result.get(group)!.push(article)
	}
	return [...result]
})
</script>

<template>
<div class="article-index">
	<WikiChips
		v-if="choices.length && !category"
		:items="[{ text: '全部', value: '', count: data.articles.length }, ...choices.map(choice => ({ text: `${mode === 'tags' ? '# ' : ''}${choice.name}`, value: choice.name, count: choice.count }))]"
		:selected="selected"
		label="筛选文章"
		@select="updateQuery"
	/>
	<div class="index-controls">
		<input v-model="query" type="search" aria-label="筛选标题、分类或标签" placeholder="筛选标题、分类或标签…" @input="updateQuery(selected, true)">
		<div class="layout-switch" aria-label="文章展示形式">
			<button :aria-pressed="view === 'cards'" aria-label="卡片视图" @click="view = 'cards'">
				<Icon :icon="gridIcon" />
			</button>
			<button :aria-pressed="view === 'list'" aria-label="列表视图" @click="view = 'list'">
				<Icon :icon="listIcon" />
			</button>
		</div>
	</div>

	<p v-if="!articles.length" class="empty-state">
		没有找到符合条件的文章。<button @click="query = ''; updateQuery('')">
			清除筛选
		</button>
	</p>
	<section v-for="[name, list] in groups" :key="name">
		<div class="index-section-heading">
			<h2>{{ name }} <span class="section-count">{{ list.length }}</span></h2>
		</div>
		<ul class="article-list" :class="{ 'article-cards': view === 'cards' }">
			<li v-for="article in list" :key="article.url">
				<div class="index-item-content">
					<a class="article-title" :href="article.url">{{ article.title }}</a>
					<WikiChips :items="tagChips(article.tags)" class="tags" label="文章标签" />
				</div>
				<ArticleByline :date="article.updated" :author="article.author" />
			</li>
		</ul>
	</section>
</div>
</template>
