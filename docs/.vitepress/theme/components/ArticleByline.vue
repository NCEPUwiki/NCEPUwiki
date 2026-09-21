<script setup lang="ts">
import timeIcon from '@iconify-icons/ri/time-line'
import { Icon } from '@iconify/vue'

defineProps<{ date?: string }>()
</script>

<template>
<div v-if="date" class="index-byline">
	<span v-if="date" class="article-date"><Icon :icon="timeIcon" aria-hidden="true" /><time :datetime="date">{{ date }}</time></span>
</div>
</template>
