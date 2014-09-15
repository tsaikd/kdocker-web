app

.controller("TagImageModalCtrl"
	, [       "$scope", "$modalInstance", "DockerData", "image"
	, function($scope,   $modalInstance,   DockerData,   image) {

	$scope.DockerData = DockerData;
	$scope.image = image;
	$scope.query = {
		Id: image.Id,
		repotag: ""
	};

	$scope.ok = function () {
		if (!$scope.query.repotag) {
			return $scope.cancel();
		}
		$modalInstance.close({
			query: $scope.query
		});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

}])

;
