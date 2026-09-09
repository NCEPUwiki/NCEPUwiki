import type { MarkdownOptions } from 'vitepress'
import type { Article } from './types.ts'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import { createMarkdownRenderer } from 'vitepress'

/**
 * 构建期生成的搜索索引（docs/.vitepress/dist/search-index.json）。
 *
 * 每个条目保存一篇文章渲染后的完整纯文本。搜索时不分词、不拆字，
 * 而是把用户输入的整段文字作为连续字符串在 text 中查找，
 * 页面只有“完整包含这段连续文字”才算命中。
 */
export interface SearchRecord {
	/** 页面在站内的路由，例如 /pages/accountpassword */
	route: string
	/** 文章标题（无 Markdown 一级标题时使用 frontmatter/文件名推断） */
	title: string
	/** 文章在目录中的层级，例如 校园生活 / 常用信息 */
	folders: string[]
	/** 渲染后的整篇正文纯文本，供整串匹配和摘要展示 */
	text: string
}

/** 把 Markdown 渲染出的 HTML 粗略转成可读纯文本。 */
function stripHtml(html: string): string {
	const noBlocks = html
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		// 块级结束标签换成换行，让不同段落/表格行自然断开
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(p|div|li|tr|h[1-6]|pre|blockquote|figure)>/gi, '\n')
		.replace(/<\/t[dh]>/gi, ' ')
	return noBlocks
		.replace(/<[^>]+>/g, ' ')
		// 还原常见 HTML 实体（含零宽字符等数字实体），避免夹在正文里影响连续匹配
		.replace(/&nbsp;/g, ' ')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, '\'')
		.replace(/&amp;/g, '&')
		.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
}

/**
 * 在 VitePress buildEnd 阶段调用，把文章列表写入 search-index.json。
 */
export async function writeSearchIndex(options: {
	articles: Article[]
	docsRoot: string
	outDir: string
	markdown: MarkdownOptions
}) {
	const { articles, docsRoot, outDir, markdown } = options
	const md = await createMarkdownRenderer(docsRoot, markdown)
	const records: SearchRecord[] = []

	for (const article of articles) {
		// 只含 frontmatter 的空占位页不进入搜索（正文为空，点进去也没有可跳转内容）
		if (article.empty)
			continue
		const sourcePath = join(docsRoot, article.source)
		const { data: frontmatter, content } = matter(await readFile(sourcePath, 'utf8'))
		// 与旧版保持一致：frontmatter 里声明 search: false 的页面不进索引
		if (frontmatter.search === false)
			continue
		// 用与正式站点一致的 markdown 配置渲染，再剥离标签得到纯文本
		const html = await md.renderAsync(content, { relativePath: article.source, path: sourcePath, cleanUrls: true })
		const text = stripHtml(html)
		if (!text)
			continue
		records.push({
			route: article.url,
			title: article.title,
			folders: article.folders,
			text,
		})
	}

	await writeFile(join(outDir, 'search-index.json'), JSON.stringify(records), 'utf8')
}
