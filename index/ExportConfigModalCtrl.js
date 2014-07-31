app

.directive("selectOnClick", function () {
	return {
		restrict: "A",
		link: function (scope, element, attrs) {
			var focusedElement;
			element.on("click", function () {
				if (focusedElement !== this) {
					focusedElement = this;
					this.select();
				}
			});
			element.on("blur", function() {
				focusedElement = null;
			});
		}
	};
})

.controller("ExportConfigModalCtrl"
	, [       "$scope", "$modalInstance", "DockerData"
	, function($scope,   $modalInstance,   DockerData) {

	$scope.DockerData = DockerData;

	function convConfig2Json() {
		var confHosts = [];
		angular.forEach(DockerData.dockerHosts, function(dockerHost) {
			confHosts.push(dockerHost.export());
		});
		return JSON.stringify(confHosts);
	}

	$scope.configJson = convConfig2Json();

	$scope.close = function () {
		$modalInstance.close({});
	};

}])

;
