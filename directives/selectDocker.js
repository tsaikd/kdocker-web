app

.directive("selectDocker"
	, [       "$rootScope", "DockerData"
	, function($rootScope,   DockerData) {
	return {
		restrict: "E",
		templateUrl: "directives/selectDocker.html",
		link: function(scope, elem, attrs) {
			scope.DockerData = DockerData;
			scope.curDocker = null;
			angular.forEach(DockerData.dockerList, function(docker) {
				if (scope.curDocker === null && DockerData.apiurl === docker.apiurl) {
					scope.curDocker = docker;
				}
			});

			scope.changeDocker = function() {
				$rootScope.$emit("ConfigCtrl.setDocker", scope.curDocker);
			};
		}
	};
}])

;
