app

.controller("registryImagesCtrl", function() {})

.directive("registryImages"
	, [       "DockerData", "RegistryAction", "$rootScope"
	, function(DockerData,   RegistryAction,   $rootScope) {
	return {
		restrict: "E",
		templateUrl: "directives/registryImages.html",
		link: function(scope, elem, attrs) {

			var $scope = scope;
			$scope.DockerData = DockerData;
			$scope.RegistryAction = RegistryAction;
			DockerData.RegistryCtrl = $scope;
			$scope.predicate = "";
			$scope.reverse = false;

			$scope.sortConfig = function(field) {
				if ($scope.predicate === field) {
					$scope.reverse = !$scope.reverse;
				} else {
					$scope.predicate = field;
					$scope.reverse = false;
				}
			};

			$scope.reload = function(evt) {
				if (!DockerData.registryHost.valid) {
					return;
				}
				if ($scope.loadingCtrl.registry) {
					return;
				}
				$scope.loadingCtrl.registry = true;
				$scope.predicate = "";
				$scope.reverse = false;
				RegistryAction.searchWithTag()
					.then(function(data) {
						DockerData.registryHost.images = data.results;
					})
					.finally(function() {
						$scope.loadingCtrl.registry = false;
					});
			};

			$scope.checkReload = function() {
				if (!$scope.DockerData.dockerHost.images.length) {
					$scope.reload();
				}
			};

			$scope.remove = function(image) {
				RegistryAction.removeImage(image.name)
					.then(function() {
						$scope.reload();
					});
			};

			$scope.removeTag = function(image, tag) {
				RegistryAction.removeTag(image.name, tag)
					.then(function() {
						$scope.reload();
					});
			};

			$rootScope.$on("reload-registry", function() {
				$scope.reload();
			});

			$scope.$watch("DockerData.curRegistryIdx", function() {
				$scope.checkReload();
			});

			// reload when open page
			$scope.reload();
		}
	};
}])

;
