var app = angular.module("KDockerWeb", [
	"ngAnimate",
	"ui.bootstrap",
	"pascalprecht.translate",
	"LocalStorageModule"
])

.run(
	[         "$rootScope", "DockerData", "$timeout"
	, function($rootScope,   DockerData,   $timeout) {

	$rootScope.DockerData = DockerData;

	var saving = false;
	function save() {
		if (saving) {
			return;
		}
		saving = true;
		$timeout(function() {
			DockerData.save();
			saving = false;
		}, 500);
	}

	$rootScope.$watch("DockerData.curDockerIdx", save);
	$rootScope.$watchCollection("DockerData.dockerHost", save);
	$rootScope.$watchCollection("DockerData.dockerHosts", save);

}])

.config(["$httpProvider", function($httpProvider) {

	$httpProvider.interceptors.push(["$q", "DockerData", "$filter"
		, function($q, DockerData, $filter) {
		return {
			responseError: function(rejection) {
				if (DockerData.IndexCtrl && rejection.config.errmsg) {
					DockerData.IndexCtrl.error(
						"[" + rejection.status + "]",
						$filter("translate")(rejection.config.errmsg),
						rejection.data ? ":" : "",
						rejection.data
					);
				}
				return $q.reject(rejection);
			}
		};
	}]);
}])

;
