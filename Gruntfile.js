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
		},
		version: {
			dist: {
				src: ["index/index.min.js"]
			}
		},
		ngtemplates: {
			"KDockerWeb": {
				src: ["index/*.html"],
				dest: "index/index.ngtpl.tmp.js",
				options: {
					usemin: "index/index.min.js"
				}
			}
		}
	});

	require("load-grunt-tasks")(grunt);
	grunt.registerTask("build", ["copy", "ngtemplates", "useminPrepare", "concat", "cssmin", "uglify", "usemin", "version"]);
	grunt.registerTask("default", ["clean", "sync", "build"]);

};
