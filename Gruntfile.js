'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

var port = 80;

module.exports = function (grunt) {
	// show elapsed time at the end
	require('time-grunt')(grunt);
	// load all grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		// The Coffeescript compiler
		coffee: {
			compile: {
				options: {
					bare: true,
					sourceMap: true,
					join: false
				},
				files: [{
					src: 'src/**/*.coffee',
					dest: 'build/build.js'
				}]
			}
		},
		concurrent: {
			target: {
				tasks: ['connect', 'watch:source'],
				options: {
					logConcurrentOutput: true
				}
			}
		},
		connect: {
			options: {
				port: port,
				hostname: '*',
				middleware: function (connect) {
					return [
						mountFolder(connect, './')
					];
				}
			},
		},
		watch: {
			source: {
				files: 'src/**/*.coffee',
				options: {
					nospawn: true
				}
			}
		},
	});

	// runs when a watched file is changed
	grunt.event.on('watch', function(action, filepath, target) {

		grunt.log.subhead(target + ': ' + filepath + ' has ' + action);

		// turn on --force
		grunt.task.run('usetheforce_on');

		grunt.config.set('coffee', {
			adhoc: {
				options: {
					bare: true,
					join: true,
					sourceMap: true
				},
				files: [{
					src: 'src/**/*.coffee',
					dest: 'build/build.js'
				}]
			}
		});

		grunt.task.run('coffee:adhoc');

		grunt.task.run('hasfailed', 'usetheforce_restore');
	});

	grunt.registerTask('usetheforce_on',
		'force the force option on if needed',
		function() {
			if ( !grunt.option( 'force' ) ) {
			grunt.config.set('usetheforce_set', true);
			grunt.option( 'force', true );
		}
	});
	grunt.registerTask('usetheforce_restore',
		'turn force option off if we have previously set it',
		function() {
		if ( grunt.config.get('usetheforce_set') ) {
			grunt.option( 'force', false );
		}
	});

	// Checks if there are any errors when running tasks in the watcher
	grunt.registerTask('hasfailed', function() {
		if (grunt.fail.errorcount > 0) {
			grunt.warn('Encountered ' + grunt.fail.errorcount + ' errors while running watcher');
			grunt.log.write('\x07'); // beep!
			grunt.fail.errorcount = 0; //overwrite
		}
	});

	grunt.registerTask('default', 'Runs grunt webserver with default settings.', ['coffee', 'concurrent']);
};