app

.config(["$translateProvider", function($translateProvider) {

	$translateProvider
	.translations("zh_tw", {
		"OK": "確定",
		"Cancel": "取消",
		"Config": "設定",
		"Description": "說明",
		"Status": "狀態",
		"Create": "建立",
		"Action": "操作",
		"Attach": "連線",
		"Start": "啟動",
		"Stop": "停止",
		"Remove": "刪除",
		"Reset" : "重設",
		"Port Type": "類型",
		"More options": "更多設定",
		"Init start config": "初始化設定參數",
		"Get container list failed": "無法取得 Container 列表",
		"Get image list failed": "無法取得 Image 列表",
		"Create container failed": "無法建立 Container",
		"Start container failed": "無法啟動 Container",
		"Stop container failed": "無法停止 Container",
		"Remove container failed": "無法刪除 Container",
		"Remove image failed": "無法刪除 Image",
		"Disconnect to docker web service.": "與 Docker 連線中斷。",
		"Please check network and refresh page.": "請檢查網路連線並重新整理此網頁。",
		"WebSocket connected: {{url}}": "WebSocket 已連線: {{url}}",
		"WebSocket error: {{url}}": "WebSocket 錯誤: {{url}}",
		"WebSocket closed: {{url}}": "WebSocket 已中斷: {{url}}",
		"Press [SHIFT] to reload container list too.": "按住 [SHIFT] 鍵可同時更新 Container 列表",
		"Press [SHIFT] to reload image list too.": "按住 [SHIFT] 鍵可同時更新 Image 列表",
		"Size": "大小",
		"Create Time": "建立時間",
		"Nickname": "名稱",
		"API Version": "API 版本",
		"Tips:": "小提示：",
		"If you connect to docker remote api failed, try the following steps:": "如果您連線到 Docker Remote API 時出現問題，請嘗試下列步驟：",
		"Check docker remote api port is opened, and not blocked by firewall.": "檢查 Docker Remote API 的 Port 是否開啟，並檢查防火牆的設定。",
		"Downgrade the api version, like v1.9, v1.8...etc, or keep empty.": "試著將 API 的版本降低，例如 v1.9 或是 v1.8 ，也可以試著留空。",
		"Click Reset button and try again.": "點擊重設按鈕，再設定一次。"
	});

	var defTrans = {};
	angular.forEach($translateProvider.translations("zh_tw"), function(v, key) {
		if (key.match(/{{.*}}/)) {
			defTrans[key] = key;
		}
	});
	$translateProvider
	.translations("en", defTrans)
	.registerAvailableLanguageKeys(["en", "zh_tw"], {
		"en_us": "en",
		"en_uk": "en",
		"zh_cn": "zh_tw",
		"zh_hk": "zh_tw"
	})
	.useStorage("localStorageService")
	.determinePreferredLanguage();

}])

;
