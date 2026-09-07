<script setup lang="ts">
import HoverMedia from './HoverMedia.vue'

const links = [
	{ name: '落点华电有趣青年', image: '/img/10/10/落点华电.jpg', url: 'http://weixin.qq.com/r/mp/whN7YxDEaE0XrVQA90bQ', description: '华电最全生活指南 · 资讯吐槽 · 校园故事，非官方自媒体', tag: '校园媒体', qr: true },
	{ name: '保定表白墙微信', image: '/img/10/10/保定表白墙微信头像.jpg', url: '/img/10/10/保定表白墙微信.jpg', description: '非官方的华电校园自媒体平台，为华电学子服务', tag: '校园社区', preview: true },
	{ name: '保定表白墙 QQ', image: '/img/10/10/保定表白墙QQ头像.jpg', url: '/img/10/10/保定表白墙QQ.jpg', description: '学长学姐 2018 年创立至今，二手 / 树洞 / 拼车 / 答疑，为爱情服务', tag: '校园社区', preview: true },
	{ name: '柊三米', image: '/img/10/10/柊三米.webp', url: 'https://space.bilibili.com/163004797', description: '一位学长，制作了新生入学指南发布在 B 站', tag: '同学创作' },
	{ name: 'SWJTUwiki', image: '/img/10/10/西南交通大学校徽.png', url: 'https://wiki.swjtu.top/', description: '西南交通大学 Wiki', tag: '兄弟院校' },
	{ name: '西邮 Wiki', image: 'https://p.qlogo.cn/gh/924632788/924632788/100/', url: 'https://wiki.cooo.site/', description: '西安邮电大学校园知识库', tag: '兄弟院校' },
]
</script>

<template>
<p class="friend-intro">
	连接校园里的创作者、社区与知识库。
</p>
<div class="friend-list">
	<article v-for="link in links" :key="link.name" class="friend-link-card">
		<img class="card-blur" :src="link.image" alt="" loading="lazy">
		<component :is="link.qr || link.preview ? 'div' : 'a'" class="friend-card-main" :href="link.qr || link.preview ? undefined : link.url" :target="link.qr || link.preview ? undefined : '_blank'" rel="noreferrer">
			<img class="card-avatar" :src="link.image" :alt="link.name" loading="lazy">
			<h2>{{ link.name }}</h2>
			<p>{{ link.description }}</p>
			<span class="card-badges">{{ link.tag }}</span>
			<HoverMedia v-if="link.qr || link.preview" :src="link.url" :kind="link.qr ? 'qr' : 'image'" :label="link.qr ? '微信扫码关注' : `查看${link.name}图片`" /><span v-else class="friend-card-visit">访问 ↗</span>
		</component>
	</article>
</div>
</template>
