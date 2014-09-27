app

.factory("RegistryAction"
	, [       "$q", "$modal", "$http", "DockerData"
	, function($q,   $modal,   $http,   DockerData) {

	function RegistryAction() {}
	var $scope = new RegistryAction();

	RegistryAction.prototype.search = function() {
		var deferred = $q.defer();
		$http
		.get(DockerData.registryHost.apiurl + "/search", {
			errmsg: "Search registry failed"
		})
		.success(function(data) {
			deferred.resolve(data);
		});
		return deferred.promise;
	};

	RegistryAction.prototype.searchWithTag = function() {
		var deferred = $q.defer();
		$scope.search()
			.then(function(data) {
				var promises = [];
				angular.forEach(data.results, function(result) {
					promises.push($scope.getTags(result.name));
				});
				$q.all(promises).then(function(tagdata) {
					angular.forEach(tagdata, function(tags, i) {
						data.results[i].tags = tags;
					});
					deferred.resolve(data);
				});
			});
		return deferred.promise;
	};

	RegistryAction.prototype.getTags = function(repo) {
		var deferred = $q.defer();
		repo = repo.replace(/^\/*/, "").replace(/\/*$/, "");
		$http
		.get(DockerData.registryHost.apiurl + "/repositories/" + repo + "/tags", {
			errmsg: "Get registry tag failed"
		})
		.success(function(data) {
			deferred.resolve(data);
		});
		return deferred.promise;
	};

	RegistryAction.prototype.removeTag = function(repo, tag) {
		var deferred = $q.defer();
		repo = repo.replace(/^\/*/, "").replace(/\/*$/, "");
		$http
		.delete(DockerData.registryHost.apiurl + "/repositories/" + repo + "/tags/" + tag, {
			errmsg: "Remove registry image tag failed"
		})
		.success(function(data) {
			deferred.resolve(data);
		});
		return deferred.promise;
	};

	RegistryAction.prototype.removeImage = function(repo) {
		var deferred = $q.defer();
		repo = repo.replace(/^\/*/, "").replace(/\/*$/, "");
		$http
		.delete(DockerData.registryHost.apiurl + "/repositories/" + repo + "/", {
			errmsg: "Remove registry image failed"
		})
		.success(function(data) {
			deferred.resolve(data);
		});
		return deferred.promise;
	};

	return $scope;
}])

;
