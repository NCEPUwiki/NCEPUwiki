import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import test from 'node:test'
import { scanActivities } from '../docs/.vitepress/activity.ts'

test('activity loader sorts by date and ignores README/underscore files', () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-activity-'))
	try {
		writeFileSync(join(root, 'README.md'), '')
		writeFileSync(join(root, '_template.md'), '')
		writeFileSync(join(root, '02.第二场.md'), '---\ntitle: 第二场\ndate: 2026-09-15\ncampus: 保定\nvenue: 教十一\n---\n')
		writeFileSync(join(root, '01.第一场.md'), '---\ntitle: 第一场\ndate: 2026-09-12\nend: 2026-09-13\nlink: https://example.com\ndescription: 先开始的活动\n---\n报名方式见[链接](https://example.com)。')
		const activities = scanActivities(root)
		assert.deepEqual(activities.map(activity => activity.title), ['第一场', '第二场'])
		assert.equal(activities[0].end, '2026-09-13')
		assert.equal(activities[1].link, undefined)
		assert.equal(activities[1].description, undefined)
		assert.equal(activities[0].body, '报名方式见[链接](https://example.com)。')
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})

test('activity loader rejects missing title or invalid dates', () => {
	const root = mkdtempSync(join(tmpdir(), 'ncepu-activity-invalid-'))
	try {
		writeFileSync(join(root, '无标题.md'), '---\ndate: 2026-09-12\n---\n')
		assert.throws(() => scanActivities(root), /缺少 title/)
		writeFileSync(join(root, '无标题.md'), '---\ntitle: 日期错误\ndate: 2026/09/12\n---\n')
		assert.throws(() => scanActivities(root), /date 必须是 YYYY-MM-DD/)
		writeFileSync(join(root, '无标题.md'), '---\ntitle: 结束日期错误\ndate: 2026-09-12\nend: 9月13日\n---\n')
		assert.throws(() => scanActivities(root), /end 必须是 YYYY-MM-DD/)
	}
	finally {
		const target = relative(tmpdir(), root)
		assert.ok(target && !target.startsWith('..') && !isAbsolute(target))
		rmSync(root, { recursive: true, force: true })
	}
})
