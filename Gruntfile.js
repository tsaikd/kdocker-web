module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON("bower.json"),
		meta: {
			bowerrc: grunt.file.readJSON(".bowerrc"),
			lib: "<%= meta.bowerrc.directory %>",
			dist: "."
		},
		clean: {
			dist: [
				".tmp",
				"<%= meta.dist %>/index/*.min.*",
				"<%= meta.dist %>/index/*.tmp.*",
				"<%= meta.dist %>/index.html"
			]
		},
		copy: {
			index: {
				src: "<%= meta.dist %>/index.src.html",
				dest: "<%= meta.dist %>/index.html"
			}
		},
		useminPrepare: {
			index: {
				src: "<%= meta.dist %>/index.html"
			},
			options: {
				dest: "<%= meta.dist %>"
			}
		},
		usemin: {
			html: ["<%= meta.dist %>/index.html"]
		},
		version: {
			dist: {
				src: ["<%= meta.dist %>/index/index.min.js"]
			}
		},
		ngtemplates: {
			"index": {
				src: ["<%= meta.dist %>/index/*.html"],
				dest: "<%= meta.dist %>/index/index.ngtpl.tmp.js",
				options: {
					usemin: "<%= meta.dist %>/index/index.min.js",
					bootstrap: function(module, script) {
						return "app.run(['$templateCache', function($templateCache) {" + script + "}]);";
					}
				}
			}
		}
	});

	require("load-grunt-tasks")(grunt);
	grunt.registerTask("build", ["copy", "ngtemplates", "useminPrepare", "concat", "cssmin", "uglify", "usemin", "version"]);
	grunt.registerTask("default", ["clean", "sync", "build"]);

};
