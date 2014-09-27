app

.factory("DockerAction"
	, [       "$q", "$modal", "$http", "DockerData", "$translate"
	, function($q,   $modal,   $http,   DockerData,   $translate) {

	function DockerAction() {}
	var $scope = new DockerAction();

	DockerAction.prototype.parseRepoTag = function(repotag) {
		var ma = repotag.match(/(.*):(.*?)$/);
		var repo, tag;
		if (ma) {
			repo = ma[1];
			tag = ma[2] || "latest";
		} else {
			repo = repotag;
			tag = "latest";
		}
		return {
			repo: repo,
			tag: tag
		};
	};

	DockerAction.prototype.containerStart = function(container, param) {
		var deferred = $q.defer();
		$http
		.post(DockerData.dockerHost.apiurl + "/containers/" + container.Id + "/start", param, {
			errmsg: "Start container failed"
		})
		.success(function() {
			deferred.resolve();
		});
		return deferred.promise;
	};

	DockerAction.prototype.tagImage = function(dockerHost, imageid, repotag) {
		var deferred = $q.defer();
		repotag = $scope.parseRepoTag(repotag);
		$http
		.post(dockerHost.apiurl + "/images/" + imageid + "/tag?repo=" + repotag.repo + "&tag=" + repotag.tag, {}, {
			errmsg: "Tag image failed"
		})
		.success(function() {
			// clean docker images cache
			dockerHost.images.splice(0);
			deferred.resolve();
		});
		return deferred.promise;
	};

	DockerAction.prototype.pullImage = function(dockerHost, repotag) {
		var deferred = $q.defer();
		repotag = $scope.parseRepoTag(repotag);
		$http
		.post(dockerHost.apiurl + "/images/create?fromImage=" + repotag.repo + "&tag=" + repotag.tag, {}, {
			errmsg: "Pull image failed",
			transformResponse: [
				function(data) {
					return data
						.replace(/}{/g, "}\n{")
						.split(/\n+/)
						.filter(function(line) {
							return line;
						});
				}
			]
		})
		.success(function(data) {
			var error = null;
			angular.forEach(data, function(line) {
				if (error) {
					return;
				}
				var msg = JSON.parse(line);
				if (msg.error) {
					error = msg.error;
				}
			});
			if (error) {
				if (DockerData.IndexCtrl) {
					DockerData.IndexCtrl.error(
						$translate.instant("Pull image failed"),
						":",
						error
					);
				}
				deferred.reject(error);
			} else {
				deferred.resolve(data);
			}
		});
		return deferred.promise;
	};

	DockerAction.prototype.pushImage = function(dockerHost, repotag) {
		var deferred = $q.defer();
		repotag = $scope.parseRepoTag(repotag);
		$http
		.post(dockerHost.apiurl + "/images/" + repotag.repo + "/push?tag=" + repotag.tag, {}, {
			errmsg: "Push image failed",
			transformResponse: [
				function(data) {
					return data
						.replace(/}{/g, "}\n{")
						.split(/\n+/)
						.filter(function(line) {
							return line;
						});
				}
			]
		})
		.success(function(data) {
			var error = null;
			angular.forEach(data, function(line) {
				if (error) {
					return;
				}
				var msg = JSON.parse(line);
				if (msg.error) {
					error = msg.error;
				}
			});
			if (error) {
				if (DockerData.IndexCtrl) {
					DockerData.IndexCtrl.error(
						$translate.instant("Push image failed"),
						":",
						error
					);
				}
				deferred.reject(error);
			} else {
				deferred.resolve(data);
			}
		});
		return deferred.promise;
	};

	DockerAction.prototype.openCreateContainerModal = function(image) {
		var deferred = $q.defer();
		$modal.open({
			templateUrl: "index/CreateContainerModalContent.html",
			controller: "CreateContainerModalCtrl",
			resolve: {
				image: function() {
					return image;
				}
			}
		})
		.result
			.then(function(data) {
				var query = "";
				if (data.param.Name) {
					query = "?name=" + data.param.Name;
				}
				$http
				.post(DockerData.dockerHost.apiurl + "/containers/create" + query, data.param, {
					errmsg: "Create container failed"
				})
				.success(function(retcontainer) {
					$scope.containerStart(retcontainer, data.startconfig)
						.then(function() {
							deferred.resolve();
						});
				});
			});
		return deferred.promise;
	};

	DockerAction.prototype.openTagImageModal = function(image) {
		var deferred = $q.defer();
		$modal.open({
			templateUrl: "index/TagImageModalContent.html",
			controller: "TagImageModalCtrl",
			resolve: {
				image: function() {
					return image;
				}
			}
		})
		.result
			.then(function(data) {
				$scope.tagImage(DockerData.dockerHost, data.query.Id, data.query.repotag).then(function() {
					deferred.resolve();
				});
			});
		return deferred.promise;
	};

	return $scope;
}])

;
