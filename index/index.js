app

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

	$scope.devMode = false;

	if (DockerData.host) {
		$scope.tab = "Containers";
	} else {
		$scope.tab = "Config";
	}

	$scope.locale = $translate.use();
	$scope.updateLocale = function() {
		$translate.use($scope.locale);
	};

	$scope.alerts = [];
	$scope.log = function() {
		var exists = false;
		var alertmsg = Array.prototype.join.call(arguments, " ");
		for (var i=0 ; i<$scope.alerts.length ; i++) {
			var a = $scope.alerts[i];
			if (a.type == "info" && a.msg == alertmsg) {
				return;
			}
		}
		$scope.alerts.push({
			type: "info",
			msg: alertmsg
		});
	};
	$scope.error = function() {
		var exists = false;
		var alertmsg = Array.prototype.join.call(arguments, " ");
		for (var i=0 ; i<$scope.alerts.length ; i++) {
			var a = $scope.alerts[i];
			if (a.type == "danger" && a.msg == alertmsg) {
				return;
			}
		}
		$scope.alerts.push({
			type: "danger",
			msg: alertmsg
		});
	};

	if (DockerData.version == "0") {
		$scope.devMode = true;
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
	$scope.loading = false;

	$scope.reload = function() {
		if (!DockerData.host || $scope.loading) {
			return;
		}
		$scope.loading = true;
		$http
		.get(DockerData.apiurl + "/containers/json?all=1", {
			errmsg: "Get container list failed"
		})
		.success(function(data) {
			angular.forEach(data, function(v) {
				v.name = v.Names.join().substr(1);
				v.running = !!v.Status.match(/^Up /);
			});
			$scope.DockerData.containers = data;
			$scope.loading = false;
		})
		.error(function() {
			$scope.loading = false;
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
		.post(DockerData.apiurl + "/containers/" + container.Id + "/start", param, {
			errmsg: "Start container failed"
		})
		.success(function() {
			$scope.reload();
		})
		.error(function() {
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
		})
		.error(function() {
			$scope.reload();
		});
	};

	$scope.remove = function(container) {
		$http
		.delete(DockerData.apiurl + "/containers/" + container.Id + "?v=1", {
			errmsg: "Remove container failed"
		})
		.success(function() {
			$scope.reload();
		})
		.error(function() {
			$scope.reload();
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
		.new(DockerData.apiurl.replace(/^http/, "ws") + "/containers/" + container.Id + "/attach/ws?logs=0&stderr=1&stdout=1&stream=1&stdin=1")
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

}])

.controller("ImageCtrl", ["$scope", "DockerData", "$http"
	, function($scope, DockerData, $http) {

	$scope.DockerData = DockerData;
	DockerData.ImageCtrl = $scope;

	$scope.loading = false;

	$scope.reload = function() {
		if (!DockerData.host || $scope.loading) {
			return;
		}
		$scope.loading = true;
		$http
		.get(DockerData.apiurl + "/images/json?all=0", {
			errmsg: "Get image list failed"
		})
		.success(function(data) {
			$scope.DockerData.images = data;
			$scope.loading = false;
		})
		.error(function() {
			$scope.loading = false;
		});
	};

	$scope.checkReload = function() {
		if (!$scope.DockerData.images.length) {
			$scope.reload();
		}
	};
	$scope.checkReload();

	$scope.$watch("DockerData.IndexCtrl.tab", function(tab) {
		if (tab in {"Images":1, "Container":1}) {
			$scope.checkReload();
		}
	});

	$scope.remove = function(image) {
		$http
		.delete(DockerData.apiurl + "/images/" + image.Id, {
			errmsg: "Remove image failed"
		})
		.success(function(data) {
			$scope.reload();
		})
		.error(function(data, status) {
			$scope.reload();
		});
	};

}])

.controller("ConfigCtrl", ["$scope", "DockerData"
	, function($scope, DockerData) {

	$scope.DockerData = DockerData;
	DockerData.ConfigCtrl = $scope;

}])

;
