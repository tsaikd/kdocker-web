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

.run([        "$rootScope"
	, function($rootScope) {

	$rootScope.loadingCtrl = {};

}])

.controller("IndexCtrl"
	, [       "$scope", "DockerData", "$http", "$translate", "LocationHash", "$filter"
	, function($scope,   DockerData,   $http,   $translate,   LocationHash,   $filter) {

	$scope.DockerData = DockerData;
	DockerData.IndexCtrl = $scope;

	$scope.devMode = false;

	$scope.locale = angular.lowercase($translate.use());
	$scope.updateLocale = function() {
		$translate.use($scope.locale);
	};
	$scope.updateLocale();

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

	$scope.connectEvents = function() {
		if (!XMLHttpRequest || !DockerData.dockerHost.apiurl) {
			return;
		}
		$scope.closeConnectEvents();
		$scope.xhr = new XMLHttpRequest();
		$scope.xhr.readlen = 0;
		$scope.xhr.open("GET", DockerData.dockerHost.apiurl + "/events?since=" + (Math.floor(new Date().getTime() / 1000) - 30));
		$scope.xhr.onprogress = function() {
			var textarea = $scope.xhr.responseText.substr($scope.xhr.readlen);
			$scope.xhr.readlen += textarea.length;
			if (textarea) {
				var texts = textarea.match(/{.*?}/g);
				if (texts && texts.length) {
					var reloadContainer = false;
					var reloadImage = false;
					angular.forEach(texts, function(jsontext) {
						try {
							if (!reloadContainer || !reloadImage) {
								var json = JSON.parse(jsontext);
								reloadContainer = !!(json.status in {create:1, start:1, stop:1, kill:1, die:1, destroy:1});
								reloadImage = !!(json.status in {delete:1});
							}
						} catch(e) {}
					});
					if (reloadContainer && DockerData.ContainerCtrl) {
						DockerData.ContainerCtrl.reload();
					}
					if (reloadImage && DockerData.ImageCtrl) {
						DockerData.ImageCtrl.reload();
					}
				}
			}
		};
		$scope.xhr.onerror = function() {
			$scope.error($filter("translate")("Disconnect to docker web service."), $filter("translate")("Please check network and refresh page."));
			$scope.$digest();
		};
		$scope.xhr.send(null);
	};

	$scope.closeConnectEvents = function() {
		if ($scope.xhr) {
			$scope.xhr.abort();
			delete $scope.xhr;
		}
	};

	$scope.checkConnectEvents = function() {
		if (!XMLHttpRequest) {
			return;
		}
		if (!$scope.xhr) {
			$scope.connectEvents();
		}
	};

	$scope.$watch("DockerData.dockerHost.apiurl", function(val) {
		$scope.closeConnectEvents();
		$scope.checkConnectEvents();
	}, true);

	$scope.$watch("tab", function(val) {
		LocationHash.tab = val;
	}, true);

	if (DockerData.dockerHost.valid) {
		$scope.tab = LocationHash.tab || "Containers";
	} else {
		$scope.tab = "Config";
	}

	if (DockerData.version == "0") {
		$scope.devMode = true;
		$http
		.get("package.json?" + new Date().getTime())
		.success(function(data) {
			DockerData.version = data.version + "-dev";
		});
	}

}])

;
