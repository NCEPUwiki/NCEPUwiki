<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter } = useData()

/** frontmatter 的日期可能是 YAML 时间戳（Date）或字符串，统一成 YYYY-MM-DD。 */
function isoDate(value: unknown): string {
	const time = value instanceof Date ? value.getTime() : typeof value === 'string' ? Date.parse(value) : Number.NaN
	return Number.isNaN(time) ? '' : new Date(time).toISOString().slice(0, 10)
}

const created = computed(() => isoDate(frontmatter.value.date))
const updated = computed(() => isoDate(frontmatter.value.lastUpdated))
</script>

<template>
<p v-if="created || updated" class="article-dates"><template v-if="created">创建于 <time :datetime="created">{{ created }}</time></template><template v-if="created && updated">，</template><template v-if="updated">最后更新于 <time :datetime="updated">{{ updated }}</time></template></p>
</template>
