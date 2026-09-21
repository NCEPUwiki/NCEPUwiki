import type { Article, CategoryCount } from './types.ts'

/**
 * 分类只由 frontmatter 的 categories 决定，和文章放在哪个目录无关。
 *
 * 层级只由缩进表示：
 *
 * ```yaml
 * categories:
 *   - 学习专题
 *     - 竞赛专题
 * ```
 *
 * YAML 会把这段缩进解析成一行「学习专题 - 竞赛专题」，所以解析时按「 - 」拆回层级，
 * 再拼成站内使用的完整路径「学习专题/竞赛专题」。没有缩进的多条就是同级分类：
 *
 * ```yaml
 * categories:
 *   - 学习专题
 *   - 竞赛专题
 * ```
 *
 * 上级和更深路径都写上时两条都算，文章会同时出现在这两个分类里：
 *
 * ```yaml
 * categories:
 *   - 学习专题
 *     - 竞赛专题
 *   - 学习专题
 * ```
 */
function segments(value: string): string[] {
	return value.split(/\s+-\s+/)
}

/** frontmatter 的 categories 字段 → 去重后的完整分类路径。 */
export function categoryPaths(value: unknown): string[] {
	const entries: unknown[] = Array.isArray(value) ? value : [value]
	const paths = entries
		.filter((entry): entry is string => typeof entry === 'string')
		.map(entry => segments(entry).map(segment => segment.trim()).filter(Boolean).join('/'))
		.filter(Boolean)
	return [...new Set(paths)]
}

/** 分类的上级路径：「学习专题/竞赛专题」→「学习专题」，顶层分类返回空串。 */
export function categoryParent(path: string): string {
	return path.split('/').slice(0, -1).join('/')
}

/** 分类自身的名字：「学习专题/竞赛专题」→「竞赛专题」。 */
export function categoryLeaf(path: string): string {
	return path.split('/').pop() || path
}

/** 某个分类的下一级分类，顺序沿用分类列表（文章多的在前）。 */
export function categoryChildren(categories: CategoryCount[], parent: string): CategoryCount[] {
	return categories.filter(category => categoryParent(category.path) === parent)
}

/** 路径上的所有上级分类：「a/b/c」→「a」「a/b」。 */
function ancestors(path: string): string[] {
	const parts = path.split('/')
	return parts.slice(1).map((_, index) => parts.slice(0, index + 1).join('/'))
}

/**
 * 汇总分类树。
 *
 * 每个节点只统计 frontmatter 里写了这条分类的文章，不会把子分类的文章累加到上级，
 * 所以点进上级分类只会看到声明了它的文章；写了上级也写了子分类的文章两处都会出现。
 * 只有子分类、自己还没被写到的中间层级也会保留节点，方便逐级点进去。
 */
export function collectCategories(articles: Article[]): CategoryCount[] {
	const counts = new Map<string, number>()
	for (const article of articles) {
		for (const path of article.categories) {
			counts.set(path, (counts.get(path) || 0) + 1)
			for (const parent of ancestors(path)) {
				if (!counts.has(parent))
					counts.set(parent, 0)
			}
		}
	}
	return [...counts]
		.map(([path, count]) => ({ name: categoryLeaf(path), path, count }))
		.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path, 'zh-CN', { numeric: true }))
}

/**
 * 把 URL 里的分类参数解析成完整路径。
 *
 * 优先精确匹配；只写末级名字的旧链接（例如 ?category=学习资料）在这个名字唯一时
 * 仍然指向那条分类，只有同名分类存在歧义时才原样返回。
 */
export function resolveCategory(categories: CategoryCount[], value: string): string {
	const target = value.trim()
	if (!target || categories.some(category => category.path === target))
		return target
	const matched = categories.filter(category => category.name === target)
	return matched.length === 1 ? matched[0].path : target
}
