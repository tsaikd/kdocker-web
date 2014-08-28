app

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

;
