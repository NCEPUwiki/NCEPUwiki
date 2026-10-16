import antfu from '@antfu/eslint-config'
import css from '@zinkawaii/eslint-config-css'

export default antfu({
	// 关闭整套格式风格规则（空格、引号、分号、缩进等纯外观检查）：这些不影响页面结果，
	// 交给各人的编辑器自行处理即可；会挑出真实问题的规则（未使用变量等）保持开启。
	stylistic: false,
	pnpm: false,
	vue: true,
	typescript: true,
	test: false,
	// Historical articles contain teaching examples, not executable project code.
	ignores: ['docs/public/**', 'docs/**/*.md', '**/dist/**', '**/cache/**', '.npm-cache/**'],
	rules: {
		// 导入/导出的排序同样只是整洁度问题，与上面的 stylistic: false 同一原则，不强制
		'perfectionist/sort-imports': 'off',
		'perfectionist/sort-exports': 'off',
		'perfectionist/sort-named-imports': 'off',
		'perfectionist/sort-named-exports': 'off',
		'jsonc/indent': ['error', 2],
		'yaml/indent': ['error', 2],
		'vue/block-lang': ['error', { script: { lang: ['ts'] } }],
		'vue/html-indent': ['error', 'tab', { baseIndent: 0 }],
	},
})
	.append(css, {
		files: ['**/*.css'],
		rules: { 'css-stylistic/indentation': ['error', 'tab'] },
	})
	.setDefaultIgnores(previous => [...previous, '**/*.css'])
