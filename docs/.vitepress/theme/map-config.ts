/**
 * 高德地图（JS API v2）配置。校园地图与以后的美食地图共用同一个 Key。
 *
 * 申请步骤：
 *  1. 打开 https://console.amap.com/dev/key/app ，注册并创建应用；
 *  2. 添加 Key 时应用类型选「Web端(JS API)」；
 *  3. 建议勾选「域名白名单」，填入实际部署域名与 localhost；
 *  4. 把 Key 和安全密钥分别填入下面的字段（v2.0 起两者都需要）。
 *
 * 注意：前端使用的 Key 会随页面公开，这是高德的设计，务必用域名白名单兜底；
 * 留空时地图页会显示配置引导，其余页面不受影响。
 */
export const amapConfig = {
	/** Web端(JS API) Key */
	key: 'bf9b42ca524c0f4d61b45fa50535632b',
	/** 安全密钥 securityJsCode */
	securityJsCode: 'e30f17d0f5e34fe9c9c7a70d72149cbc',
}
