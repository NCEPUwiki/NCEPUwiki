<script setup lang="ts">
import type { ChipItem } from '../chips'

defineProps<{ items: ChipItem[], selected?: string, label?: string }>()
defineEmits<{ select: [value: string] }>()
</script>

<template>
<div v-if="items.length" class="chips" :aria-label="label">
	<component
		:is="item.href ? 'a' : 'button'"
		v-for="item in items"
		:key="item.value ?? item.text"
		class="chip"
		:href="item.href"
		:type="item.href ? undefined : 'button'"
		:aria-pressed="item.href ? undefined : selected === item.value"
		@click="!item.href && $emit('select', item.value ?? item.text)"
	>
		{{ item.text }}<span v-if="item.count !== undefined" class="chip-count">{{ item.count }}</span>
	</component>
</div>
</template>
