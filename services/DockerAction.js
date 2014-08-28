app

.factory("DockerAction"
	, [       "$q", "$modal", "$http", "DockerData"
	, function($q,   $modal,   $http,   DockerData) {

	function DockerAction() {}
	var $scope = new DockerAction();

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

	return $scope;
}])

;
