<script setup lang="ts">
// ================= 数据来源 =================

// activity.data.ts 读取 docs/activity/ 下的 Markdown 活动公告，
// 首页“活动”区只从这里取数，平时维护活动只需增删 Markdown 文件。
import { data as activities } from '../activity.data'

// catalog.data.ts 是 VitePress 的 data loader（.data.ts）：
// 在开发与构建时会扫描 docs/ 下各编号目录中的 Markdown 文章，
// 汇总出 data.articles（文章列表）、data.tree（目录树）、
// data.categories / data.tags（分类、标签及对应文章数）等结构化数据，
// 首页的“条目总数”“最近更新”“热门标签”都直接或间接来自它。
import { data } from '../catalog.data'

// tagChips() 把标签数据（字符串或 { name, count } 对象）转换为
// WikiChips 组件需要的 ChipItem 数组，并自动生成标签筛选页的链接。
import { tagChips } from '../chips'

// 下面是首页用到的内部展示组件：
// ArticleByline —— 文章的日期 / 作者信息行；
// QrCode —— 生成二维码；SiteIcon —— 校徽图标；
// WikiChips —— 渲染一组可点击的标签胶囊。
import ArticleByline from './ArticleByline.vue'
import QrCode from './QrCode.vue'
import SiteIcon from './SiteIcon.vue'
import WikiChips from './WikiChips.vue'

// ================= 首页静态内容配置 =================

// “按分类浏览”卡片区的数据源：每一项是 [分类名, 一句话简介]。
// 卡片统一跳到 /categories/?category=分类名，和「全部分类」共用一个页面。
const topics = [
	['新生入学', '从录取通知书到校园第一天'],
	['学习专题', '专业指南、课程资料与升学经验'],
	['群汇总', '找到老乡、同好和学生组织'],
	['校园生活', '常用信息与日常生活指南'],
	['就业', '了解岗位、求职知识与内推机会'],
	['计算机知识专题', '从环境配置到开发与人工智能'],
	['贡献与其他', '一起补充、修订和分享知识'],
]

// ================= 动态数据加工 =================

// 侧栏“最近更新”只收录有 lastUpdated 的文章，
// 按 lastUpdatedTime（时间戳数值）降序，更新时间相同者再按 date 字符串降序，
// 最后 slice(0, 5) 只保留最新的 5 篇用于展示。
const latest = data.articles.filter(article => article.lastUpdatedTime > 0).sort((a, b) => b.lastUpdatedTime - a.lastUpdatedTime || b.date.localeCompare(a.date)).slice(0, 5)

// “活动”区：date 为活动开始日期，end 可表示跨天活动的结束日期。
// 填了 end 的活动在结束日期次日隐藏；未填 end 的活动不设过期时间，始终显示。
const today = new Date()
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const upcomingActivities = activities.filter(activity => !activity.end || activity.end >= todayKey)
function isExternal(link?: string) {
	return link?.startsWith('http') ?? false
}
</script>

