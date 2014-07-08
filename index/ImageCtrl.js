app

.controller("ImageCtrl"
	, [       "$scope", "DockerData", "$http", "$rootScope"
	, function($scope,   DockerData,   $http,   $rootScope) {

	$scope.DockerData = DockerData;
	DockerData.ImageCtrl = $scope;

	$scope.reload = function(evt) {
		if (!DockerData.host || $scope.loadingCtrl.image) {
			return;
		}
		$scope.loadingCtrl.image = true;
		if (evt && evt.shiftKey) {
			$rootScope.$emit("reload-container");
		}
		$http
		.get(DockerData.apiurl + "/images/json?all=0", {
			errmsg: "Get image list failed"
		})
		.success(function(data) {
			$scope.DockerData.images = data;
			$scope.loadingCtrl.image = false;
		})
		.error(function() {
			$scope.loadingCtrl.image = false;
		});
	};

	$scope.checkReload = function() {
		if (!$scope.DockerData.images.length) {
			$scope.reload();
		}
	};

	$scope.remove = function(image) {
		$http
		.delete(DockerData.apiurl + "/images/" + image.Id, {
			errmsg: "Remove image failed"
		})
		.success(function(data) {
			$scope.reload();
		});
	};

	$scope.removeTag = function(tag) {
		$http
		.delete(DockerData.apiurl + "/images/" + tag, {
			errmsg: "Remove tag failed"
		})
		.success(function(data) {
			$scope.reload();
		});
	};

	$rootScope.$on("reload-image", function() {
		$scope.reload();
	});

	$scope.$watch("DockerData.IndexCtrl.tab", function(tab) {
		if (tab in {"Images":1, "Containers":1}) {
			$scope.checkReload();
		}
	});

	// reload when open page
	$scope.reload();

}])

;
