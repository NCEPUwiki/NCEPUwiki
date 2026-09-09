import type { Activity } from '../types.ts'
import { createMarkdownRenderer } from 'vitepress'
import { activityRoot, loadActivities } from '../activity.ts'
import { docsRoot } from '../catalog.ts'
import config from '../config.mts'

export declare const data: Activity[]

export default {
	watch: [`${activityRoot.replaceAll('\\', '/')}/*.md`],
	async load() {
		const renderer = await createMarkdownRenderer(docsRoot, config.markdown)
		return Promise.all(loadActivities().map(async activity => ({
			...activity,
			html: activity.body ? await renderer.renderAsync(activity.body, { relativePath: `activity/${activity.source}` }) : undefined,
		})))
	},
}
