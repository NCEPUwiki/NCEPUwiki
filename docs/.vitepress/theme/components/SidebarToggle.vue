<script setup lang="ts">
import sidebarFoldIcon from '@iconify-icons/ri/sidebar-fold-line'
import sidebarUnfoldIcon from '@iconify-icons/ri/sidebar-unfold-line'
import { Icon } from '@iconify/vue'
import { sidebarCollapsed, toggleSidebarCollapsed } from '../sidebar'
</script>

<template>
<button
	class="wiki-sidebar-toggle"
	type="button"
	:title="sidebarCollapsed ? '展开左侧目录' : '收起左侧目录'"
	:aria-label="sidebarCollapsed ? '展开左侧目录' : '收起左侧目录'"
	:aria-expanded="!sidebarCollapsed"
	aria-controls="VPSidebarNav"
	@click="toggleSidebarCollapsed"
>
	<Icon :icon="sidebarCollapsed ? sidebarUnfoldIcon : sidebarFoldIcon" aria-hidden="true" />
</button>
</template>
