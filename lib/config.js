angular.module("KDockerWeb", [
	"ui.bootstrap",
	"pascalprecht.translate",
	"angular-websocket",
	"LocalStorageModule"
])

.provider("DockerData", function() {
	function DockerData(localStorageService, $http) {
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
			containers: { init: [] },
			images: { init: [] }
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
			var value;
			if (angular.isNumber(DockerData[key])) {
				value = +localStorageService.get(key);
			} else if (typeof(DockerData[key]) === "boolean") {
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
				}
			});
		});

	};
	this.$get = ["localStorageService", "$http", function(localStorageService, $http) {
		return new DockerData(localStorageService, $http);
	}];
})

.config(["$translateProvider"
	, function($translateProvider) {

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
		"Port Type": "類型",
		"Init start config": "初始化設定參數",
		"WebSocket connected: {{url}}": "WebSocket 已連線: {{url}}",
		"WebSocket error: {{url}}": "WebSocket 錯誤: {{url}}",
		"WebSocket closed: {{url}}": "WebSocket 已中斷: {{url}}"
	})
	.preferredLanguage(navigator.language)
	.useStorage("localStorageService");
}])

;
