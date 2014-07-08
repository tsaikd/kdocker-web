app

.controller("StartContainerModalCtrl", ["$scope", "$modalInstance", "DockerData", "container"
	, function($scope, $modalInstance, DockerData, container) {

	$scope.DockerData = DockerData;
	$scope.param = {
		Binds: [""],
		PortBindings: {},
		PublishAllPorts: true,
		Privileged: false,
		VolumesFrom: []
	};
	$scope.PortBindings = [{}];
	$scope.VolumesFrom = [{}];

	$scope.ok = function () {
		var binds = [];
		angular.forEach($scope.param.Binds, function(v) {
			v = (v || "").trim();
			if (v) {
				binds.push(v);
			}
		});
		$scope.param.Binds = binds;

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
					pbs.push({});
				}
				$scope.param.PortBindings[v.priport + "/" + v.porttype.toLowerCase()] = pbs;
			}
		});

		angular.forEach($scope.VolumesFrom, function(v) {
			if (v) {
				if (v.name) {
					var vol = v.name.trim();
					if (v.ro) {
						vol += ":ro";
					}
					$scope.param.VolumesFrom.push(vol);
				}
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
