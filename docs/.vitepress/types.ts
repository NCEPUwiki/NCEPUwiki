/** 文章作者：来自 frontmatter 声明或 Git 提交历史，两者按邮箱/姓名去重。 */
export interface Author {
	/** 显示名 */
	name: string
	/** 邮箱，同时用于去重和头像 */
	email?: string
	/** 主页链接；frontmatter 不再提供，目前只有组织兜底账号使用 */
	url?: string
	/** 头像地址；没有可用的远程头像时是本地生成的首字图 */
	avatar?: string
	/** 头像加载失败时替换使用的本地首字图 */
	fallback?: string
	/** Git 提交次数，仅用于排序与提示 */
	commits?: number
	/** 来源；frontmatter 声明的作者排在前面 */
	origin?: 'frontmatter' | 'git'
}

export interface Article {
	source: string
	url: string
	title: string
	folders: string[]
	categories: string[]
	tags: string[]
	date: string
	lastUpdated: string
	lastUpdatedTime: number
	author: string
	hasHeading: boolean
	empty: boolean
}

export interface DirectoryItem {
	text: string
	link?: string
	collapsed?: boolean
	items?: DirectoryItem[]
}

export interface TaxonomyCount {
	name: string
	count: number
}

export interface Activity {
	source: string
	title: string
	date: string
	end?: string
	campus?: string
	venue?: string
	link?: string
	description?: string
	body?: string
	html?: string
}

export interface Catalog {
	articles: Article[]
	tree: DirectoryItem[]
	categories: TaxonomyCount[]
	tags: TaxonomyCount[]
}

export type IndexMode = 'archives' | 'categories' | 'tags'
