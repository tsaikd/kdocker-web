app

.controller("ConfigCtrl", ["$scope", "DockerData"
	, function($scope, DockerData) {

	$scope.DockerData = DockerData;
	DockerData.ConfigCtrl = $scope;

	$scope.addDocker = function() {
		if (!DockerData.host) {
			return;
		}
		var list = $scope.DockerData.dockerList;
		list.unshift({
			nickname: $scope.DockerData.nickname,
			host: $scope.DockerData.host,
			port: $scope.DockerData.port,
			apiver: $scope.DockerData.apiver,
			apiurl: $scope.DockerData.apiurl,
			containers: $scope.DockerData.containers,
			images: $scope.DockerData.images,
			lastCreateImage: $scope.DockerData.lastCreateImage
		});
		$scope.DockerData.dockerList = list;
	};

	$scope.delDocker = function(idx) {
		var list = $scope.DockerData.dockerList;
		list.splice(idx, 1);
		$scope.DockerData.dockerList = list;
	};

	$scope.setDocker = function(docker) {
		docker = angular.copy(docker);
		angular.forEach(["nickname", "host", "port", "apiver", "containers", "images", "lastCreateImage"], function(key) {
			DockerData[key] = docker[key];
		});
	};

	$scope.moveUp = function(idx) {
		var list = $scope.DockerData.dockerList;
		list.splice(idx-1, 0, list.splice(idx, 1)[0]);
		$scope.DockerData.dockerList = list;
	};

	$scope.moveDown = function(idx) {
		var list = $scope.DockerData.dockerList;
		list.splice(idx+1, 0, list.splice(idx, 1)[0]);
		$scope.DockerData.dockerList = list;
	};

}])

;
