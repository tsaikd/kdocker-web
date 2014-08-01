app

.controller("CreateContainerModalCtrl", ["$scope", "$modalInstance", "DockerData"
	, function($scope, $modalInstance, DockerData) {

	$scope.DockerData = DockerData;
	$scope.param = {
		Name: "",
		Cmd: "",
		Hostname: "",
		User: "",
		Memory: 0,
		MemorySwap: 0,
		AttachStdin: true,
		AttachStdout: true,
		AttachStderr: true,
		Tty: true,
		OpenStdin: true,
		StdinOnce: false,
		Volumes: {},
		Links: [],
		ExposedPorts: {}
	};
	$scope.startconfig = {
		Binds: [],
		PortBindings: {},
		PublishAllPorts: true,
		Privileged: false,
		VolumesFrom: [],
		Links: []
	};
	$scope.extra = {
		Volumes: "",
		Ports: ""
	};
	$scope.moreOptions = false;
	$scope.form = {
		ExposedPorts: "",
		VolumesFrom: [{}],
		Links: [{}]
	};

	if (DockerData.dockerHost.lastCreateImage) {
		$scope.param.Image = DockerData.dockerHost.lastCreateImage;
	} else if (DockerData.dockerHost.images[0]) {
		$scope.param.Image = DockerData.dockerHost.images[0].Id;
	}

	$scope.ok = function () {
		DockerData.dockerHost.lastCreateImage = $scope.param.Image;
		DockerData.save();

		angular.forEach($scope.form.ExposedPorts.split(/\s+/), function(v) {
			v = (v || "").trim();
			if (v) {
				$scope.param.ExposedPorts[v] = {};
			}
		});

		$scope.startconfig.Links = [];
		angular.forEach($scope.form.Links, function(link) {
			link.from = link.from || "";
			if (link.from) {
				link.from = link.from.replace(/^\//, "");
				link.to = link.to || link.from;
				link.to = link.to.replace(/^\//, "");
				$scope.startconfig.Links.push(link.from + ":" + link.to);
			}
		});

		angular.forEach($scope.extra.Volumes.split(/\s+/), function(v) {
			v = (v || "").trim();
			if (v) {
				if (v.match(/:/)) {
					$scope.param.Volumes[v.split(/:/)[1].trim()] = {};
					$scope.startconfig.Binds.push(v);
				} else {
					$scope.param.Volumes[v] = {};
				}
			}
		});

		$scope.startconfig.VolumesFrom = [];
		angular.forEach($scope.form.VolumesFrom, function(vol) {
			vol.from = vol.from || "";
			if (vol.from) {
				if (vol.ro) {
					vol.from += ":ro";
				}
				$scope.startconfig.VolumesFrom.push(vol.from);
			}
		});

		angular.forEach($scope.extra.Ports.split(/\s+/), function(v) {
			v = (v || "").trim();
			if (v) {
				if (v.match(/:/)) {
					var hostPort = v.split(/:/)[0].trim();
					var containerPort = v.split(/:/)[1].trim();
					$scope.startconfig.PortBindings[containerPort] = $scope.startconfig.PortBindings[containerPort] || [];
					$scope.startconfig.PortBindings[containerPort].push({
						HostPort: hostPort
					});
				} else {
					$scope.startconfig.PortBindings[v] = [{}];
				}
			}
		});

		$modalInstance.close({
			param: $scope.param,
			startconfig: $scope.startconfig
		});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

}])

;
