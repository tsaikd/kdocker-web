angular.module("KDockerWeb")

.controller("CreateContainerModalCtrl", ["$scope", "$modalInstance", "DockerData"
	, function($scope, $modalInstance, DockerData) {

	$scope.DockerData = DockerData;
	$scope.param = {
		Memory: 0,
		MemorySwap: 0,
		AttachStdin: true,
		AttachStdout: true,
		AttachStderr: true,
		Tty: true,
		OpenStdin: true,
		StdinOnce: false
	};

	if (DockerData.images[0]) {
		$scope.param.Image = DockerData.images[0].Id;
	}

	$scope.ok = function () {
		$modalInstance.close($scope.param);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

}])

;
