/**
 * 中国大陆坐标系转换工具。
 *
 * WGS-84（GPS、OpenStreetMap）与 GCJ-02（高德、腾讯）之间有几百米偏移，
 * 把 OSM 等来源的坐标搬到高德地图上之前必须先转换；
 * 高德官方坐标拾取器（https://lbs.amap.com/tools/picker）给出的已经是 GCJ-02，无需转换。
 *
 * 算法与 coordtransform、eviltransform 等公开实现一致。
 */
const PI = Math.PI
const X_PI = (PI * 3000.0) / 180.0
const A = 6378245.0
const EE = 0.006693421622965943

/** 是否位于中国大陆范围（境外不做偏移）。 */
function outOfChina(lng: number, lat: number) {
	return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)
}

function transformLat(x: number, y: number) {
	let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
	ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
	ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0
	ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0
	return ret
}

function transformLng(x: number, y: number) {
	let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
	ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
	ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0
	ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0
	return ret
}

/** WGS-84 → GCJ-02，返回 [经度, 纬度]。 */
export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
	if (outOfChina(lng, lat))
		return [lng, lat]
	const radLat = (lat / 180.0) * PI
	let magic = Math.sin(radLat)
	magic = 1 - EE * magic * magic
	const sqrtMagic = Math.sqrt(magic)
	const dLat = (transformLat(lng - 105.0, lat - 35.0) * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI)
	const dLng = (transformLng(lng - 105.0, lat - 35.0) * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI)
	return [lng + dLng, lat + dLat]
}

/** GCJ-02 → WGS-84（一次近似反解，展示用途足够）。 */
export function gcj02ToWgs84(lng: number, lat: number): [number, number] {
	if (outOfChina(lng, lat))
		return [lng, lat]
	const [shiftLng, shiftLat] = wgs84ToGcj02(lng, lat)
	return [lng + (lng - shiftLng), lat + (lat - shiftLat)]
}

/** GCJ-02 → BD-09（百度坐标系），用于跳转百度地图。 */
export function gcj02ToBd09(lng: number, lat: number): [number, number] {
	const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI)
	const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI)
	return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006]
}
