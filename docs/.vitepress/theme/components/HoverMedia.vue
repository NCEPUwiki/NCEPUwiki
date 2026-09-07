<script setup lang="ts">
import imageIcon from '@iconify-icons/ri/image-line'
import qrIcon from '@iconify-icons/ri/qr-code-line'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { Tippy } from 'vue-tippy'
import QrCode from './QrCode.vue'
import 'tippy.js/dist/tippy.css'

withDefaults(defineProps<{ src: string, kind?: 'qr' | 'image', label?: string, size?: number }>(), { kind: 'qr', label: '扫码加入', size: 200 })
const popup = ref<{ hide: () => void }>()
const appendTo = () => document.body
</script>

<template>
<span class="hover-media" :data-share-qr="kind === 'qr' ? src : undefined" :data-share-image="kind === 'image' ? src : undefined">
	<Tippy ref="popup" interactive trigger="mouseenter focus click" :append-to="appendTo" :max-width="300" theme="wiki" placement="auto">
		<button class="media-trigger" type="button" :aria-label="label" @keydown.esc="popup?.hide()"><slot><Icon :icon="kind === 'qr' ? qrIcon : imageIcon" aria-hidden="true" /><span>{{ kind === 'qr' ? '扫码' : '查看图片' }}</span></slot></button>
		<template #content><div class="media-popover" @keydown.esc="popup?.hide()"><QrCode v-if="kind === 'qr'" :src="src" :label="label" :size="size" /><img v-else :src="src" :alt="label"><p>{{ kind === 'qr' && src.includes('weixin.qq.com') ? '请使用微信扫码' : label }}</p></div></template>
	</Tippy>
</span>
</template>
