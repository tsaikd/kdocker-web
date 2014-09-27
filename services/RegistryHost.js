app

.factory("RegistryHost", function() {
	function RegistryHost(registryHost) {
		var $scope = this;
		$scope.val = {};
		if (registryHost) {
			$scope.set(registryHost.val || registryHost);
		}
		return $scope;
	}

	RegistryHost.prototype.keys = [
		"name",
		"host",
		"port",
		"apiver",
		"images"
	];

	RegistryHost.prototype.defValue = {
		name: "",
		host: "",
		port: 5000,
		apiver: "v1",
		images: []
	};

	RegistryHost.prototype.set = function(registryHost) {
		var $scope = this;
		angular.forEach($scope.keys, function(key) {
			if (registryHost[key] === undefined) {
				return;
			}
			if (registryHost[key] === $scope.defValue[key]) {
				return;
			}
			$scope[key] = angular.copy(registryHost[key]);
		});
		return $scope;
	};

	RegistryHost.prototype.export = function() {
		var $scope = this;
		var data = {};
		angular.forEach($scope.keys, function(key) {
			data[key] = angular.copy($scope[key]);
		});
		return data;
	};

	RegistryHost.prototype.__defineGetter__("apiurl", function() {
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

	RegistryHost.prototype.__defineGetter__("valid", function() {
		var $scope = this;
		return !!$scope.apiurl;
	});

	angular.forEach(RegistryHost.prototype.keys , function(key) {
		RegistryHost.prototype.__defineGetter__(key, function() {
			var $scope = this;
			return $scope.val[key] || $scope.defValue[key];
		});
		RegistryHost.prototype.__defineSetter__(key, function(v) {
			var $scope = this;
			if (v === undefined) {
				delete $scope.val[key];
				return;
			} else {
				return $scope.val[key] = v;
			}
		});
	});

	return RegistryHost;
})

;
