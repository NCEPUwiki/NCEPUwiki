<script setup lang="ts">
import { directoryOpen } from '../directory'

withDefaults(defineProps<{ label?: string }>(), { label: '全部目录' })
</script>

<template>
<button class="directory-trigger" aria-haspopup="dialog" @click="directoryOpen = true">
	{{ label }}
</button>
</template>
