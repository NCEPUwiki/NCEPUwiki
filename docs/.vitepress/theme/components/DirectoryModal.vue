<script setup lang="ts">
import type { DirectoryItem } from '../../types'
import { computed, onUnmounted, ref, watch } from 'vue'
import { data } from '../catalog.data'
import { directoryOpen } from '../directory'
import DirectoryTree from './DirectoryTree.vue'

const dialog = ref<HTMLDialogElement>()
const query = ref('')
const items = computed(() => {
	const term = query.value.trim().toLocaleLowerCase()
	function filter(tree: DirectoryItem[]): DirectoryItem[] {
		return tree.flatMap((item) => {
			if (item.text.toLocaleLowerCase().includes(term))
				return [item]
			const children = filter(item.items || [])
			return children.length ? [{ ...item, items: children }] : []
		})
	}
	return filter(data.tree)
})
let overflow = ''
watch(directoryOpen, (open) => {
	if (open) {
		query.value = ''
		overflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		dialog.value?.showModal()
	}
	else {
		dialog.value?.close()
		document.body.style.overflow = overflow
	}
})
onUnmounted(() => {
	if (directoryOpen.value)
		document.body.style.overflow = overflow
})
</script>

<template>
<dialog ref="dialog" class="directory-modal" aria-labelledby="directory-title" @close="directoryOpen = false" @click="($event.target === dialog) && (directoryOpen = false)">
	<div class="directory-panel">
		<div class="directory-sticky">
			<header>
				<h2 id="directory-title">
					全部目录
				</h2><button aria-label="关闭目录" @click="directoryOpen = false">
					关闭 ×
				</button>
			</header>
			<label class="index-search">查找目录<input v-model="query" type="search" placeholder="输入文章或专题名称…"></label>
		</div>
		<DirectoryTree :items="items" @click="($event.target as HTMLElement).closest('a') && (directoryOpen = false)" />
		<p v-if="!items.length" role="status">
			没有找到相关条目
		</p>
	</div>
</dialog>
</template>
