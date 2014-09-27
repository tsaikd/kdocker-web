app

.controller("dockerHostConfigCtrl", function() {})

.directive("dockerHostConfig"
	, [       "$rootScope", "$modal", "DockerData", "DockerHost", "RegistryHost"
	, function($rootScope,   $modal,   DockerData,   DockerHost,   RegistryHost) {
	return {
		restrict: "E",
		templateUrl: "directives/dockerHostConfig.html",
		link: function(scope, elem, attrs) {

			var $scope = scope;
			$scope.dockerHost = new DockerHost(DockerData.dockerHost);
			$scope.registryHost = new RegistryHost(DockerData.registryHost);
			$scope.DockerData = DockerData;
			DockerData.ConfigCtrl = $scope;

			$scope.addDocker = function() {
				var dockerHost = new DockerHost($scope.dockerHost);
				dockerHost.containers = [];
				dockerHost.images = [];
				DockerData.dockerHosts.unshift(dockerHost);
				DockerData.curDockerIdx = "0";
			};

			$scope.delDocker = function(idx) {
				DockerData.dockerHosts.splice(idx, 1);
			};

			$scope.setDocker = function(idx) {
				DockerData.curDockerIdx = "" + idx;
				$scope.dockerHost = new DockerHost(DockerData.dockerHost);
			};

			$scope.addRegistry = function() {
				var registryHost = new RegistryHost($scope.registryHost);
				DockerData.registryHosts.unshift(registryHost);
				DockerData.curRegistryIdx = "0";
			};

			$scope.delRegistry = function(idx) {
				DockerData.registryHosts.splice(idx, 1);
			};

			$scope.setRegistry = function(idx) {
				DockerData.curRegistryIdx = "" + idx;
				$scope.registryHost = new RegistryHost(DockerData.registryHost);
			};

			$scope.moveUp = function(list, idx) {
				list.splice(idx-1, 0, list.splice(idx, 1)[0]);
			};

			$scope.moveDown = function(list, idx) {
				list.splice(idx+1, 0, list.splice(idx, 1)[0]);
			};

			$scope.reset = function() {
				DockerData.reset();
			};

			$scope.openExportConfigModal = function() {
				$modal.open({
					templateUrl: "index/ExportConfigModalContent.html",
					controller: "ExportConfigModalCtrl"
				});
			};

			$scope.openImportConfigModal = function() {
				$modal.open({
					templateUrl: "index/ImportConfigModalContent.html",
					controller: "ImportConfigModalCtrl"
				})
				.result
					.then(function(config) {
						DockerData.curDockerIdx = -1;
						DockerData.dockerHosts.splice(0);
						DockerData.curRegistryIdx = -1;
						DockerData.registryHosts.splice(0);

						angular.forEach(config.dockerHosts, function(dockerHostConfig) {
							var dockerHost = new DockerHost(dockerHostConfig);
							DockerData.dockerHosts.push(dockerHost);
							DockerData.curDockerIdx = "0";
						});
						angular.forEach(config.registryHosts, function(registryHostConfig) {
							var registryHost = new RegistryHost(registryHostConfig);
							DockerData.registryHosts.push(registryHost);
							DockerData.curRegistryIdx = "0";
						});
					});
			};

			$rootScope.$on("ConfigCtrl.setDocker", function(e, idx) {
				DockerData.curDockerIdx = "" + idx;
			});

		}
	};
}])

;
