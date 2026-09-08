import type { TaxonomyCount } from '../types'

export interface ChipItem {
	text: string
	value?: string
	href?: string
	count?: number
}

export function tagChips(tags: (string | TaxonomyCount)[]): ChipItem[] {
	return tags.map((tag) => {
		const name = typeof tag === 'string' ? tag : tag.name
		return { text: `# ${name}`, href: `/tags/?tag=${encodeURIComponent(name)}`, count: typeof tag === 'string' ? undefined : tag.count }
	})
}
