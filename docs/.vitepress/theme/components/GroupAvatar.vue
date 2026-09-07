<script setup lang="ts">
import { computed, ref } from 'vue'
import SiteIcon from './SiteIcon.vue'

const props = defineProps<{ qq: string }>()
const failed = ref(false)
const avatar = computed(() => props.qq ? `https://p.qlogo.cn/gh/${props.qq}/${props.qq}/100/` : '')
</script>

<template>
<div class="group-avatar" aria-hidden="true">
	<img v-if="avatar && !failed" class="card-blur" :src="avatar" alt="" loading="lazy" @error="failed = true">
	<img v-if="avatar && !failed" class="card-avatar" :src="avatar" alt="" loading="lazy" @error="failed = true">
	<span v-else class="card-avatar card-avatar-fallback"><SiteIcon /></span>
</div>
</template>
