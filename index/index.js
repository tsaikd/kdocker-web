angular.module("KDockerWeb")

.filter("humanSize", function () {
	return function (bytes, index) {
		if (bytes <= 0) {
			return 0;
		}
		var s = ["bytes", "kB", "MB", "GB", "TB", "PB"];
		var e = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];
	};
})

.controller("IndexCtrl", ["$scope", "DockerData", "$http", "$translate"
	, function($scope, DockerData, $http, $translate) {

	$scope.DockerData = DockerData;
	DockerData.IndexCtrl = $scope;

	if (DockerData.host) {
		$scope.tab = "Containers";
	} else {
		$scope.tab = "Config";
	}

	$scope.locale = $translate.uses();
	$scope.updateLocale = function() {
		$translate.uses($scope.locale);
	};

	if (DockerData.version == "0") {
		$http
		.post("package.json")
		.success(function(data) {
			DockerData.version = data.version + "-dev";
		});
	}

}])

.controller("ContainerCtrl", ["$scope", "$translate", "$http", "DockerData", "WebSocket", "$modal"
	, function($scope, $translate, $http, DockerData, WebSocket, $modal) {

	$scope.DockerData = DockerData;
	DockerData.ContainerCtrl = $scope;

	$scope.tabs = [];
	$scope.curtab = null;

	$scope.reload = function() {
		if (!DockerData.host) {
			return;
		}
		$http
		.get("http://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/containers/json?all=1")
		.success(function(data) {
			angular.forEach(data, function(v) {
				v.name = v.Names.join().substr(1);
				v.running = !!v.Status.match(/^Up /);
			});
			$scope.DockerData.containers = data;
		})
		.error(function(data, status) {
			console.error("Get container list failed", data, status);
		});
	};

	$scope.checkReload = function() {
		if (!$scope.DockerData.containers.length) {
			$scope.reload();
		}
	};
	$scope.checkReload();

	$scope.$watch("DockerData.IndexCtrl.tab", function(tab) {
		if (tab == "Containers") {
			$scope.checkReload();
		}
	});

	$scope.attach = function(container) {
		$scope.curtab = container;
		if (!container) {
			return;
		}
		for (var i=0 ; i<$scope.tabs.length ; i++) {
			var c = $scope.tabs[i];
			if (container.Id === c.Id) {
				return;
			}
		}
		$scope.tabs.unshift(container);

		if (!container.terminal) {
			container.terminal = new Terminal();
			$scope.setupWebsocket(container);
		}
	};

	$scope.start = function(container, param) {
		$http
		.post("http://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/containers/" + container.Id + "/start", param)
		.success(function(data) {
			$scope.reload();
		})
		.error(function(data, status) {
			$scope.reload();
			console.error("Start container failed", data, status);
		});
	};

	$scope.stop = function(container) {
		$http
		.post("http://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/containers/" + container.Id + "/stop")
		.success(function(data) {
			$scope.reload();
		})
		.error(function(data, status) {
			$scope.reload();
			console.error("Stop container failed", data, status);
		});
	};

	$scope.remove = function(container) {
		$http
		.delete("http://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/containers/" + container.Id + "?v=1")
		.success(function(data) {
			$scope.reload();
		})
		.error(function(data, status) {
			$scope.reload();
			console.error("Remove container failed", data, status);
		});
	};

	$scope.setupWebsocket = function(container) {
		if (!document.getElementById(container.Id + "_terminal")) {
			setTimeout(function() {
				$scope.setupWebsocket(container);
			}, 500);
			return;
		}

		container.terminal.open(document.getElementById(container.Id + "_terminal"));

		container.websocket = WebSocket
		.new("ws://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/containers/" + container.Id + "/attach/ws?logs=0&stderr=1&stdout=1&stream=1&stdin=1")
		.onopen(function(e) {
			container.terminal.write($translate("WebSocket connected: {{url}}", {url: e.target.URL}));
		})
		.onerror(function(e) {
			container.terminal.write($translate("WebSocket error: {{url}}", {url: e.target.URL}));
		})
		.onclose(function(e) {
			container.terminal.write($translate("WebSocket closed: {{url}}", {url: e.target.URL}));
			container.terminal.destroy();
			delete container.terminal;
			delete container.websocket;
			$scope.closeContainer(container);
			setTimeout(function() {
				$scope.reload();
			}, 500);
		})
		.onmessage(function(e) {
			container.terminal.write(e.data);
		});

		container.terminal.on("data", function(data) {
			container.websocket.send(data);
		});
	};

	$scope.openCreateContainerModal = function() {
		$modal.open({
			templateUrl: "index/CreateContainerModalContent.html",
			controller: "CreateContainerModalCtrl"
		})
		.result
			.then(function(data) {
				var query = "";
				if (data.param.Name) {
					query = "?name=" + data.param.Name;
				}
				$http
				.post("http://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/containers/create" + query, data.param)
				.success(function(retcontainer) {
					$scope.start(retcontainer, data.startconfig);
				})
				.error(function(data, status) {
					console.error("Create container failed", data, status);
				});
			});
	};

	$scope.openStartContainerModal = function(container) {
		$modal.open({
			templateUrl: "index/StartContainerModalContent.html",
			controller: "StartContainerModalCtrl",
			resolve: {
				container: function() {
					return container;
				}
			}
		})
		.result
			.then(function(data) {
				$scope.start(data.container, data.param);
			});
	};

	$scope.closeContainer = function(container) {
		for (var i=0 ; i<$scope.tabs.length ; i++) {
			if (container.Id === $scope.tabs[i].Id) {
				var c = $scope.tabs.splice(i, 1)[0];
				if (c.websocket) {
					c.websocket.close();
				}
				$scope.curtab = null;
				return;
			}
		}
	};

}])

.controller("ImageCtrl", ["$scope", "DockerData", "$http"
	, function($scope, DockerData, $http) {

	$scope.DockerData = DockerData;
	DockerData.ImageCtrl = $scope;

	$scope.reload = function() {
		if (!DockerData.host) {
			return;
		}
		$http
		.get("http://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/images/json?all=0")
		.success(function(data) {
			$scope.DockerData.images = data;
		})
		.error(function(data, status) {
			console.error("Get image list failed", data, status);
		});
	};

	$scope.checkReload = function() {
		if (!$scope.DockerData.images.length) {
			$scope.reload();
		}
	};
	$scope.checkReload();

	$scope.$watch("DockerData.IndexCtrl.tab", function(tab) {
		if (tab == "Images") {
			$scope.checkReload();
		}
	});

	$scope.remove = function(image) {
		$http
		.delete("http://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/images/" + image.Id)
		.success(function(data) {
			$scope.reload();
		})
		.error(function(data, status) {
			$scope.reload();
			console.error("Remove image failed", data, status);
		});
	};

}])

.controller("ConfigCtrl", ["$scope", "DockerData"
	, function($scope, DockerData) {

	$scope.DockerData = DockerData;
	DockerData.ConfigCtrl = $scope;

}])

;
