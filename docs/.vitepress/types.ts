export interface Article {
	source: string
	url: string
	title: string
	folders: string[]
	categories: string[]
	tags: string[]
	date: string
	updated: string
	updatedTime: number
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
