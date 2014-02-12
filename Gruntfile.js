module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON("bower.json"),
		meta: {
			dist: "."
		},
		clean: {
			dist: [".tmp", "index/*.min.*", "index.html"]
		},
		copy: {
			index: {
				src: "index.src.html",
				dest: "index.html"
			}
		},
		useminPrepare: {
			index: {
				src: "index.html"
			},
			options: {
				dest: "."
			}
		},
		usemin: {
			html: ["index.html"]
		}
	});

	require("load-grunt-tasks")(grunt);
	grunt.registerTask("build", ["copy", "useminPrepare", "concat", "cssmin", "uglify", "usemin"]);
	grunt.registerTask("default", ["clean", "sync", "build"]);

};
