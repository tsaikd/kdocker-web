var app = angular.module("KDockerWeb", [
	"ngAnimate",
	"ui.bootstrap",
	"pascalprecht.translate",
	"LocalStorageModule"
])

.factory("DockerHost", function() {
	function DockerHost(dockerHost) {
		var $scope = this;
		$scope.val = {};
		if (dockerHost) {
			$scope.set(dockerHost.val || dockerHost);
		}
		return $scope;
	}

	DockerHost.prototype.keys = [
		"name",
		"host",
		"port",
		"apiver",
		"containers",
		"images",
		"lastCreateImage"
	];

	DockerHost.prototype.defValue = {
		name: "",
		host: "",
		port: 4243,
		apiver: "",
		containers: [],
		images: [],
		lastCreateImage: ""
	};

	DockerHost.prototype.set = function(dockerHost) {
		var $scope = this;
		angular.forEach($scope.keys, function(key) {
			if (dockerHost[key] === undefined) {
				return;
			}
			if (dockerHost[key] === $scope.defValue[key]) {
				return;
			}
			$scope[key] = angular.copy(dockerHost[key]);
		});
	};

	DockerHost.prototype.export = function() {
		var $scope = this;
		var data = {};
		angular.forEach($scope.keys, function(key) {
			data[key] = angular.copy($scope[key]);
		});
		delete data["containers"];
		delete data["images"];
		return data;
	};

	DockerHost.prototype.__defineGetter__("apiurl", function() {
		var $scope = this;
		var url = "";
		if ($scope.host) {
			url = "http://" + $scope.host;
			if ($scope.port) {
				url += ":" + $scope.port;
			}
			if ($scope.apiver) {
				url += "/" + $scope.apiver;
			}
		}
		return url;
	});

	DockerHost.prototype.__defineGetter__("valid", function() {
		var $scope = this;
		return !!$scope.apiurl;
	});

	angular.forEach(DockerHost.prototype.keys , function(key) {
		DockerHost.prototype.__defineGetter__(key, function() {
			var $scope = this;
			return $scope.val[key] || $scope.defValue[key];
		});
		DockerHost.prototype.__defineSetter__(key, function(v) {
			var $scope = this;
			if (v === undefined) {
				delete $scope.val[key];
				return;
			} else {
				return $scope.val[key] = v;
			}
		});
	});

	return DockerHost;
})

.factory("DockerData"
	, [       "localStorageService", "DockerHost"
	, function(localStorageService,   DockerHost) {

	function DockerData() {
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

		function init() {
			$scope.curDockerIdx = -1;
			$scope.dockerHosts = [];
		};

		$scope.load = function() {
			init();
			var keys = ["curDockerIdx"];
			angular.forEach(keys, function(key) {
				var value = localStorageService.get(key);
				if (value !== undefined && value !== null) {
					$scope[key] = "" + value;
				}
			});
			var keys = ["dockerHosts"];
			angular.forEach(keys, function(key) {
				var values = localStorageService.get(key);
				if (values !== undefined && values !== null) {
					$scope[key] = [];
					angular.forEach(values, function(value) {
						$scope[key].push(new DockerHost(value));
					});
				}
			});
		};
		$scope.load();

		$scope.save = function() {
			var key = "curDockerIdx";
			if ($scope[key] >= 0) {
				localStorageService.set(key, $scope[key]);
			} else {
				localStorageService.remove(key);
			}
			key = "dockerHosts";
			if ($scope[key] && $scope[key].length) {
				localStorageService.set(key, $scope[key]);
			} else {
				localStorageService.remove(key);
			}
		};

		$scope.reset = function() {
			localStorageService.clearAll();
			init();
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

		var emptyDockerHost = new DockerHost();
		$scope.__defineGetter__("dockerHost", function() {
			var $scope = this;
			if ($scope.curDockerIdx >= 0) {
				if ($scope.dockerHosts[$scope.curDockerIdx]) {
					return $scope.dockerHosts[$scope.curDockerIdx];
				}
				if ($scope.dockerHosts[0]) {
					$scope.curDockerIdx = 0;
					return $scope.dockerHosts[$scope.curDockerIdx];
				}
			}
			if (emptyDockerHost.valid) {
				emptyDockerHost = new DockerHost();
			}
			return emptyDockerHost;
		});

	}

	return new DockerData();
}])

.run(
	[         "$rootScope", "DockerData", "$timeout"
	, function($rootScope,   DockerData,   $timeout) {

	$rootScope.DockerData = DockerData;

	var saving = false;
	function save() {
		if (saving) {
			return;
		}
		saving = true;
		$timeout(function() {
			DockerData.save();
			saving = false;
		}, 500);
	}

	$rootScope.$watch("DockerData.curDockerIdx", save);
	$rootScope.$watchCollection("DockerData.dockerHost", save);
	$rootScope.$watchCollection("DockerData.dockerHosts", save);

}])

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
