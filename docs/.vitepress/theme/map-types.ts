/**
 * 地图数据的公共类型。
 *
 * 校园地图、美食地图分别维护完全独立的数据文件（见 campus-map-data.ts），
 * 这里只定义双方共用的结构，方便复用同一个 MapView 组件。
 */

/** 经纬度坐标，顺序为 [经度, 纬度]，统一使用 GCJ-02（高德坐标系）。 */
export type LngLat = [number, number]

/** 简化版 Iconify 图标数据（与 @iconify-icons/* 导出的结构兼容），用于标记里的分类小图标。 */
export interface MapIconData {
	/** 图标内部的 SVG 内容 */
	body: string
	width?: number
	height?: number
}

/** 点位分类；每个数据集自己定义分类表。 */
export interface MapCategory {
	/** 分类标识，用于点位引用与筛选 */
	id: string
	/** 展示名称 */
	label: string
	/** 标记颜色（CSS 颜色值） */
	color: string
	/** 标记中显示的图标（Iconify 图标数据，选填） */
	icon?: MapIconData
}

/** 一个地图点位。 */
export interface MapPoi {
	/** 唯一标识，用于深链 ?focus=<id> */
	id: string
	/** 展示名称 */
	name: string
	/** 同一地点的其他称呼：点击后会在卡片里全部列出（不参与搜索） */
	aliases?: string[]
	/** 分类 id，需存在于所属数据集的 categories 中 */
	category: string
	/** 坐标 [经度, 纬度]（GCJ-02） */
	coord: LngLat
	/** 仅参与搜索的关键词（英文名、拼音等），不会显示在界面上 */
	keywords?: string[]
	/** 信息卡片里的补充说明 */
	description?: string
	/** 信息卡片里的图片，外链地址；按顺序显示，点击打开原图 */
	images?: string[]
	/** 关联的 wiki 文章路径 */
	link?: string
}

/** 一张地图上的一个独立区域（例如一个校区）。 */
export interface MapArea {
	/** 区域标识，用于深链 ?area=<id> */
	id: string
	/** 展示名称 */
	name: string
	/** 初始中心点（GCJ-02） */
	center: LngLat
	/** 初始缩放级别 */
	zoom: number
	/** 区域边界，一圈或多圈闭合多边形（GCJ-02） */
	boundaries: LngLat[][]
	/** 区域内的点位 */
	pois: MapPoi[]
}

/** 底图显示设置（可选，缺省时隐藏底图 POI、显示文字注记）。 */
export interface MapDisplayOptions {
	/** 是否显示高德底图自带的 POI 图标与信息；默认 false，只保留我们自己的点位标记 */
	showPoi?: boolean
	/** 是否显示底图文字注记（路名等）；默认 true */
	showLabels?: boolean
}

/** 一份完整的地图数据。 */
export interface MapDataset {
	/** 数据集标识 */
	id: string
	/** 展示名称 */
	name: string
	/** 底图显示设置 */
	display?: MapDisplayOptions
	/** 分类表 */
	categories: MapCategory[]
	/** 区域列表 */
	areas: MapArea[]
}
