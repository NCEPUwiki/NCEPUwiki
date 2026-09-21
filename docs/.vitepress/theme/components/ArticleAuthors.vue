<script setup lang="ts">
import type { Author } from '../../types.ts'
import userIcon from '@iconify-icons/ri/user-line'
import { Icon } from '@iconify/vue'
import { useData } from 'vitepress'
import { computed } from 'vue'
import AuthorAvatar from './AuthorAvatar.vue'

const { frontmatter } = useData()
/** 由 config.transformPageData 写入：frontmatter 作者与 Git 提交历史作者去重后的完整列表。 */
const authors = computed<Author[]>(() => Array.isArray(frontmatter.value.authors) ? frontmatter.value.authors as Author[] : [])
</script>

<template>
<section v-if="authors.length" class="article-authors" aria-labelledby="article-authors-title">
	<h2 id="article-authors-title" class="article-authors-title">
		<Icon :icon="userIcon" aria-hidden="true" />本文作者
	</h2>
	<ul class="article-authors-list">
		<li v-for="(author, index) in authors" :key="`${author.name}-${author.email || index}`" class="article-author-item" :title="author.commits ? `${author.name} · ${author.commits} 次提交` : author.name">
			<AuthorAvatar :name="author.name" :avatar="author.avatar" :fallback="author.fallback" />
			<span class="article-author-body">
				<a v-if="author.url" class="article-author-name" :href="author.url" target="_blank" rel="noopener noreferrer">{{ author.name }}</a>
				<span v-else class="article-author-name">{{ author.name }}</span>
				<span v-if="author.email" class="article-author-email">{{ author.email }}</span>
			</span>
		</li>
	</ul>
</section>
</template>
