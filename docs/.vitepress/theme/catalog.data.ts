import type { Catalog } from '../types.ts'
import { docsRoot, loadCatalog } from '../catalog.ts'

export declare const data: Catalog

export default {
	watch: [`${docsRoot.replaceAll('\\', '/')}/[0-9]*/**/*.md`],
	load: loadCatalog,
}
