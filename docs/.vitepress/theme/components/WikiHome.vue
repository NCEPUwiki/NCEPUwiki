<script setup lang="ts">
// ================= 数据来源 =================

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

// “探索专题”卡片区的数据源：每一项是 [专题名, 一句话简介]。
// 需要增删或改名专题时在这里维护，同时同步 topicLinks 中的映射。
const topics = [
	['新生入学', '从录取通知书到校园第一天'],
	['学习专题', '专业指南、课程资料与升学经验'],
	['群汇总', '找到老乡、同好和学生组织'],
	['校园生活', '常用信息与日常生活指南'],
	['就业', '了解岗位、求职知识与内推机会'],
	['计算机知识专题', '从环境配置到开发与人工智能'],
	['贡献与其他', '一起补充、修订和分享知识'],
]

// 专题名 → 该专题落地页 URL 中的 slug（对应 docs/topics/ 下的同名目录）。
// 模板会优先读取这里的映射；未被映射的专题（如“贡献与其他”）
// 会回退到默认链接 /pages/BasicContribution/（贡献指南页）。
const topicLinks: Record<string, string> = { 新生入学: 'newcomers', 学习专题: 'study', 校园生活: 'life', 群汇总: 'groups', 就业: 'career', 计算机知识专题: 'computing', 贡献与其他: 'contribution' }

// ================= 动态数据加工 =================

// 侧栏“最近更新”取前 5 篇文章：先复制文章数组再排序，
// 按 updatedTime（时间戳数值）降序，更新时间相同者再按 date 字符串降序，
// 最后 slice(0, 5) 只保留最新的 5 篇用于展示。
const latest = [...data.articles].sort((a, b) => b.updatedTime - a.updatedTime || b.date.localeCompare(a.date)).slice(0, 5)
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
				<a class="primary" href="/pages/Preparation">阅读新生指南 <span aria-hidden="true">↗</span></a><a href="/categories/">浏览全部目录 →</a>
			</div>
		</div>
		<!-- Hero 右侧小卡片：校徽、校区范围、由 data loader 统计的条目总数、一句话定位 -->
		<div class="hero-note">
			<SiteIcon class="hero-icon" /><strong>{{ data.articles.length }} 篇校园条目</strong><span>来自同学，服务同学</span>
		</div>
	</section>

	<!-- 中部主体：左右两栏布局（home-columns），左栏为主要内容，右栏为 aside 信息区 -->
	<div class="home-columns">
		<!-- ========== 左栏：专题、共建引导与活动 ========== -->
		<div>
			<!-- “探索专题”：带标题的全部专题入口卡片区 -->
			<section aria-labelledby="topics-title">
				<div class="section-heading">
					<!-- aria-labelledby 让标题与本节语义关联，便于读屏器识别 -->
					<h2 id="topics-title">
						探索专题
					</h2><a href="/categories/">全部目录 →</a>
				</div>
				<div class="topic-grid">
					<!-- 动态专题卡片：v-for 遍历 topics 并解构出 [name, desc]；
					href 优先使用 topicLinks 的 slug，映射不到的专题回退到贡献指南页 -->
					<a v-for="[name, desc] in topics" :key="name" class="topic-card" :href="topicLinks[name] ? `/topics/${topicLinks[name]}/` : '/pages/BasicContribution/'">
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
				<p>欢迎补充学习资料、课程评价、专业指南与内推信息。分享资料时，请注明校区、院系、专业和课程名。</p>
				<!-- 次级 CTA：了解贡献流程 / 到 GitHub 反馈问题 -->
				<div class="hero-actions">
					<a class="primary" href="/pages/BasicContribution/">了解如何贡献</a><a href="https://github.com/NCEPUwiki/NCEPUwiki/issues">反馈问题 →</a>
				</div>
				<!-- 快捷入口：分类页、课程评价、内推信息与贡献者列表 -->
				<div class="community-links">
					<a href="/categories/?category=学习资料">学习资料</a><a href="/pages/CourseEvaluation">课程评价</a><a href="/pages/EmployeeRefer/">内推信息</a><a href="https://github.com/NCEPUwiki/NCEPUwiki/graphs/contributors">感谢所有贡献者 ↗</a>
				</div>
			</section>

			<!-- 活动占位区：活动信息目前只在文案层面提示，可后续替换为真实活动列表 -->
			<section class="home-activity">
				<h2>活动</h2><p>有校园活动需要宣传，欢迎通过反馈与共建联系我们。</p>
			</section>
		</div>

		<!-- ========== 右栏（aside）：动态信息与联系方式 ========== -->
		<aside class="home-aside">
			<!-- 最近更新：取上方加工出的 latest 前 5 篇文章，
				显示标题，并由 ArticleByline 展示 updated 日期与 author -->
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
