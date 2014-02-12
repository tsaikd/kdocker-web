angular.module("KDockerWeb")

.controller("StartContainerModalCtrl", ["$scope", "$modalInstance", "DockerData", "container"
	, function($scope, $modalInstance, DockerData, container) {

	$scope.DockerData = DockerData;
	$scope.param = {
		PortBindings: {},
		PublishAllPorts: false,
		Privileged: false
	};
	$scope.PortBindings = [{}];

	$scope.ok = function () {
		angular.forEach($scope.PortBindings, function(v) {
			v.pubports = (v.pubports || "").trim();
			v.priport = (v.priport || "").trim();
			if (v.priport && !v.priport.match(/\D/)) {
				var pbs = [];
				if (v.pubports) {
					angular.forEach(v.pubports.split(/\D+/), function(p) {
						pbs.push({
							HostPort: p
						});
					});
				}
				if (!pbs.length) {
					pbs.push({
						"HostPort": "0"
					});
				}
				$scope.param.PortBindings[v.priport + "/" + v.porttype.toLowerCase()] = pbs;
			}
		});
		$modalInstance.close({
			container: container,
			param: $scope.param
		});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

}])

;
