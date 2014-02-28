var app = angular.module("KDockerWeb", [
	"ngAnimate",
	"ui.bootstrap",
	"pascalprecht.translate",
	"LocalStorageModule"
])

.provider("DockerData", function() {
	function DockerData(localStorageService) {
		var $scope = this;

		$scope.version = "0";

		$scope.locales = [
			{
				id: "en-US",
				name: "English"
			},
			{
				id: "zh-TW",
				name: "正體中文"
			}
		];

		$scope.autobind = {
			nickname: { init: "" },
			host: { init: "" },
			port: { init: 4243 },
			apiver: { init: "v1.9" },
			apiurl: { init: "" },
			containers: { init: [] },
			images: { init: [] },
			lastCreateImage: { init: "" },
			dockerList: { init: [] }
		};

		$scope.init = function() {
			angular.forEach($scope.autobind, function(v) {
				delete v.value;
			});
		};

		$scope.reset = function() {
			$scope.init();
			localStorageService.clearAll();
		};

		$scope.getApiUrl = function(data) {
			data = data || $scope;
			if (!data.host) {
				return "";
			}
			var url = "http://" + data.host + ":" + data.port;
			if (data.apiver) {
				url += "/" + data.apiver;
			}
			return url;
		};

		angular.forEach(localStorageService.keys(), function(key) {
			var defvalue = $scope.autobind[key] ? $scope.autobind[key].init : $scope[key];
			var value;
			if (angular.isNumber(defvalue)) {
				value = +localStorageService.get(key);
			} else if (typeof(defvalue) === "boolean") {
				value = localStorageService.get(key) != "false";
			} else {
				value = localStorageService.get(key);
			}
			if ($scope[key] === value) {
				localStorageService.remove(key);
			} else {
				$scope[key] = value;
			}
		});

		angular.forEach($scope.autobind, function(v, key) {
			if ($scope[key] !== undefined && $scope[key] !== $scope.autobind[key].init) {
				$scope.autobind[key].value = $scope[key];
			}
			$scope.__defineGetter__(key, function() {
				if ($scope.autobind[key].value === undefined) {
					return angular.copy($scope.autobind[key].init);
				} else {
					return $scope.autobind[key].value;
				}
			});
			$scope.__defineSetter__(key, function(val) {
				if (key in {"containers":1, "images":1, "dockerList":1}) {
					if (angular.isArray(val) && val.length < 1) {
						val = undefined;
					}
				}
				if ($scope.autobind[key].init === val || val === undefined) {
					delete $scope.autobind[key].value;
					localStorageService.remove(key);
				} else {
					$scope.autobind[key].value = val;
					localStorageService.set(key, val);
				}
				if (key in {"host":1, "port":1, "apiver":1}) {
					$scope.containers = [];
					$scope.images = [];
					$scope.apiurl = $scope.getApiUrl();
				}
			});
		});

	};
	this.$get = ["localStorageService", function(localStorageService) {
		return new DockerData(localStorageService);
	}];
})

.provider("LocationHash", function() {
	function LocationHash() {
		var $scope = this;

		$scope.autobind = {
			tab: { init: "Containers" }
		};

		$scope.getCurMinObj = function() {
			var obj = {};
			var empty = true;
			angular.forEach($scope.autobind, function(v, key) {
				if ($scope.autobind[key].value !== undefined) {
					obj[key] = $scope.autobind[key].value;
					empty = false;
				}
			});
			return empty ? null : obj;
		};

		angular.forEach($scope.autobind, function(v, key) {
			if ($scope[key] !== undefined && $scope[key] !== $scope.autobind[key].init) {
				$scope.autobind[key].value = $scope[key];
			}
			$scope.__defineGetter__(key, function() {
				if ($scope.autobind[key].value === undefined) {
					return angular.copy($scope.autobind[key].init);
				} else {
					return $scope.autobind[key].value;
				}
			});
			$scope.__defineSetter__(key, function(val) {
				if ($scope.autobind[key].init === val || val === undefined) {
					delete $scope.autobind[key].value;
				} else {
					$scope.autobind[key].value = val;
				}
				var obj = $scope.getCurMinObj();
				location.hash = obj ? JSON.stringify(obj) : "";
			});
		});

		try {
			var hash = location.hash.replace(/^#/, "");
			var obj = JSON.parse(hash);
			angular.forEach($scope.autobind, function(v, key) {
				$scope[key] = obj[key];
			});
		} catch(e) {}

	};
	this.$get = function() {
		return new LocationHash();
	};
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
		"Size": "大小",
		"Create Time": "建立時間",
		"Nickname": "名稱",
		"API Version": "API 版本",
		"Tips:": "小提示：",
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
