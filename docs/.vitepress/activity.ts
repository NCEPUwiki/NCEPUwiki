import type { Activity } from './types.ts'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { docsRoot } from './catalog.ts'

export const activityRoot = join(docsRoot, 'activity')
const ignored = /^(?:\.|_|README)/i

function date(value: unknown, source: string, field: string): string {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(value.getUTCDate()).padStart(2, '0')}`
	}
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim()))
		throw new Error(`活动 ${source} 的 ${field} 必须是 YYYY-MM-DD 格式`)
	return value.trim()
}

function optionalDate(value: unknown, source: string, field: string): string | undefined {
	if (value == null || (typeof value === 'string' && !value.trim()))
		return undefined
	return date(value, source, field)
}

function optionalText(value: unknown): string | undefined {
	if (typeof value !== 'string')
		return undefined
	const text = value.trim()
	return text || undefined
}

export function scanActivities(root: string): Activity[] {
	if (!existsSync(root))
		return []
	return readdirSync(root, { withFileTypes: true })
		.filter(entry => entry.isFile() && entry.name.endsWith('.md') && !ignored.test(entry.name))
		.map((entry): Activity => {
			const source = entry.name
			const { data: fm, content } = matter(readFileSync(join(root, source), 'utf8'))
			const title = optionalText(fm.title)
			if (!title)
				throw new Error(`活动 ${source} 缺少 title 字段`)
			const body = content.trim()
			return {
				source,
				title,
				date: date(fm.date, source, 'date'),
				end: optionalDate(fm.end, source, 'end'),
				campus: optionalText(fm.campus),
				venue: optionalText(fm.venue),
				link: optionalText(fm.link),
				description: optionalText(fm.description),
				body: body || undefined,
			}
		})
		.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'zh-CN'))
}

export function loadActivities(): Activity[] {
	return scanActivities(activityRoot)
}
