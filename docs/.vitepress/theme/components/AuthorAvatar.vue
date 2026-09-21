<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ name: string, avatar?: string, fallback?: string }>()
const failed = ref(false)
const source = computed(() => !failed.value && props.avatar ? props.avatar : props.fallback)
</script>

<template>
<img v-if="source" class="article-author-avatar" :src="source" alt="" width="32" height="32" loading="lazy" @error="failed = true">
<span v-else class="article-author-avatar article-author-avatar-fallback" aria-hidden="true">{{ [...name][0] }}</span>
</template>
