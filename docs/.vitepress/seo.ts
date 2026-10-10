import type { Article } from './types.ts'

/** 站点对外地址：canonical、og:url 与结构化数据共用同一个来源。 */
export const siteUrl = 'https://wiki.ncepuinfo.cc'

/**
 * 为极短/模糊标题（如“综测”、“考研”）补充完整的搜索意图标题，提升 SERP 呈现效果与点击率。
 *
 * key 必须是文章的 permalink，写法与 permalink 完全一致（含末尾斜杠与否），
 * 匹配失败不会报错，因此这里由 assertSeoTitleMapMatches 在构建期强制校验。
 *
 * 只有正文为空的占位页也被标了 noindex 且不进站点地图，
 * 这些条目要等正文补齐后才会真正影响搜索结果。
 */
export const seoTitleMap: Record<string, string> = {
	'/pages/appraise/': '华北电力大学本科生综合测评细则与保研加分攻略',
	'/pages/kaoyan/': '华北电力大学考研经验、报录比与备考指南',
	'/pages/PostgraduateRecommendation/': '华北电力大学保研推免政策、流程与经验总结',
	'/pages/SelfStudy/': '华电自习室与图书馆自习攻略指南（北京/保定）',
	'/pages/food/': '华电食堂档口推荐与校园周边美食地图',
	'/pages/medicalinsurance/': '华北电力大学大学生医保办理与门诊报销流程',
	'/pages/EmployeeRefer/': '华电校友企业内推码与校园招聘求职渠道汇总',
	'/pages/3c25e8/': '华电学子考驾照报名攻略与周边驾校避坑指南',
	// 新生入学
	'/pages/Preparation': '华北电力大学新生入学准备清单：行李物品与证件档案指南',
	'/pages/Transportation': '华北电力大学新生报到交通指南：学生票与校区路线',
	'/pages/Registration': '华北电力大学新生现场报到流程：证件材料与宿舍入住',
	'/pages/Course': '华北电力大学新生课程指南：教材获取与选课军训安排',
	'/pages/SchoolLife': '华北电力大学生活指南：校园网、一卡通与食堂快递',
	'/pages/EnterAssociation': '华北电力大学学生组织与社团招新指南',
	'/pages/QuestionAndAnswer': '华北电力大学新生常见问题解答（Q&A）',
	// 学习专题
	'/pages/52fb8b/': '华北电力大学四六级考试报名流程与备考指南',
	'/pages/95c223/': '华北电力大学计算机等级考试（NCRE）报考指南',
	'/pages/TeacherQualificationExam': '教师资格证考试备考指南：报名、笔试与面试',
	'/pages/07e3ee/': '华电学生雅思托福备考指南：考点选择与出分经验',
	'/pages/3e6c4d/': '普通话等级考试（PSC）报名流程与备考技巧',
	'/pages/702c64/': '日语等级考试指南：JLPT 与 J.TEST 报名备考',
	'/pages/competitions': '华北电力大学学科竞赛简介：A/B/C 类竞赛名单汇总',
	'/pages/books_bj/': '华北电力大学北京校区课程资料与教材下载索引',
	'/pages/books_bd/': '华北电力大学保定校区课程教材与学习资料索引',
	'/pages/CourseEvaluation': '华北电力大学课程评价汇总：教师评分与选课参考',
	'/pages/gradeandcourse': '华北电力大学学分与选课指南：成绩补考与选课流程',
	'/pages/MentorEvaluation/': '华北电力大学导师评价与选导师避坑指南',
	'/pages/Wuzhonghua/': '华北电力大学吴仲华学院本硕博贯通培养项目介绍',
	'/pages/57ed5c/': '华北电力大学本科生转专业政策与考核流程指南',
	'/pages/StudyAbroad': '华电学生留学申请指南：欧陆香港院校与雅思备考',
	// 计算机知识专题
	'/pages/pythonconfiguration/': 'Python 环境配置指南：虚拟环境与 PyTorch CUDA 安装',
	'/pages/GitStudy/': 'Git 入门与协作教程：分支管理与 GitHub 工作流',
	'/pages/Linux_ELF/': 'ELF 文件格式详解：结构、节表与 readelf 工具用法',
	'/pages/vim/': 'Vim 编辑器快速上手教程：模式切换与常用命令速查',
	// 群汇总
	'/pages/hobbygroup': '华电学生同好群汇总：游戏动漫与兴趣社群 QQ 群号',
	'/pages/fellowvillagers': '华北电力大学老乡群汇总：北京保定各地区 QQ 群号',
	// 校园生活
	'/pages/webs': '华北电力大学常用网站导航：教务平台与 WebVPN 入口',
	'/pages/phones': '华北电力大学常用电话汇总：保卫处与校医院等联系方式',
	'/pages/classroom/': '华北电力大学保定校区教室借用流程与注意事项',
	'/pages/WeChatPublicAccount/': '华北电力大学常用微信公众号汇总：缴费教务服务号',
	'/pages/ApplicatBicycleLicense/': '华北电力大学电动自行车通行证申请与上牌流程',
	// 就业
	'/pages/PowerGeneration/': '电厂就业入门：分班倒班机制与职称晋升路径',
	'/pages/EmploymentForElectricalEngineeringUndergraduates/': '华北电力大学电气本科就业方向与备考建议',
	'/pages/job/': '华电求职知识与技能手册：简历制作与笔面试准备',
	// AI专题
	'/pages/ai-coding-budget/': 'AI 编程穷鬼套餐怎么选：ChatGPT Plus、OpenCode Go 与免费模型对比',
	'/pages/ai-model-selection/': '全场景 AI 选型指南：搜题答疑、资料检索、写代码与科研怎么挑模型',
	// 贡献与其他
	'/pages/BasicContribution/': '基础贡献指南：Markdown 写作与提交规范',
	'/pages/AdvanceContribution/': '进阶贡献指南：图片上传与 Pull Request 流程',
	'/pages/FriendshipLinks/': '华电校园友情链接合集：校园墙与兄弟院校 Wiki',
}

/**
 * 页面 `<title>` 与结构化数据 headline 共用的标题：短标题命中 seoTitleMap 时用补全后的长标题。
 * 品牌后缀由 VitePress 的 titleTemplate 统一拼接，这里只给出主体。
 */
export function seoTitleFor(article: { url: string, title: string }) {
	return seoTitleMap[article.url] || article.title
}

/** 非文章页（索引页与 404）的标题覆盖与 noindex，避免短标题被直接输出。 */
export const standaloneSeo: Record<string, { title?: string, noindex?: boolean }> = {
	'archives/index.md': { title: '最近更新：华北电力大学校园知识库修订记录' },
	'categories/index.md': { title: '文章分类：浏览校园知识库全部专题' },
	'tags/index.md': { title: '标签：按主题检索校园知识库条目' },
	'404.md': { noindex: true },
}

/**
 * seoTitleMap 靠 permalink 字符串匹配，permalink 一改映射就会静默失效
 * （页面标题退回短标题，且不会有任何报错），因此在构建期直接校验。
 */
export function assertSeoTitleMapMatches(articles: Article[]) {
	const urls = new Set(articles.map(article => article.url))
	const unknown = Object.keys(seoTitleMap).filter(url => !urls.has(url))
	if (unknown.length)
		throw new Error(`seoTitleMap 中的链接没有对应文章，映射不会生效：${unknown.join(', ')}`)
}
