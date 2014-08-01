app

.controller("StartContainerModalCtrl", ["$scope", "$modalInstance", "DockerData", "container"
	, function($scope, $modalInstance, DockerData, container) {

	$scope.DockerData = DockerData;
	$scope.param = {
		Binds: [""],
		PortBindings: {},
		PublishAllPorts: true,
		Privileged: false,
		VolumesFrom: [],
		Links: []
	};
	$scope.PortBindings = [{}];
	$scope.form = {
		VolumesFrom: [{}],
		Links: [{}]
	};

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

		$scope.param.VolumesFrom = [];
		angular.forEach($scope.form.VolumesFrom, function(vol) {
			vol.from = vol.from || "";
			if (vol.from) {
				if (vol.ro) {
					vol.from += ":ro";
				}
				$scope.param.VolumesFrom.push(vol.from);
			}
		});

		$scope.param.Links = [];
		angular.forEach($scope.form.Links, function(link) {
			link.from = link.from || "";
			if (link.from) {
				link.from = link.from.replace(/^\//, "");
				link.to = link.to || link.from;
				link.to = link.to.replace(/^\//, "");
				$scope.param.Links.push(link.from + ":" + link.to);
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
