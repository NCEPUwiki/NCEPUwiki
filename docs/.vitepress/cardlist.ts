import type { MarkdownRenderer } from 'vitepress'
import qqIcon from '@iconify-icons/ri/qq-fill'
import kitchen from '@iconify-icons/ri/restaurant-line'

/** Keep editorial data in Markdown tables while rendering semantic cards. */
export function cardlist(md: MarkdownRenderer) {
	md.block.ruler.before('fence', 'cardlist', (state, start, end, silent) => {
		const line = (index: number) => state.src.slice(state.bMarks[index] + state.tShift[index], state.eMarks[index]).trim()
		if (line(start) !== '::: cardlist')
			return false
		let close = start + 1
		while (close < end && line(close) !== ':::') close++
		if (close === end)
			return false
		if (silent)
			return true
		const tokens = md.parse(state.getLines(start + 1, close, state.blkIndent, false), state.env)
		const html: string[] = []
		let headers: string[] = []
		let cells: string[] = []
		let isGroup = false
		let isHeader = false
		let inTable = false
		for (const token of tokens) {
			switch (token.type) {
				case 'table_open':
					inTable = true
					headers = []
					html.push('<div class="campus-card-grid" role="list">')
					break
				case 'table_close':
					inTable = false
					html.push('</div>')
					break
				case 'thead_open':
					isHeader = true
					break
				case 'thead_close':
					isHeader = false
					break
				case 'tr_open':
					cells = []
					break
				case 'tr_close':
					if (isHeader) {
						headers = cells
						isGroup = headers.some(header => /群号|加入方式|二维码/.test(header))
						html[html.length - 1] = `<div class="campus-card-grid ${isGroup ? 'group-cards' : 'food-cards'}" role="list">`
						break
					}
					html.push('<article class="campus-card" role="listitem">')
					if (isGroup) {
						const qq = cells[1]?.replace(/<[^>]*>/g, '').match(/\b\d{5,12}\b/)?.[0] || ''
						html.push(`<GroupAvatar qq="${qq}" />`)
					}
					else {
						html.push(`<span class="food-card-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${kitchen.body}</svg></span>`)
					}
					html.push(`<h3 class="campus-card-title">${cells[0]}</h3>`)
					for (let i = 1; i < cells.length; i++) {
						if (!cells[i].trim())
							continue
						const label = headers[i] || ''
						const value = cells[i].replace(/<QrCode\b/g, '<HoverMedia kind="qr"')
						if (isGroup && /备注/.test(label)) {
							html.push(`<div class="card-badges">${value}</div>`)
						}
						else if (/菜品/.test(label)) {
							const scores = value.split('-')
							html.push(`<div class="food-scores" aria-label="${label}">${scores.map((score, index) => `<span>${['菜品', '菜量', '环境', '总体'][index] || ''} <b>${score}</b></span>`).join('')}</div>`)
						}
						else if (/评价|主要工作/.test(label)) {
							html.push(`<div class="card-description">${value}</div>`)
						}
						else if (isGroup && /群号|加入方式/.test(label)) {
							html.push(`<div class="group-contact"><svg aria-label="QQ群号" role="img" viewBox="0 0 24 24">${qqIcon.body}</svg><div>${value}</div></div>`)
						}
						else if (isGroup && /二维码/.test(label)) {
							html.push(value)
						}
						else {
							html.push(`<div class="campus-card-field"><span class="campus-card-label">${label}</span><div>${value}</div></div>`)
						}
					}
					html.push('</article>')
					break
				case 'inline':
					if (inTable)
						cells.push(md.renderer.renderInline(token.children || [], md.options, state.env))
					else html.push(md.renderer.render([token], md.options, state.env))
					break
				default:
					if (!inTable)
						html.push(md.renderer.render([token], md.options, state.env))
			}
		}
		const token = state.push('html_block', '', 0)
		token.content = `${html.join('\n')}\n`
		token.map = [start, close + 1]
		state.line = close + 1
		return true
	}, { alt: ['paragraph', 'reference', 'blockquote', 'list'] })
}
