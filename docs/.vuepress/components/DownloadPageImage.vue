<template>
  <!-- 用同样的 .button 样式，放进按钮组里就能排在一行 -->
  <a class="button" href="javascript:;" @click.prevent="handleDownload">
    下载页面为图片
  </a>
</template>

<script>
export default {
  name: 'DownloadPageImage',
  methods: {
    async handleDownload () {
      if (typeof window === 'undefined') return

      const { default: html2canvas } = await import('html2canvas')

      const target =
        document.querySelector('.theme-vdoing-wrapper') ||
        document.documentElement

      const canvas = await html2canvas(target, {
        scale: 2,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
      })

      const imgData = canvas.toDataURL('image/png')

      // 1. 取文章标题
      const rawTitle =
        (this.$frontmatter && this.$frontmatter.title) ||
        (this.$page && this.$page.title) ||
        (typeof document !== 'undefined' ? document.title : '') ||
        '页面截图'

      // 2. 清理不适合作为文件名的字符
      const safeTitle = rawTitle
        .replace(/[\\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 60)

      // 3. 生成当前时间：YYYY-MM-DD_HH-MM-SS
      const now = new Date()
      const pad = n => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}`

      // 4. 拼成 “标题_时间.png”
      const filename = `${safeTitle || '页面截图'}_${timestamp}.png`

      const link = document.createElement('a')
      link.href = imgData
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<!-- 不写 scoped 样式，直接复用全局的 .button 样式即可 -->
