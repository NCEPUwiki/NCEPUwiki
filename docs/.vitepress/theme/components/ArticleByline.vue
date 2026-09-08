<script setup lang="ts">
import timeIcon from '@iconify-icons/ri/time-line'
import userIcon from '@iconify-icons/ri/user-line'
import { Icon } from '@iconify/vue'

defineProps<{ date?: string, author?: string }>()
</script>

<template>
<div v-if="date || author" class="index-byline">
	<span v-if="date" class="article-date"><Icon :icon="timeIcon" aria-hidden="true" /><time :datetime="date">{{ date }}</time></span>
	<span v-if="author" class="article-author"><Icon :icon="userIcon" aria-hidden="true" />{{ author }}</span>
</div>
</template>
