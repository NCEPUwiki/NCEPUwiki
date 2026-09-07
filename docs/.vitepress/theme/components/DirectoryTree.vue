<script setup lang="ts">
import type { DirectoryItem } from '../../types'
import { data } from '../catalog.data'

withDefaults(defineProps<{ items?: DirectoryItem[] }>(), { items: () => data.tree })
</script>

<template>
<ul class="directory-tree">
	<li v-for="item in items" :key="item.link || item.text">
		<a v-if="item.link" :href="item.link">{{ item.text }}</a>
		<details v-else open>
			<summary>{{ item.text }}</summary>
			<DirectoryTree :items="item.items" />
		</details>
	</li>
</ul>
</template>
