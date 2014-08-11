app

.controller("CommitContainerModalCtrl"
	, [       "$scope", "$modalInstance", "DockerData", "container"
	, function($scope,   $modalInstance,   DockerData,   container) {

	$scope.DockerData = DockerData;
	$scope.container = container;
	$scope.query = {
		repo: "",
		tag: ""
	};
	$scope.param = {};

	$scope.ok = function () {
		$modalInstance.close({
			query: $scope.query,
			param: $scope.param
		});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

}])

;
