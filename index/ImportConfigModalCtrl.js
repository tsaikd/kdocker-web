app

.controller("ImportConfigModalCtrl"
	, [       "$scope", "$modalInstance", "$filter", "DockerData"
	, function($scope,   $modalInstance,   $filter,   DockerData) {

	$scope.DockerData = DockerData;
	$scope.data = {
		configJson: "",
		errMsg: ""
	};

	$scope.importConfig = function() {
		if (!$scope.data.configJson) {
			$scope.data.errMsg = $filter("translate")("Empty input data");
			return;
		}
		try {
			$scope.data.errMsg = "";
			var config = JSON.parse($scope.data.configJson);
			$modalInstance.close({
				config: config
			});
		} catch(e) {
			$scope.data.errMsg = ("" + e.message) || $filter("translate")("Parse JSON ERROR");
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss("cancel");
	};

}])

;
