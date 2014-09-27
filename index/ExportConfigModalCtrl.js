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
		var config = {
			dockerHosts: [],
			registryHosts: []
		};
		angular.forEach(DockerData.dockerHosts, function(dockerHost) {
			config.dockerHosts.push(dockerHost.export());
		});
		angular.forEach(DockerData.registryHosts, function(registryHost) {
			config.registryHosts.push(registryHost.export());
		});
		return JSON.stringify(config);
	}

	$scope.configJson = convConfig2Json();

	$scope.close = function () {
		$modalInstance.close({});
	};

}])

;
