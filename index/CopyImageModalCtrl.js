app

.controller("CopyImageModalCtrl"
	, [       "$scope", "$modalInstance", "DockerData"
	, function($scope,   $modalInstance,   DockerData) {

	$scope.DockerData = DockerData;
	$scope.checkList = [];

	angular.forEach(DockerData.dockerHosts, function(dockerHost) {
		$scope.checkList.push({
			checked: false,
			disabled: !!(dockerHost.apiurl === DockerData.dockerHost.apiurl)
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
				dockers.push(DockerData.dockerHosts[idx]);
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