<template>
<!-- 首页根容器：对应布局和视觉样式见 theme/styles/home.css 中的 .wiki-home -->
<div class="wiki-home">
	<!-- 顶部 Hero 区：左侧是品牌标语与主行动按钮，右侧是站点概况小卡片 -->
	<section class="wiki-hero">
		<!-- Hero 左侧文案：品牌名、副标题、站点简介，以及引导新生的 CTA -->
		<div>
			<h1>NCEPU<span>wiki</span></h1>
			<p class="hero-subtitle">
				在华电，从这里开始。
			</p>
			<p class="hero-description">
				华北电力大学学生共同维护的非官方校园知识库。<br>把散落的经验，整理成下一位同学用得上的指南。
			</p>
			<!-- 主要行动按钮：跳转新生指南；第二个链接前往文章分类索引页 /categories/ -->
			<div class="hero-actions">
				<a class="primary" href="/pages/Preparation">阅读新生指南 <span aria-hidden="true">↗</span></a><a href="/categories/">浏览全部分类 →</a>
			</div>
		</div>
		<!-- Hero 右侧小卡片：校徽、校区范围、由 data loader 统计的条目总数、一句话定位 -->
		<div class="hero-note">
			<SiteIcon class="hero-icon" /><strong>{{ data.articles.length }} 篇校园条目</strong><span>来自同学，服务同学</span>
		</div>
	</section>

	<!-- 中部主体：左右两栏布局（home-columns），左栏为主要内容，右栏为 aside 信息区 -->
	<div class="home-columns">
		<!-- ========== 左栏：分类、共建引导与活动 ========== -->
		<div>
			<!-- “按分类浏览”：带标题的全部分类入口卡片区 -->
			<section aria-labelledby="categories-title">
				<div class="section-heading">
					<!-- aria-labelledby 让标题与本节语义关联，便于读屏器识别 -->
					<h2 id="categories-title">
						按分类浏览
					</h2><a href="/categories/">全部分类 →</a>
				</div>
				<div class="topic-grid">
					<!-- 动态分类卡片：v-for 遍历 topics 并解构出 [name, desc]，
					每张卡片跳转到分类页并选中同名分类 -->
					<a v-for="[name, desc] in topics" :key="name" class="topic-card" :href="`/categories/?category=${encodeURIComponent(name)}`">
						<h3>{{ name }}</h3><p>{{ desc }}</p><span class="topic-arrow" aria-hidden="true">↗</span>
					</a>
					<!-- 友情链接作为一张特殊卡片排在网格末尾（community-card 样式），
					指向 docs/10.贡献与其他/10.友情链接.md 生成的页面 -->
					<a class="topic-card community-card" href="/pages/FriendshipLinks/"><h3>友情链接</h3><p>校园墙、咨询与兄弟院校</p><span class="topic-arrow" aria-hidden="true">↗</span></a>
				</div>
			</section>

			<!-- 社区共建引导面板：面向想贡献内容的同学展示参与方式 -->
			<section class="community-panel" aria-labelledby="community-title">
				<h2 id="community-title">
					你的经验，也能帮助下一位同学。
				</h2>
				<!-- 次级 CTA：了解贡献流程 / 到 GitHub 反馈问题 -->
				<div class="hero-actions">
					<a class="primary" href="/pages/BasicContribution/">了解如何贡献</a><a href="https://github.com/NCEPUwiki/NCEPUwiki/issues">反馈问题 →</a>
				</div>
			</section>

			<!-- 活动区：内容来自 docs/activity/*.md，无需再改 Vue -->
			<section aria-labelledby="activity-title" class="home-activity">
				<div class="section-heading">
					<h2 id="activity-title">
						活动
					</h2>
				</div>
				<ul v-if="upcomingActivities.length" class="activity-list">
					<li v-for="activity in upcomingActivities" :key="activity.source">
						<div class="activity-card">
							<component
								:is="activity.link ? 'a' : 'div'"
								class="activity-heading"
								:href="activity.link || undefined"
								:target="isExternal(activity.link) ? '_blank' : undefined"
								:rel="isExternal(activity.link) ? 'noopener' : undefined"
							>
								<time class="activity-date" :datetime="activity.date">
									{{ activity.date }}<template v-if="activity.end && activity.end !== activity.date"> ~ {{ activity.end }}</template>
								</time>
								<span class="activity-title">{{ activity.title }}</span>
								<span v-if="activity.campus || activity.venue" class="activity-meta"><template v-if="activity.campus">{{ activity.campus }}</template><template v-if="activity.campus && activity.venue"> · </template><template v-if="activity.venue">{{ activity.venue }}</template></span>
							</component>
							<p v-if="activity.description" class="activity-description">
								{{ activity.description }}
							</p>
							<div v-if="activity.html" class="activity-body" v-html="activity.html" />
						</div>
					</li>
				</ul>
				<p v-else class="activity-empty">
					暂无可报名活动。有校园活动需要宣传，欢迎通过反馈与共建联系我们。
				</p>
			</section>
		</div>

		<!-- ========== 右栏（aside）：动态信息与联系方式 ========== -->
		<aside class="home-aside">
			<!-- 最近更新：取上方加工出的 latest 前 5 篇文章，
				显示标题，并由 ArticleByline 展示 lastUpdated 日期 -->
			<section>
				<div class="section-heading">
					<h2>最近更新</h2><a href="/archives/">更多 →</a>
				</div>
				<ol class="recent-list">
					<li v-for="article in latest" :key="article.url">
						<a :href="article.url">{{ article.title }}</a>
						<ArticleByline :date="article.lastUpdated" />
					</li>
				</ol>
			</section>
			<!-- 热门标签：data.tags 已按文章数降序排列（数量相同按名称），
				这里取前 12 个，再经 tagChips 转成可点击的标签胶囊 -->
			<section>
				<div class="section-heading">
					<h2>热门标签</h2><a href="/tags/">全部 →</a>
				</div><WikiChips :items="tagChips(data.tags.slice(0, 12))" label="热门标签" />
			</section>
			<!-- 联系我们：两个 QQ 群、GitHub 仓库，以及手机访问的二维码（直接展示，无下拉） -->
			<section>
				<h2>联系我们</h2><p>聊天交流 QQ 群 <strong>417695180</strong><br>编辑贡献 QQ 群 <strong>1049790737</strong></p><a href="https://github.com/NCEPUwiki/NCEPUwiki">GitHub ↗</a>
				<div class="qr-details">
					<span>手机访问本站</span><QrCode src="https://wiki.ncepuinfo.cc/" label="NCEPUwiki 网站二维码" />
				</div>
			</section>
		</aside>
	</div>
</div>
</template>
