app

.directive("selectDocker"
	, [       "DockerData"
	, function(DockerData) {
	return {
		restrict: "E",
		templateUrl: "directives/selectDocker.html",
		link: function(scope, elem, attrs) {
			scope.DockerData = DockerData;
		}
	};
}])

;
