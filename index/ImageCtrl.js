app

.controller("ImageCtrl"
	, [       "$scope", "DockerData", "$http", "$rootScope", "$modal"
	, function($scope,   DockerData,   $http,   $rootScope,   $modal) {

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
		if (!DockerData.host || $scope.loadingCtrl.image) {
			return;
		}
		$scope.loadingCtrl.image = true;
		$scope.predicate = "";
		$scope.reverse = false;
		if (evt && evt.shiftKey) {
			$rootScope.$emit("reload-container");
		}
		$http
		.get(DockerData.apiurl + "/images/json?all=0", {
			errmsg: "Get image list failed"
		})
		.success(function(data) {
			$scope.DockerData.images = data;
			$scope.loadingCtrl.image = false;
		})
		.error(function() {
			$scope.loadingCtrl.image = false;
		});
	};

	$scope.checkReload = function() {
		if (!$scope.DockerData.images.length) {
			$scope.reload();
		}
	};

	$scope.remove = function(image) {
		$http
		.delete(DockerData.apiurl + "/images/" + image.Id, {
			errmsg: "Remove image failed"
		})
		.success(function(data) {
			$scope.reload();
		});
	};

	$scope.removeTag = function(tag) {
		$http
		.delete(DockerData.apiurl + "/images/" + tag, {
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
		.get(DockerData.apiurl + "/images/" + image.Id + "/get", {
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
					$http
					.post(docker.apiurl + "/images/" + image.Id + "/tag?repo=" + image.RepoTags[0], {}, {
						errmsg: "Tag image failed"
					})
					.success(function() {
						// clean docker images cache
						docker.images.splice(0);
					});
				});
			});
		});
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

	// reload when open page
	$scope.reload();

}])

;
