app

.filter("containerName", function() {
	return function(name) {
		return name.replace(/^\//, "");
	};
})

;
