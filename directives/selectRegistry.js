app

.directive("selectRegistry"
	, [       "DockerData"
	, function(DockerData) {
	return {
		restrict: "E",
		templateUrl: "directives/selectRegistry.html",
		link: function(scope, elem, attrs) {
			scope.DockerData = DockerData;
		}
	};
}])

;
