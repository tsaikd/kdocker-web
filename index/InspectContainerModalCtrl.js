app

.directive("inspectElem"
	, [       "$compile"
	, function($compile) {
	return {
		restrict: "E",
		transclude: true,
		scope: {
			attr: "=",
			name: "="
		},
		templateUrl: "index/InspectElem.html",
		compile: function(tElement, tAttr, transclude) {
			var contents = tElement.contents().remove();
			var compiledContents;
			return function(scope, iElement, iAttr) {
				scope.toVal = function(attr) {
					return JSON.stringify(attr);
				};
				if (angular.isArray(scope.attr)) {
					if (angular.isObject(scope.attr[0])) {
						scope.childObjArray = scope.attr;
					} else {
						scope.childArray = scope.attr;
					}
				} else if (angular.isObject(scope.attr)) {
					scope.childObject = scope.attr;
				} else {
					scope.value = scope.toVal(scope.attr);
				}
				if(!compiledContents) {
					compiledContents = $compile(contents, transclude);
				}
				compiledContents(scope, function(clone, scope) {
					iElement.append(clone); 
				});
			};
		}
	};
}])

.controller("InspectContainerModalCtrl", ["$scope", "$modalInstance", "DockerData", "inspect"
	, function($scope, $modalInstance, DockerData, inspect) {

	$scope.DockerData = DockerData;
	$scope.inspect = inspect;

	$scope.name = inspect.Name.replace(/^\//, "");

	$scope.close = function () {
		$modalInstance.close({});
	};

}])

;
