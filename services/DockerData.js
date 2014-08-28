app

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

;
