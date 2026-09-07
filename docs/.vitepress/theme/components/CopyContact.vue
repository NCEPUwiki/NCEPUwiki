<script setup lang="ts">
import checkIcon from '@iconify-icons/ri/check-line'
import copyIcon from '@iconify-icons/ri/file-copy-line'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const props = defineProps<{ value: string }>()
const status = ref('')
async function copy() {
	try {
		await navigator.clipboard.writeText(props.value)
		status.value = '已复制'
	}
	catch { status.value = '请选中群号复制' }
}
</script>

<template>
<button class="copy-contact" data-share-exclude :aria-label="status || `复制群号 ${value}`" :title="status || '复制群号'" @click="copy">
	<Icon :icon="status === '已复制' ? checkIcon : copyIcon" aria-hidden="true" />
</button>
</template>
