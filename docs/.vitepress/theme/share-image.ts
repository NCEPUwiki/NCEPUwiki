import { renderSVG } from 'uqr'

export async function createShareImage(source: HTMLElement, title: string, url: string, compact: boolean) {
	const { domToBlob } = await import('modern-screenshot')
	const fallbackIcon = document.documentElement.classList.contains('dark') ? '/favicon-dark.svg' : '/favicon-light.svg'
	const stage = document.createElement('div')
	stage.className = 'share-stage'
	stage.setAttribute('aria-hidden', 'true')
	const sheet = document.createElement('article')
	sheet.className = 'share-sheet vp-doc'
	const header = document.createElement('header')
	header.className = 'share-heading'
	const brand = document.createElement('p')
	brand.className = 'share-brand'
	brand.textContent = 'NCEPUwiki · 华电校园知识库'
	const heading = document.createElement('h1')
	heading.textContent = title
	header.append(brand, heading)
	sheet.append(header)
	if (compact) {
		const description = document.createElement('p')
		description.className = 'share-description'
		description.textContent = '在华电，从这里开始。新生入学、学习经验、校园生活——来自同学，服务同学。'
		const topics = document.createElement('ul')
		for (const node of [...source.querySelectorAll('h2')].filter(node => !node.closest('[data-share-exclude]')).slice(0, 6)) {
			const item = document.createElement('li')
			item.textContent = node.textContent?.replace(/\s*#\s*$/, '') || ''
			topics.append(item)
		}
		sheet.append(description, topics)
	}
	else {
		const body = source.cloneNode(true) as HTMLElement
		body.className = 'share-body'
		body.querySelectorAll('h1, .article-meta, [data-share-exclude], .share-dialog, .header-anchor, .wide-footer, .VPDocFooter, script, button').forEach(node => node.remove())
		for (const media of body.querySelectorAll<HTMLElement>('.hover-media')) {
			const target = document.createElement('div')
			const qr = media.dataset.shareQr
			if (qr) {
				target.className = 'wiki-qr'
				target.style.width = '128px'
				target.innerHTML = renderSVG(qr, { border: 4, pixelSize: 4 })
			}
			else if (media.dataset.shareImage) {
				const image = document.createElement('img')
				image.src = media.dataset.shareImage
				image.alt = '联系图片'
				target.append(image)
			}
			media.replaceWith(target)
		}
		body.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'))
		for (const frame of body.querySelectorAll('iframe')) {
			const link = document.createElement('a')
			link.href = frame.src
			link.textContent = `嵌入内容请在原页面查看：${frame.title || frame.src}`
			frame.replaceWith(link)
		}
		body.querySelectorAll('img').forEach(img => img.loading = 'eager')
		sheet.append(body)
	}
	const footer = document.createElement('footer')
	footer.className = 'share-signature'
	const text = document.createElement('div')
	const slogan = document.createElement('strong')
	slogan.textContent = '把校园经验，分享给下一位同学。'
	const address = document.createElement('p')
	address.textContent = url
	const hint = document.createElement('small')
	hint.textContent = '扫码阅读原文，查看最新内容 · 非官方校园知识库'
	text.append(slogan, address, hint)
	const qr = document.createElement('div')
	qr.className = 'share-page-qr'
	qr.innerHTML = renderSVG(url, { border: 4, pixelSize: 4 })
	footer.append(text, qr)
	sheet.append(footer)
	stage.append(sheet)
	document.body.append(stage)
	try {
		await document.fonts.ready
		await Promise.all([...sheet.querySelectorAll('img')].map(async (img) => {
			try {
				await img.decode()
			}
			catch {
				if (img.closest('.group-avatar')) {
					img.src = fallbackIcon
					await img.decode()
					return
				}
				throw new Error(`图片未能载入：${img.alt || img.getAttribute('src')}`)
			}
		}))
		const scale = Math.min(2, 16000 / sheet.scrollHeight)
		if (scale < 0.75)
			throw new Error('页面过长，请选择分享卡片，或使用浏览器打印保存全文。')
		const blob = await domToBlob(sheet, {
			scale,
			backgroundColor: getComputedStyle(sheet).backgroundColor,
			timeout: 15000,
			fetchFn: async (url) => {
				if (!url.startsWith('https://p.qlogo.cn/'))
					return false
				try {
					const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
					if (!response.ok)
						throw new Error('Avatar unavailable')
					const blob = await response.blob()
					return await new Promise<string>((resolve, reject) => {
						const reader = new FileReader()
						reader.onload = () => resolve(String(reader.result))
						reader.onerror = reject
						reader.readAsDataURL(blob)
					})
				}
				catch {
					const svg = await fetch(fallbackIcon).then(response => response.text())
					return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
				}
			},
			fetch: { placeholderImage: () => { throw new Error('部分图片无法嵌入，请选择分享卡片或浏览器打印。') } },
		})
		if (!blob)
			throw new Error('浏览器未能生成图片，请使用分享卡片或浏览器打印。')
		return blob
	}
	finally { stage.remove() }
}
