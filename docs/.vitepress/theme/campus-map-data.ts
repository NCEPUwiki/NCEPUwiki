/**
 * 坐标全部为 GCJ-02（高德坐标系）：
 *  - 在高德地图或 https://lbs.amap.com/tools/picker 拾取到的坐标可以直接填写；
 *  - 若坐标来自 OSM / GPS 设备（WGS-84），先用 gcj02.ts 里的 wgs84ToGcj02 转换。
 *
 * 新增点位：在对应校区的 pois 数组里追加一条即可，
 * name 是地图标记上显示的主名称（只显示这一个）；
 * 其他称呼写在 aliases 里（点击后卡片全部列出，不参与搜索）；搜索命中靠 name 与 keywords。
 * id 建议保持「校区-分类-序号」的格式，页面深链 /map?area=bj&focus=<id> 可直接定位到它。
 */
import type { MapDataset } from './map-types.ts'
import basketballIcon from '@iconify-icons/ri/basketball-line'
import bookOpenIcon from '@iconify-icons/ri/book-open-line'
import briefcaseIcon from '@iconify-icons/ri/briefcase-line'
import bedIcon from '@iconify-icons/ri/hotel-bed-line'
import moreIcon from '@iconify-icons/ri/more-line'
import restaurantIcon from '@iconify-icons/ri/restaurant-2-line'
import storeIcon from '@iconify-icons/ri/store-2-line'

