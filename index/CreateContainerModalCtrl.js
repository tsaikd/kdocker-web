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
		ExposedPorts: {}
	};
	$scope.startconfig = {
		Binds: [],
		PortBindings: {},
		PublishAllPorts: true,
		Privileged: false
	};
	$scope.extra = {
		Volumes: "",
		Ports: ""
	};
	$scope.moreOptions = false;
	$scope.form = {
		ExposedPorts: ""
	};

	if (DockerData.lastCreateImage) {
		$scope.param.Image = DockerData.lastCreateImage;
	} else if (DockerData.images[0]) {
		$scope.param.Image = DockerData.images[0].Id;
	}

	$scope.ok = function () {
		DockerData.lastCreateImage = $scope.param.Image;
		angular.forEach($scope.form.ExposedPorts.split(/\s+/), function(v) {
			v = (v || "").trim();
			if (v) {
				$scope.param.ExposedPorts[v] = {};
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
