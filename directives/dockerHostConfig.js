app

.controller("dockerHostConfigCtrl", function() {})

.directive("dockerHostConfig"
	, [       "$rootScope", "DockerData", "DockerHost"
	, function($rootScope,   DockerData,   DockerHost) {
	return {
		restrict: "E",
		templateUrl: "directives/dockerHostConfig.html",
		link: function(scope, elem, attrs) {

			var $scope = scope;
			$scope.dockerHost = new DockerHost(DockerData.dockerHost);
			$scope.DockerData = DockerData;
			DockerData.ConfigCtrl = $scope;

			$scope.addDocker = function() {
				var dockerHost = new DockerHost($scope.dockerHost);
				dockerHost.containers = [];
				dockerHost.images = [];
				DockerData.dockerHosts.unshift(dockerHost);
			};

			$scope.delDocker = function(idx) {
				DockerData.dockerHosts.splice(idx, 1);
			};

			$scope.setDocker = function(idx) {
				DockerData.curDockerIdx = "" + idx;
				$scope.dockerHost = new DockerHost(DockerData.dockerHost);
			};

			$scope.moveUp = function(idx) {
				var list = DockerData.dockerHosts;
				list.splice(idx-1, 0, list.splice(idx, 1)[0]);
			};

			$scope.moveDown = function(idx) {
				var list = DockerData.dockerHosts;
				list.splice(idx+1, 0, list.splice(idx, 1)[0]);
			};

			$scope.reset = function() {
				DockerData.reset();
			};

			$rootScope.$on("ConfigCtrl.setDocker", function(e, idx) {
				DockerData.curDockerIdx = "" + idx;
			});

		}
	};
}])

;
