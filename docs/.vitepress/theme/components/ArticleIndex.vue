<script setup lang="ts">
import type { Article, IndexMode } from '../../types'
import gridIcon from '@iconify-icons/ri/grid-line'
import listIcon from '@iconify-icons/ri/list-check'
import { Icon } from '@iconify/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { categoryChildren, resolveCategory } from '../../category'
import { data } from '../catalog.data'
import { tagChips } from '../chips'
import ArticleByline from './ArticleByline.vue'
import WikiChips from './WikiChips.vue'

const props = withDefaults(defineProps<{ mode?: IndexMode, category?: string }>(), { mode: 'archives', category: '' })
const selected = ref(props.category)
const view = ref('cards')
const query = ref('')
const key = computed(() => props.mode === 'categories' ? 'category' : 'tag')
// 分类做成层级后，筛选栏只列最上层的分类，子分类通过下面的“子分类”行逐级进入。
const choices = computed(() => {
	if (props.mode === 'archives')
		return []
	if (props.mode === 'tags')
		return data.tags
	return data.categories.filter(category => !category.path.includes('/'))
})
/** 选中的分类路径，兼容只写末级名字的旧链接（例如 ?category=学习资料）。 */
const activeCategory = computed(() => props.mode === 'categories' ? resolveCategory(data.categories, selected.value) : selected.value)
/** 当前分类的下一级分类，以和文章一样的条目形式排在文章列表最前面。 */
const childEntries = computed(() => {
	if (props.mode !== 'categories' || !activeCategory.value)
		return []
	return categoryChildren(data.categories, activeCategory.value).map(category => ({
		name: category.name,
		href: `/categories/?category=${encodeURIComponent(category.path)}`,
	}))
})
/** 分组里只有当组正是当前分类时才排子分类条目。 */
const childEntriesOf = (group: string) => group === activeCategory.value ? childEntries.value : []
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
	// 分类按完整路径精确匹配：查看上级分类时不会再带出子分类的文章
	const matches = props.mode === 'archives'
		? true
		: props.mode === 'categories'
			? !activeCategory.value || article.categories.includes(activeCategory.value)
			: !selected.value || article.tags.includes(selected.value)
	const text = [article.title, ...article.categories, ...article.tags].join(' ').toLocaleLowerCase()
	return matches && text.includes(query.value.trim().toLocaleLowerCase())
}).sort((a, b) => (b.lastUpdated || b.date).localeCompare(a.lastUpdated || a.date) || a.title.localeCompare(b.title, 'zh-CN')))
const groups = computed(() => {
	const result = new Map<string, Article[]>()
	// 选中分类后先建好这一组：即使它还没有直属文章，子分类条目也要有地方显示
	if (props.mode === 'categories' && activeCategory.value)
		result.set(activeCategory.value, [])
	for (const article of articles.value) {
		const group = props.mode === 'archives'
			? ((article.lastUpdated || article.date).slice(0, 7) || '日期待补充')
			// 选中分类后，这一组就是这个分类本身；否则按文章所属的最上层分类分组
			: props.mode === 'categories' && activeCategory.value
				? activeCategory.value
				: (article.categories[0] || '').split('/')[0] || '未分类'
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

	<p v-if="!articles.length && (!childEntries.length || query.trim())" class="empty-state">
		没有找到符合条件的文章。<button @click="query = ''; updateQuery('')">
			清除筛选
		</button>
	</p>
	<section v-for="[name, list] in groups" :key="name">
		<div class="index-section-heading">
			<h2>{{ name }} <span class="section-count">{{ list.length }}</span></h2>
		</div>
		<ul class="article-list" :class="{ 'article-cards': view === 'cards' }">
			<li v-for="entry in childEntriesOf(name)" :key="entry.href">
				<div class="index-item-content">
					<a class="article-title" :href="entry.href">{{ entry.name }}</a>
					<span class="article-kind">子分类</span>
				</div>
			</li>
			<li v-for="article in list" :key="article.url">
				<div class="index-item-content">
					<a class="article-title" :href="article.url">{{ article.title }}</a>
					<WikiChips :items="tagChips(article.tags)" class="tags" label="文章标签" />
				</div>
				<!-- 索引页只显示日期，作者留在文章页页尾 -->
				<ArticleByline :date="article.lastUpdated || article.date" />
			</li>
		</ul>
	</section>
</div>
</template>
