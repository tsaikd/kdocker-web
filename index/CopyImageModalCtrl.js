app

.controller("CopyImageModalCtrl"
	, [       "$scope", "$modalInstance", "DockerData"
	, function($scope,   $modalInstance,   DockerData) {

	$scope.DockerData = DockerData;
	$scope.checkList = [];

	angular.forEach(DockerData.dockerList, function(docker) {
		$scope.checkList.push({
			checked: false,
			disabled: !!(docker.apiurl === DockerData.apiurl)
		});
	});

	$scope.clickDocker = function(idx) {
		if ($scope.checkList[idx].disabled) {
			return;
		}
		$scope.checkList[idx].checked = !$scope.checkList[idx].checked;
	};

	$scope.ok = function () {
		var dockers = [];
		angular.forEach($scope.checkList, function(check, idx) {
			if (check.checked) {
				dockers.push(DockerData.dockerList[idx]);
			}
		});
		$modalInstance.close({
			dockers: dockers
		});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

}])

;
