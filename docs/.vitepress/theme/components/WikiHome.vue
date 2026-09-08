<script setup lang="ts">
import { data } from '../catalog.data'
import { tagChips } from '../chips'
import ArticleByline from './ArticleByline.vue'
import DirectoryTrigger from './DirectoryTrigger.vue'
import QrCode from './QrCode.vue'
import SiteIcon from './SiteIcon.vue'
import WikiChips from './WikiChips.vue'

const topics = [
	['新生入学', '从录取通知书到校园第一天'],
	['学习专题', '专业指南、课程资料与升学经验'],
	['群汇总', '找到老乡、同好和学生组织'],
	['校园生活', '常用信息与日常生活指南'],
	['就业', '了解岗位、求职知识与内推机会'],
	['计算机知识专题', '从环境配置到开发与人工智能'],
	['贡献与其他', '一起补充、修订和分享知识'],
]
const topicLinks: Record<string, string> = { 新生入学: 'newcomers', 学习专题: 'study', 校园生活: 'life', 群汇总: 'groups', 就业: 'career', 计算机知识专题: 'computing' }
const latest = [...data.articles].sort((a, b) => b.updatedTime - a.updatedTime || b.date.localeCompare(a.date)).slice(0, 5)
</script>

<template>
<div class="wiki-home">
	<section class="wiki-hero">
		<div>
			<h1>NCEPU<span>wiki</span></h1>
			<p class="hero-subtitle">
				在华电，从这里开始。
			</p>
			<p class="hero-description">
				华北电力大学学生共同维护的非官方校园知识库。<br>把散落的经验，整理成下一位同学用得上的指南。
			</p>
			<div class="hero-actions">
				<a class="primary" href="/pages/Preparation">阅读新生指南 <span aria-hidden="true">↗</span></a><DirectoryTrigger label="浏览全部目录 →" />
			</div>
		</div>
		<div class="hero-note">
			<SiteIcon class="hero-icon" /><span>北京 · 保定</span><strong>{{ data.articles.length }} 篇校园条目</strong><span>来自同学，服务同学</span>
		</div>
	</section>
	<div class="home-columns">
		<div>
			<section aria-labelledby="topics-title">
				<div class="section-heading">
					<h2 id="topics-title">
						探索专题
					</h2><DirectoryTrigger label="全部目录 →" />
				</div>
				<div class="topic-grid">
					<a v-for="[name, desc] in topics" :key="name" class="topic-card" :href="topicLinks[name] ? `/topics/${topicLinks[name]}/` : '/pages/BasicContribution/'">
						<h3>{{ name }}</h3><p>{{ desc }}</p><span class="topic-arrow" aria-hidden="true">↗</span>
					</a>
					<a class="topic-card community-card" href="/pages/FriendshipLinks/"><h3>友情链接</h3><p>校园墙、咨询与兄弟院校</p><span class="topic-arrow" aria-hidden="true">↗</span></a>
				</div>
			</section>
			<section class="community-panel" aria-labelledby="community-title">
				<h2 id="community-title">
					你的经验，也能帮助下一位同学。
				</h2>
				<p>欢迎补充学习资料、课程评价、专业指南与内推信息。分享资料时，请注明校区、院系、专业和课程名。</p>
				<div class="hero-actions">
					<a class="primary" href="/pages/BasicContribution/">了解如何贡献</a><a href="https://github.com/NCEPUwiki/NCEPUwiki/issues">反馈问题 →</a>
				</div>
				<div class="community-links">
					<a href="/categories/?category=学习资料">学习资料</a><a href="/pages/CourseEvaluation">课程评价</a><a href="/pages/EmployeeRefer/">内推信息</a><a href="https://github.com/NCEPUwiki/NCEPUwiki/graphs/contributors">感谢所有贡献者 ↗</a>
				</div>
			</section>
			<section class="home-activity">
				<h2>活动</h2><p>有校园活动需要宣传，欢迎通过反馈与共建联系我们。</p>
			</section>
		</div>
		<aside class="home-aside">
			<section>
				<div class="section-heading">
					<h2>最近更新</h2><a href="/archives/">更多 →</a>
				</div>
				<ol class="recent-list">
					<li v-for="article in latest" :key="article.url">
						<a :href="article.url">{{ article.title }}</a>
						<ArticleByline :date="article.updated" :author="article.author" />
					</li>
				</ol>
			</section>
			<section>
				<div class="section-heading">
					<h2>热门标签</h2><a href="/tags/">全部 →</a>
				</div><WikiChips :items="tagChips(data.tags.slice(0, 12))" label="热门标签" />
			</section>
			<section>
				<h2>联系我们</h2><p>聊天交流 QQ 群 <strong>417695180</strong><br>编辑贡献 QQ 群 <strong>1049790737</strong></p><a href="mailto:1361942776@qq.com">1361942776@qq.com ↗</a><details class="qr-details">
					<summary>手机访问本站</summary><QrCode src="https://wiki.ncepuinfo.cc/" label="NCEPUwiki 网站二维码" />
				</details>
			</section>
		</aside>
	</div>
</div>
</template>
