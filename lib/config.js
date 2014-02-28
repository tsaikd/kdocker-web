var app = angular.module("KDockerWeb", [
	"ngAnimate",
	"ui.bootstrap",
	"pascalprecht.translate",
	"LocalStorageModule"
])

.provider("DockerData", function() {
	function DockerData(localStorageService) {
		var DockerData = this;

		DockerData.version = "0";

		DockerData.locales = [
			{
				id: "en-US",
				name: "English"
			},
			{
				id: "zh-TW",
				name: "正體中文"
			}
		];

		DockerData.autobind = {
			host: { init: "" },
			port: { init: 4243 },
			apiver: { init: "v1.9" },
			apiurl: { init: "" },
			containers: { init: [] },
			images: { init: [] },
			lastCreateImage: { init: "" }
		};

		DockerData.init = function() {
			angular.forEach(DockerData.autobind, function(v) {
				delete v.value;
			});
		};

		DockerData.reset = function() {
			DockerData.init();
			localStorageService.clearAll();
		};

		angular.forEach(localStorageService.keys(), function(key) {
			var defvalue = DockerData.autobind[key] ? DockerData.autobind[key].init : DockerData[key];
			var value;
			if (angular.isNumber(defvalue)) {
				value = +localStorageService.get(key);
			} else if (typeof(defvalue) === "boolean") {
				value = localStorageService.get(key) != "false";
			} else {
				value = localStorageService.get(key);
			}
			if (DockerData[key] === value) {
				localStorageService.remove(key);
			} else {
				DockerData[key] = value;
			}
		});

		angular.forEach(DockerData.autobind, function(v, key) {
			if (DockerData[key] !== undefined && DockerData[key] !== DockerData.autobind[key].init) {
				DockerData.autobind[key].value = DockerData[key];
			}
			DockerData.__defineGetter__(key, function() {
				if (DockerData.autobind[key].value === undefined) {
					return DockerData.autobind[key].init;
				} else {
					return DockerData.autobind[key].value;
				}
			});
			DockerData.__defineSetter__(key, function(val) {
				if (key in {"containers":1, "images":1}) {
					if (angular.isArray(val) && val.length < 1) {
						val = undefined;
					}
				}
				if (DockerData.autobind[key].init === val || val === undefined) {
					delete DockerData.autobind[key].value;
					localStorageService.remove(key);
				} else {
					DockerData.autobind[key].value = val;
					localStorageService.set(key, val);
				}
				if (key in {"host":1, "port":1, "apiver":1}) {
					DockerData.containers = [];
					DockerData.images = [];
					DockerData.apiurl = "http://" + DockerData.host + ":" + DockerData.port;
					if (DockerData.apiver) {
						DockerData.apiurl += "/" + DockerData.apiver;
					}
				}
			});
		});
	};
	this.$get = ["localStorageService", function(localStorageService) {
		return new DockerData(localStorageService);
	}];
})

.config(["$translateProvider", "$httpProvider"
	, function($translateProvider, $httpProvider) {

	$translateProvider
	.translations("zh-TW", {
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
		"WebSocket connected: {{url}}": "WebSocket 已連線: {{url}}",
		"WebSocket error: {{url}}": "WebSocket 錯誤: {{url}}",
		"WebSocket closed: {{url}}": "WebSocket 已中斷: {{url}}",
		"Tips:": "小提示:",
		"If you connect to docker remote api failed, try the following steps:": "如果您連線到 Docker Remote API 時出現問題，請嘗試下列步驟：",
		"Check docker remote api port is opened, and not blocked by firewall.": "檢查 Docker Remote API 的 Port 是否開啟，並檢查防火牆的設定。",
		"Downgrade the api version, like v1.8, v1.7...etc, or keep empty.": "試著將 API 的版本降低，例如 v1.8 或是 v1.7 ，也可以試著留空。",
		"Click Reset button and try again.": "點擊重設按鈕，再設定一次。"
	})
	.preferredLanguage(navigator.language)
	.useStorage("localStorageService");

	var defTrans = {};
	angular.forEach($translateProvider.translations("zh-TW"), function(v, key) {
		if (key.match(/{{.*}}/)) {
			defTrans[key] = key;
		}
	});
	$translateProvider.translations("en-US", defTrans);

	$httpProvider.interceptors.push(["$q", "DockerData", "$filter"
		, function($q, DockerData, $filter) {
		return {
			responseError: function(rejection) {
				if (DockerData.IndexCtrl && rejection.config.errmsg) {
					DockerData.IndexCtrl.error(
						"[" + rejection.status + "]",
						$filter("translate")(rejection.config.errmsg),
						rejection.data ? ":" : "",
						rejection.data
					);
				}
				return $q.reject(rejection);
			}
		};
	}]);
}])

;
