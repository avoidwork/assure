module.exports = function (grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		concat : {
			options : {
				banner : "/**\n" +
				         " * <%= pkg.name %>\n" +
				         " *\n" +
				         " * @copyright <%= grunt.template.today('yyyy') %> <%= pkg.author %>\n" +
				         " * @license <%= pkg.license %>\n" +
				         " * @link <%= pkg.homepage %>\n" +
				         " * @version <%= pkg.version %>\n" +
				         " */\n"
			},
			dist : {
				src : [
					"src/intro.js",
					"src/utility.js",
					"src/promise.js",
					"src/deferred.js",
					"src/factories.js",
					"src/outro.js"
				],
				dest : "lib/<%= pkg.name %>.es6.js"
			}
		},
		babel: {
			options: {
				sourceMap: false,
				presets: ["babel-preset-es2015"]
			},
			dist: {
				files: {
					"lib/<%= pkg.name %>.js": "lib/<%= pkg.name %>.es6.js"
				}
			}
		},
		eslint: {
			target: ["lib/<%= pkg.name %>.es6.js"]
		},
		uglify: {
			options: {
				banner: '/* <%= grunt.template.today("yyyy") %> <%= pkg.author %> */\n',
				sourceMap: true,
				sourceMapIncludeSources: true,
				mangle: {
					except: [
						"Deferred",
						"Promise"
					]
				}
			},
			target: {
				files: {
					"lib/<%= pkg.name %>.min.js" : ["lib/<%= pkg.name %>.js"]
				}
			}
		},
		watch : {
			js : {
				files : "<%= concat.dist.src %>",
				tasks : "default"
			},
			pkg: {
				files : "package.json",
				tasks : "default"
			}
		}
	});

	// tasks
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-babel");
	grunt.loadNpmTasks("grunt-eslint");

	// aliases
	grunt.registerTask("test", ["eslint"]);
	grunt.registerTask("build", ["concat", "babel"]);
	grunt.registerTask("default", ["build", "test", "uglify"]);
};
