app

.controller("ContainerCtrl"
	, [       "$scope", "$filter", "$http", "DockerData", "$modal", "$rootScope"
	, function($scope,   $filter,   $http,   DockerData,   $modal,   $rootScope) {

	$scope.DockerData = DockerData;
	DockerData.ContainerCtrl = $scope;

	$scope.tabs = [];
	$scope.curtab = null;

	$scope.reload = function(evt) {
		if (!DockerData.host || $scope.loadingCtrl.container) {
			return;
		}
		$scope.loadingCtrl.container = true;
		if (evt && evt.shiftKey) {
			$rootScope.$emit("reload-image");
		}
		$http
		.get(DockerData.apiurl + "/containers/json?all=1", {
			errmsg: "Get container list failed"
		})
		.success(function(data) {
			angular.forEach(data, function(v) {
				v.name = v.Names.join().substr(1);
				v.running = !!v.Status.match(/^Up /);
				v.paused = !!v.Status.match(/Paused/);
			});
			$scope.DockerData.containers = data;
			$scope.loadingCtrl.container = false;
		})
		.error(function() {
			$scope.loadingCtrl.container = false;
		});
	};

	$scope.checkReload = function() {
		if (!$scope.DockerData.containers.length) {
			$scope.reload();
		}
	};

	$scope.attach = function(evt, container) {
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
			$scope.setupWebsocket(evt, container);
		}
	};

	$scope.start = function(container, param) {
		$http
		.post(DockerData.apiurl + "/containers/" + container.Id + "/start", param, {
			errmsg: "Start container failed"
		})
		.success(function() {
			$scope.reload();
		});
	};

	$scope.stop = function(container) {
		$http
		.post(DockerData.apiurl + "/containers/" + container.Id + "/stop", {}, {
			errmsg: "Stop container failed"
		})
		.success(function() {
			$scope.reload();
		});
	};

	$scope.remove = function(container) {
		$http
		.delete(DockerData.apiurl + "/containers/" + container.Id + "?v=1&force=1", {
			errmsg: "Remove container failed"
		})
		.success(function() {
			$scope.reload();
		});
	};

	$scope.pause = function(container) {
		$http
		.post(DockerData.apiurl + "/containers/" + container.Id + "/pause", {}, {
			errmsg: "Pause container failed"
		})
		.success(function() {
			$scope.reload();
		});
	};

	$scope.unpause = function(container) {
		$http
		.post(DockerData.apiurl + "/containers/" + container.Id + "/unpause", {}, {
			errmsg: "Unpause container failed"
		})
		.success(function() {
			$scope.reload();
		});
	};

	$scope.setupWebsocket = function(evt, container) {
		if (!document.getElementById(container.Id + "_terminal")) {
			setTimeout(function() {
				$scope.setupWebsocket(evt, container);
			}, 500);
			return;
		}

		container.terminal.open(document.getElementById(container.Id + "_terminal"));

		evt.shiftKey
		container.websocket = new WebSocket(
			DockerData.apiurl.replace(/^http/, "ws")
				+ "/containers/"
				+ container.Id
				+ "/attach/ws?stderr=1&stdout=1&stream=1&stdin=1"
				+ (evt.shiftKey ? "&logs=1" : "&logs=0"));
		container.websocket.onopen = function(e) {
			container.terminal.write($filter("translate")("WebSocket connected: {{url}}", {url: e.target.URL}));
		};
		container.websocket.onerror = function(e) {
			container.terminal.write($filter("translate")("WebSocket error: {{url}}", {url: e.target.URL}));
		};
		container.websocket.onclose = function(e) {
			container.terminal.write($filter("translate")("WebSocket closed: {{url}}", {url: e.target.URL}));
			container.terminal.destroy();
			delete container.terminal;
			delete container.websocket;
			$scope.closeContainer(container);
		};
		container.websocket.onmessage = function(e) {
			container.terminal.write(e.data);
		};

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
				.post(DockerData.apiurl + "/containers/create" + query, data.param, {
					errmsg: "Create container failed"
				})
				.success(function(retcontainer) {
					$scope.start(retcontainer, data.startconfig);
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

	$rootScope.$on("reload-container", function() {
		$scope.reload();
	});

	$scope.$watch("DockerData.IndexCtrl.tab", function(tab) {
		if (tab == "Containers") {
			$scope.checkReload();
		}
	});

	// reload when open page
	$scope.reload();

}])

;
