module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		meta: {
			bowerrc: grunt.file.readJSON(".bowerrc"),
			banner: [
				"/* <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today('yyyy-mm-dd') %>",
				" * <%= pkg.homepage %>",
				" * License: <%= pkg.license %>",
				" */\n"
			].join("\n"),
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
		sync: {
			options: {
				include: ["name", "version", "description", "authors", "license", "homepage", "main"]
			}
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
		cssmin: {
			options: {
				banner: "<%= meta.banner %>"
			}
		},
		uglify: {
			options: {
				banner: "<%= meta.banner %>"
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
		},
		connect: {
			server: {
				options: {
					port: 9000,
					debug : true,
					livereload : true
				}
			}
		},
		watch: {
			livereload: {
				options: {
					livereload: true
				},
				files: [
					"*.json",
					"**/*.html",
					"**/*.js",
					"**/*.css"
				]
			}
		}
	});

	require("load-grunt-tasks")(grunt);
	grunt.registerTask("build", ["copy", "ngtemplates", "useminPrepare", "concat", "cssmin", "uglify", "usemin", "version"]);
	grunt.registerTask("default", ["clean", "sync", "build"]);
	grunt.registerTask("dev", ["build", "connect", "watch"]);

};
