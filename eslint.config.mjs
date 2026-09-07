import antfu from '@antfu/eslint-config'
import css from '@zinkawaii/eslint-config-css'

export default antfu({
	stylistic: { indent: 'tab' },
	pnpm: false,
	vue: true,
	typescript: true,
	test: false,
	// Historical articles contain teaching examples, not executable project code.
	ignores: ['docs/public/**', 'docs/**/*.md', '**/dist/**', '**/cache/**', '.npm-cache/**'],
	rules: {
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
