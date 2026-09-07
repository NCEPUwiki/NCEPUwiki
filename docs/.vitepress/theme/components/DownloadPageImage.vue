<script setup lang="ts">
import { useData } from 'vitepress'
import { onBeforeUnmount, ref } from 'vue'

const { page } = useData()
const dialog = ref<HTMLDialogElement>()
const trigger = ref<HTMLButtonElement>()
const busy = ref(false)
const error = ref('')
const preview = ref('')
const mode = ref('full')
let request = 0
let savedOverflow = ''
function release() {
	if (preview.value)
		URL.revokeObjectURL(preview.value)
	preview.value = ''
}
function close() {
	request++
	busy.value = false
	dialog.value?.close()
	document.body.style.overflow = savedOverflow
	release()
}
async function generate() {
	const current = ++request
	busy.value = true
	error.value = ''
	release()
	try {
		const source = trigger.value?.closest<HTMLElement>('.wiki-article-content, .content-container')
		if (!source)
			throw new Error('找不到文章内容')
		const { createShareImage } = await import('../share-image')
		const url = new URL(window.location.pathname, 'https://wiki.ncepuinfo.cc').href
		const blob = await createShareImage(source, page.value.title, url, mode.value === 'card')
		if (current === request)
			preview.value = URL.createObjectURL(blob)
	}
	catch (reason) {
		if (current === request)
			error.value = reason instanceof Error ? reason.message : '图片生成失败，请重试。'
	}
	finally {
		if (current === request)
			busy.value = false
	}
}
function open() {
	savedOverflow = document.body.style.overflow
	document.body.style.overflow = 'hidden'
	dialog.value?.showModal()
	void generate()
}
function print() {
	close()
	window.print()
}
onBeforeUnmount(() => {
	request++
	if (dialog.value?.open)
		document.body.style.overflow = savedOverflow
	release()
})
</script>

<template>
<div class="share-actions" data-share-exclude>
	<button ref="trigger" class="wiki-download" aria-haspopup="dialog" @click="open">
		生成分享图片
	</button>
	<dialog ref="dialog" class="share-dialog" aria-labelledby="share-title" @cancel.prevent="close" @click="($event.target === dialog) && close()">
		<header class="share-toolbar">
			<div class="share-toolbar-title">
				<h2 id="share-title">
					分享 {{ page.title }}
				</h2><button aria-label="关闭分享预览" @click="close">
					关闭 ×
				</button>
			</div>
			<div class="share-options">
				<label>图片内容 <select v-model="mode" :disabled="busy" @change="generate"><option value="full">页面长图</option><option value="card">分享卡片</option></select></label>
				<a v-if="preview" class="wiki-download" :href="preview" :download="`${page.title.replace(/[\\/:*?&quot;<>|]/g, '_')}.png`">下载 PNG</a>
				<button class="wiki-download" @click="print">
					打印 / 保存 PDF
				</button>
			</div>
		</header>
		<div class="share-preview">
			<p v-if="busy" role="status">
				正在生成图片…
			</p>
			<p v-if="error" role="alert">
				{{ error }} <button @click="generate">
					重试
				</button>
			</p>
			<img v-if="preview" :src="preview" alt="分享图片预览，包含网站标题、原文网址和页面二维码">
		</div>
	</dialog>
</div>
</template>
