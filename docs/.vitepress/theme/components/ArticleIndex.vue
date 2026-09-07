<script setup lang="ts">
import type { Article, IndexMode } from '../../types'
import gridIcon from '@iconify-icons/ri/grid-line'
import listIcon from '@iconify-icons/ri/list-check'
import { Icon } from '@iconify/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { data } from '../catalog.data'

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
	<div v-if="choices.length && !category" class="chips filters" aria-label="筛选文章">
		<button :aria-pressed="!selected" @click="updateQuery('')">
			全部 {{ data.articles.length }}
		</button>
		<button v-for="choice in choices" :key="choice.name" :aria-pressed="selected === choice.name" @click="updateQuery(choice.name)">
			{{ mode === 'tags' ? '# ' : '' }}{{ choice.name }} <span>{{ choice.count }}</span>
		</button>
	</div>
	<label class="index-search">筛选标题、分类或标签
		<input v-model="query" type="search" placeholder="输入关键词…" @input="updateQuery(selected, true)">
	</label>

	<p v-if="!articles.length" class="empty-state">
		没有找到符合条件的文章。<button @click="query = ''; updateQuery('')">
			清除筛选
		</button>
	</p>
	<section v-for="[name, list] in groups" :key="name">
		<div class="index-section-heading">
			<h2>{{ name }} <span class="section-count">{{ list.length }}</span></h2><div class="layout-switch" :aria-label="`${name}展示形式`">
				<button :aria-pressed="view === 'cards'" aria-label="卡片视图" @click="view = 'cards'">
					<Icon :icon="gridIcon" />
				</button><button :aria-pressed="view === 'list'" aria-label="列表视图" @click="view = 'list'">
					<Icon :icon="listIcon" />
				</button>
			</div>
		</div>
		<ul class="article-list" :class="{ 'article-cards': view === 'cards' }">
			<li v-for="article in list" :key="article.url">
				<a :href="article.url">{{ article.title }}</a>
				<time v-if="article.updated" :datetime="article.updated">{{ article.updated }}</time>
				<div class="chips tags">
					<a v-for="tag in article.tags" :key="tag" :href="`/tags/?tag=${encodeURIComponent(tag)}`"># {{ tag }}</a>
				</div>
			</li>
		</ul>
	</section>
</div>
</template>
