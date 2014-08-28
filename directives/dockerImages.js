app

.controller("dockerImagesCtrl", function() {})

.directive("dockerImages"
	, [       "DockerData", "$http", "$rootScope", "$modal", "$filter", "DockerAction"
	, function(DockerData,   $http,   $rootScope,   $modal,   $filter,   DockerAction) {
	return {
		restrict: "E",
		templateUrl: "directives/dockerImages.html",
		link: function(scope, elem, attrs) {

			var $scope = scope;
			$scope.DockerData = DockerData;
			DockerData.ImageCtrl = $scope;
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
				if (!DockerData.dockerHost.valid) {
					return;
				}
				if ($scope.loadingCtrl.image) {
					return;
				}
				$scope.loadingCtrl.image = true;
				$scope.predicate = "";
				$scope.reverse = false;
				if (evt && evt.shiftKey) {
					$rootScope.$emit("reload-container");
				}
				$http
				.get(DockerData.dockerHost.apiurl + "/images/json?all=0", {
					errmsg: "Get image list failed"
				})
				.success(function(data) {
					$scope.DockerData.dockerHost.images = data;
					$scope.loadingCtrl.image = false;
				})
				.error(function() {
					$scope.loadingCtrl.image = false;
				});
			};

			$scope.checkReload = function() {
				if (!$scope.DockerData.dockerHost.images.length) {
					$scope.reload();
				}
			};

			$scope.remove = function(image) {
				$http
				.delete(DockerData.dockerHost.apiurl + "/images/" + image.Id, {
					errmsg: "Remove image failed"
				})
				.success(function(data) {
					$scope.reload();
				});
			};

			$scope.removeTag = function(tag) {
				$http
				.delete(DockerData.dockerHost.apiurl + "/images/" + tag, {
					errmsg: "Remove tag failed"
				})
				.success(function(data) {
					$scope.reload();
				});
			};

			$scope.copyImage = function(image, toDockers) {
				if (!toDockers || !toDockers.length) {
					return;
				}

				$http
				.get(DockerData.dockerHost.apiurl + "/images/" + image.Id + "/get", {
					responseType: "blob",
					errmsg: "Get image blob failed"
				})
				.success(function(data) {
					angular.forEach(toDockers, function(docker) {
						$http
						.post(docker.apiurl + "/images/load", data, {
							errmsg: "Upload image blob failed"
						})
						.success(function() {
							var repotag = "";
							if (image.RepoTags && image.RepoTags[0]) {
								repotag = image.RepoTags[0];
							}
							var repo = repotag.replace(/:.*?$/, "");
							var tag = repotag.replace(/^.*:/, "");
							$http
							.post(docker.apiurl + "/images/" + image.Id + "/tag?repo=" + repo + "&tag=" + tag, {}, {
								errmsg: "Tag image failed"
							})
							.success(function() {
								// clean docker images cache
								docker.images.splice(0);
								alert($filter("translate")("Image copyed"));
							});
						});
					});
				});
			};

			$scope.clean = function() {
				angular.forEach(DockerData.dockerHost.images, function(image) {
					if (image && image.RepoTags && image.RepoTags.length === 1 && image.RepoTags[0] === "<none>:<none>") {
						$scope.remove(image);
					}
				});
			};

			$scope.openCreateContainerModal = function(image) {
				DockerAction.openCreateContainerModal(image);
			};

			$scope.openCopyImageModal = function(image) {
				$modal.open({
					templateUrl: "index/CopyImageModalContent.html",
					controller: "CopyImageModalCtrl"
				})
				.result
					.then(function(data) {
						$scope.copyImage(image, data.dockers);
					});
			};

			$rootScope.$on("reload-image", function() {
				$scope.reload();
			});

			$scope.$watch("DockerData.IndexCtrl.tab", function(tab) {
				if (tab in {"Images":1, "Containers":1}) {
					$scope.checkReload();
				}
			});

			$scope.$watch("DockerData.curDockerIdx", function() {
				$scope.checkReload();
			});

			// reload when open page
			$scope.reload();

		}
	};
}])

;