export const campusMapDataset: MapDataset = {
	id: 'campus',
	name: '校园地图',
	// 底图显示：隐藏高德自带的 POI 图标与信息，保留路名等文字注记
	display: { showPoi: false, showLabels: true },
	categories: [
		{ id: 'study', label: '教学科研', color: '#3b82f6', icon: bookOpenIcon },
		{ id: 'dining', label: '食堂餐饮', color: '#f59e0b', icon: restaurantIcon },
		{ id: 'dorm', label: '宿舍公寓', color: '#10b981', icon: bedIcon },
		{ id: 'sports', label: '体育场馆', color: '#06b6d4', icon: basketballIcon },
		{ id: 'service', label: '生活服务', color: '#ec4899', icon: storeIcon },
		{ id: 'admin', label: '行政办公', color: '#64748b', icon: briefcaseIcon },
		{ id: 'other', label: '其他', color: '#94a3b8', icon: moreIcon },
	],
	areas: [
		{
			id: 'bj',
			name: '北京校部',
			center: [116.310372, 40.089553],
			zoom: 16,
			boundaries: [
				[[116.303623, 40.088911], [116.304753, 40.087494], [116.304966, 40.087576], [116.305185, 40.087563], [116.305302, 40.08742], [116.3054, 40.087301], [116.305531, 40.087144], [116.305204, 40.086928], [116.306329, 40.085517], [116.309761, 40.087188], [116.313143, 40.088824], [116.313529, 40.088939], [116.313717, 40.08882], [116.317123, 40.090979], [116.316968, 40.091214], [116.316502, 40.091963], [116.316247, 40.092357], [116.314667, 40.091834], [116.314184, 40.092764], [116.313683, 40.092652], [116.31284, 40.092526], [116.312723, 40.09309], [116.312674, 40.093585], [116.312395, 40.093455], [116.306822, 40.090868], [116.306415, 40.090699], [116.305514, 40.090314], [116.305635, 40.08986], [116.303623, 40.088911]],
			],
			pois: [
				{ id: 'bj-study-01', name: '第二教学楼', category: 'study', coord: [116.308169, 40.089709], keywords: ['No.2 Instruction Building'] },
				{ id: 'bj-study-02', name: '第三教学楼', category: 'study', coord: [116.309658, 40.087943], keywords: ['No.3 Instruction Building'] },
				{ id: 'bj-study-03', name: '第四教学楼', category: 'study', coord: [116.311456, 40.088692], keywords: ['No.4 Instruction Building'] },
				{ id: 'bj-study-04', name: '第五教学楼', category: 'study', coord: [116.313847, 40.091235], keywords: ['No.5 Instruction Building'] },
				{ id: 'bj-study-05', name: '第一教学楼', category: 'study', coord: [116.308549, 40.09039], keywords: ['No.1 Instruction Building'] },
				{ id: 'bj-study-06', name: '风洞实验室', category: 'study', coord: [116.316271, 40.091474], keywords: ['Wind Tunnel Lab'] },
				{ id: 'bj-study-07', name: '高压实验室', category: 'study', coord: [116.31421, 40.09208], keywords: ['High-Voltage Lab'] },
				{ id: 'bj-study-08', name: '工程实验室', category: 'study', coord: [116.316162, 40.090461], keywords: ['Engineering Lab'] },
				{ id: 'bj-study-09', name: '能源电力创新研究院', category: 'study', coord: [116.306236, 40.090278] },
				{ id: 'bj-study-10', name: '主楼', category: 'study', coord: [116.307187, 40.08819] },
				{ id: 'bj-library-01', name: '图书馆', category: 'library', coord: [116.309278, 40.089265], keywords: ['The Library at NCEPU'] },
				{ id: 'bj-dining-01', name: '第二食堂', category: 'dining', coord: [116.310778, 40.091098], keywords: ['No.2 Dining Hall'] },
				{ id: 'bj-dining-02', name: '第三食堂', category: 'dining', coord: [116.313737, 40.090399], keywords: ['No.3 Dining Hall'] },
				{ id: 'bj-dining-03', name: '第一食堂', category: 'dining', coord: [116.310217, 40.090723], keywords: ['No.1 Dining Hall'] },
				{ id: 'bj-dorm-01', name: '15号楼', category: 'dorm', coord: [116.311204, 40.092261] },
				{ id: 'bj-dorm-02', name: '国际学生公寓', category: 'dorm', coord: [116.309919, 40.09206] },
				{ id: 'bj-dorm-03', name: '教工宿舍', category: 'dorm', coord: [116.310197, 40.091868], keywords: ['Staff Residential Hall'] },
				{ id: 'bj-dorm-04', name: '学生公寓10号楼', category: 'dorm', coord: [116.315111, 40.089928], keywords: ['Residential Hall 10'] },
				{ id: 'bj-dorm-05', name: '学生公寓11号楼', category: 'dorm', coord: [116.314723, 40.090676], keywords: ['Residential Hall 11'] },
				{ id: 'bj-dorm-06', name: '学生公寓12号楼', category: 'dorm', coord: [116.314469, 40.090998], keywords: ['Residential Hall 12'] },
				{ id: 'bj-dorm-07', name: '学生公寓13号楼', category: 'dorm', coord: [116.31184, 40.090142], keywords: ['Graduate School'] },
				{ id: 'bj-dorm-08', name: '学生公寓14号楼', category: 'dorm', coord: [116.310481, 40.091469], keywords: ['Residential Hall 14'] },
				{ id: 'bj-dorm-09', name: '学生公寓16号楼', category: 'dorm', coord: [116.309476, 40.091582] },
				{ id: 'bj-dorm-10', name: '学生公寓1号楼', category: 'dorm', coord: [116.310788, 40.090363], keywords: ['Residential Hall 1'] },
				{ id: 'bj-dorm-11', name: '学生公寓2号楼', category: 'dorm', coord: [116.310659, 40.089939], keywords: ['Residential Hall 2'] },
				{ id: 'bj-dorm-12', name: '学生公寓3号楼', category: 'dorm', coord: [116.310646, 40.089476], keywords: ['Residential Hall 3'] },
				{ id: 'bj-dorm-13', name: '学生公寓4号楼', category: 'dorm', coord: [116.311893, 40.089553], keywords: ['Residential Hall 4'] },
				{ id: 'bj-dorm-14', name: '学生公寓5号楼', category: 'dorm', coord: [116.312227, 40.08919] },
				{ id: 'bj-dorm-15', name: '学生公寓7号楼A', category: 'dorm', coord: [116.314221, 40.089831], keywords: ['Residential Hall 7'] },
				{ id: 'bj-dorm-16', name: '学生公寓7号楼B', category: 'dorm', coord: [116.313855, 40.089655] },
				{ id: 'bj-dorm-17', name: '学生公寓8号楼A', category: 'dorm', coord: [116.314441, 40.089545] },
				{ id: 'bj-dorm-18', name: '学生公寓8号楼B', category: 'dorm', coord: [116.314114, 40.089345] },
				{ id: 'bj-dorm-19', name: '学生公寓9号楼', category: 'dorm', coord: [116.314889, 40.09026], keywords: ['Residential Hall 9'] },
				{ id: 'bj-dorm-20', name: '职工宿舍', category: 'dorm', coord: [116.316532, 40.091039] },
				{ id: 'bj-dorm-21', name: '专家公寓', category: 'dorm', coord: [116.310237, 40.092184] },
				{ id: 'bj-sports-01', name: '篮球场', category: 'sports', coord: [116.315368, 40.091813], keywords: ['Basketball Fields at NCEPU'] },
				{ id: 'bj-sports-02', name: '体育场', category: 'sports', coord: [116.311839, 40.091827], keywords: ['NCEPU Stadium'] },
				{ id: 'bj-sports-03', name: '体育馆', category: 'sports', coord: [116.315782, 40.090741] },
				{ id: 'bj-sports-04', name: '网球场', category: 'sports', coord: [116.315399, 40.091237], keywords: ['Tennis Fields at NCEPU'] },
				{ id: 'bj-sports-05', name: '足球场', category: 'sports', coord: [116.311945, 40.091496], keywords: ['Soccer Stadium'] },
				{ id: 'bj-service-01', name: '华校医院', category: 'service', coord: [116.309083, 40.091721], keywords: ['University Hospital'] },
				{ id: 'bj-service-02', name: '首联超市', category: 'service', coord: [116.309829, 40.091189] },
				{ id: 'bj-service-03', name: '艺豪书店', category: 'service', coord: [116.312556, 40.088775], keywords: ['Book Store'] },
				{ id: 'bj-admin-01', name: '车队', category: 'admin', coord: [116.30954, 40.091185] },
				{ id: 'bj-admin-02', name: '国际交流中心', category: 'admin', coord: [116.312029, 40.092795] },
				{ id: 'bj-admin-03', name: '行政楼', category: 'admin', coord: [116.307393, 40.090779] },
				{ id: 'bj-other-01', name: '礼堂', category: 'other', coord: [116.30763, 40.088438] },
				{ id: 'bj-other-02', name: '校中水站', category: 'other', coord: [116.312097, 40.092443] },
			],
		},
		{
			id: 'bd1',
			name: '保定一校区',
			center: [115.505247, 38.877325],
			zoom: 17,
			boundaries: [
				[[115.502683, 38.875342], [115.505144, 38.874914], [115.505265, 38.875325], [115.50628, 38.875124], [115.50781, 38.878494], [115.506323, 38.878773], [115.506462, 38.879453], [115.504915, 38.879737], [115.502683, 38.875484], [115.502683, 38.875342]],
			],
			pois: [
				{ id: 'bd1-study-01', name: '教二楼', category: 'study', coord: [115.506395, 38.876983], aliases: ['教二', '教2楼'] },
				{ id: 'bd1-study-02', name: '教三楼', category: 'study', coord: [115.506781, 38.878557] },
				{ id: 'bd1-study-03', name: '教四楼', category: 'study', coord: [115.504333, 38.877286] },
				{ id: 'bd1-study-04', name: '教五楼', category: 'study', coord: [115.505002, 38.87728] },
				{ id: 'bd1-study-05', name: '教一楼', category: 'study', coord: [115.506322, 38.877913] },
				{ id: 'bd1-study-06', name: '自动化系', category: 'study', coord: [115.504204, 38.876268] },
				{ id: 'bd1-study-07', name: '综合楼', category: 'study', coord: [115.503742, 38.87605] },
				{ id: 'bd1-library-01', name: '图书馆A', category: 'library', coord: [115.505131, 38.876566] },
				{ id: 'bd1-library-02', name: '图书馆B', category: 'library', coord: [115.505073, 38.87614] },
				{ id: 'bd1-dining-01', name: '食堂（一餐厅）', category: 'dining', coord: [115.504729, 38.878407] },
				{ id: 'bd1-dorm-01', name: '单身楼', category: 'dorm', coord: [115.503121, 38.875465] },
				{ id: 'bd1-dorm-02', name: '学1舍', category: 'dorm', coord: [115.50575, 38.879066] },
				{ id: 'bd1-dorm-03', name: '学2舍', category: 'dorm', coord: [115.505074, 38.879414] },
				{ id: 'bd1-dorm-04', name: '学3舍', category: 'dorm', coord: [115.504784, 38.878844] },
				{ id: 'bd1-dorm-05', name: '学4舍', category: 'dorm', coord: [115.505653, 38.878664] },
				{ id: 'bd1-dorm-06', name: '学5舍', category: 'dorm', coord: [115.505667, 38.87544] },
				{ id: 'bd1-dorm-07', name: '研究生公寓', category: 'dorm', coord: [115.50488, 38.875652] },
				{ id: 'bd1-sports-01', name: '篮球场', category: 'sports', coord: [115.5056, 38.878291] },
				{ id: 'bd1-sports-02', name: '羽毛球场（排球场）', category: 'sports', coord: [115.505491, 38.87787] },
				{ id: 'bd1-service-01', name: '校医院', category: 'service', coord: [115.505784, 38.879402] },
				{ id: 'bd1-other-01', name: '跳伞塔', category: 'other', coord: [115.505326, 38.878355] },
			],
		},
		{
			id: 'bd2',
			name: '保定二校区',
			center: [115.514186, 38.888922],
			zoom: 16,
			boundaries: [
				[[115.508261, 38.886543], [115.508601, 38.886535], [115.509103, 38.886471], [115.512591, 38.886043], [115.512593, 38.886075], [115.51349, 38.885957], [115.513466, 38.885869], [115.513343, 38.885797], [115.513819, 38.885743], [115.513718, 38.885837], [115.514463, 38.88574], [115.514538, 38.885975], [115.515419, 38.888744], [115.51907, 38.887976], [115.52011, 38.891112], [115.519361, 38.891266], [115.518858, 38.891276], [115.518284, 38.891287], [115.51496, 38.892101], [115.51369, 38.890923], [115.512348, 38.889793], [115.510704, 38.888276], [115.509482, 38.887391], [115.509035, 38.88708], [115.508261, 38.886543]],
			],
			pois: [
				{ id: 'bd2-study-06', name: '教六', category: 'study', coord: [115.513473, 38.887221], keywords: ['教6'] },
				{ id: 'bd2-study-07', name: '教七', category: 'study', coord: [115.514162, 38.887152], keywords: ['教7'] },
				{ id: 'bd2-study-08a', name: '教八A', category: 'study', coord: [115.515334, 38.889868], keywords: ['教8A', '教八a', '教8a', '教八', '教8'] },
				{ id: 'bd2-study-08b', name: '教八B', category: 'study', coord: [115.514396, 38.890221], keywords: ['教8B', '教八b', '教8b', '教八', '教8'] },
				{ id: 'bd2-study-09a', name: '教九A', category: 'study', coord: [115.513190, 38.886372], keywords: ['教9A', '教九a', '教9a', '教九', '教9', '图书馆'] },
				{ id: 'bd2-study-09b', name: '教九B', category: 'study', coord: [115.513291, 38.886785], keywords: ['教9B', '教九b', '教9b', '教九', '教9'] },
				{ id: 'bd2-study-10a', name: '教十A', category: 'study', coord: [115.514014, 38.886296], keywords: ['教10A', '教十a', '教10a', '教十', '教10'] },
				{ id: 'bd2-study-10b', name: '教十B', category: 'study', coord: [115.514180, 38.886668], keywords: ['教10B', '教十b', '教10b', '教十', '教10'] },
				{ id: 'bd2-study-11', name: '教十一', category: 'study', coord: [115.518403, 38.888822], keywords: ['教11'] },
				{ id: 'bd2-study-12', name: '教十二', category: 'study', coord: [115.510124, 38.886838], keywords: ['教12'] },
				{ id: 'bd2-sports-01', name: '体育中心', category: 'sports', coord: [115.511337, 38.887479] },
			],
		},
	],
}
