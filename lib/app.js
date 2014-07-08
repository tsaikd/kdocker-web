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
				id: "en",
				name: "English"
			},
			{
				id: "zh_tw",
				name: "正體中文"
			}
		];

		$scope.autobind = {
			nickname: { init: "" },
			host: { init: "" },
			port: { init: 4243 },
			apiver: { init: "" },
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
				if (key in {"containers":1, "images":1}) {
					var setDockerList = false;
					angular.forEach($scope.dockerList, function(d) {
						if (d.apiurl == $scope.apiurl) {
							d.containers = $scope.containers;
							d.images = $scope.images;
							setDockerList = true;
						}
					});
					if (setDockerList) {
						localStorageService.set("dockerList", $scope.dockerList);
					}
				}
				if (key in {"host":1, "port":1, "apiver":1}) {
					$scope.apiurl = $scope.getApiUrl();
					$scope.containers = [];
					$scope.images = [];
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

.config(["$httpProvider", function($httpProvider) {

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
