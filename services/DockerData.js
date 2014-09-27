app

.factory("DockerData"
	, [       "localStorageService", "DockerHost", "RegistryHost"
	, function(localStorageService,   DockerHost,   RegistryHost) {

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
			$scope.curRegistryIdx = -1;
			$scope.registryHosts = [];
		};

		$scope.load = function() {
			var key, value;

			init();

			key = "curDockerIdx";
			value = localStorageService.get(key);
			if (value !== undefined && value !== null) {
				$scope[key] = "" + value;
			}

			key = "dockerHosts";
			value = localStorageService.get(key);
			if (value !== undefined && value !== null) {
				angular.forEach(value, function(val) {
					$scope[key].push(new DockerHost(val));
				});
			}

			key = "curRegistryIdx";
			value = localStorageService.get(key);
			if (value !== undefined && value !== null) {
				$scope[key] = "" + value;
			}

			key = "registryHosts";
			value = localStorageService.get(key);
			if (value !== undefined && value !== null) {
				angular.forEach(value, function(val) {
					$scope[key].push(new RegistryHost(val));
				});
			}
		};
		$scope.load();

		$scope.save = function() {
			var keys;

			keys = ["curDockerIdx", "curRegistryIdx"];
			angular.forEach(keys, function(key) {
				if ($scope[key] >= 0) {
					localStorageService.set(key, $scope[key]);
				} else {
					localStorageService.remove(key);
				}
			});

			keys = ["dockerHosts", "registryHosts"];
			angular.forEach(keys, function(key) {
				if ($scope[key] && $scope[key].length) {
					localStorageService.set(key, $scope[key]);
				} else {
					localStorageService.remove(key);
				}
			});
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

		var emptyRegistryHost = new RegistryHost();
		$scope.__defineGetter__("registryHost", function() {
			var $scope = this;
			if ($scope.curRegistryIdx >= 0) {
				if ($scope.registryHosts[$scope.curRegistryIdx]) {
					return $scope.registryHosts[$scope.curRegistryIdx];
				}
				if ($scope.registryHosts[0]) {
					$scope.curRegistryIdx = 0;
					return $scope.registryHosts[$scope.curRegistryIdx];
				}
			}
			if (emptyRegistryHost.valid) {
				emptyRegistryHost = new DockerHost();
			}
			return emptyRegistryHost;
		});

	}

	return new DockerData();
}])

;
