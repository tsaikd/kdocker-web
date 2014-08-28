app

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
		port: 2375,
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

;
