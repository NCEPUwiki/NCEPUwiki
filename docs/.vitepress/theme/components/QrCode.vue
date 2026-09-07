<script setup lang="ts">
import { renderSVG } from 'uqr'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ src: string, label?: string, size?: number }>(), { label: '二维码', size: 180 })
const svg = computed(() => renderSVG(props.src, { border: 4, pixelSize: 4 }))
</script>

<template>
<span class="wiki-qr" :aria-label="label" :style="{ width: `${size}px` }"><span role="img" :aria-label="label" v-html="svg" /></span>
</template>
