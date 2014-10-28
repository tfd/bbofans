module.exports = function(grunt) {

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        bower: {
            install: {
                options: {
                    targetDir: 'client/requires',
                    layout: 'byType'
                }
            }
        },

        clean: {
            build: ['build'],
            dev: {
                src: ['build/app.js', 'build/<%= pkg.name %>.css', 'build/<%= pkg.name %>.js']
            },
            prod: ['dist']
        },

        browserify: {
            vendor: {
                src: ['client/requires/**/*.js'],
                dest: 'build/vendor.js',
                options: {
                    shim: {
                        jquery: {
                            path: 'client/requires/js/jquery/jquery.js',
                            exports: '$'
                        },
                        underscore: {
                            path: 'client/requires/js/underscore/underscore.js',
                            exports: '_'
                        },
                        backbone: {
                            path: 'client/requires/js/backbone/backbone.js',
                            exports: 'Backbone',
                            depends: {
                                underscore: 'underscore'
                            }
                        },
                        'backbone.babysitter': {
                            path: 'client/requires/js/backbone.babysitter/backbone.babysitter.js',
                            exports: 'Babysitter',
                            depends: {
                                jquery: '$',
                                backbone: 'Backbone',
                                underscore: '_'
                            }
                        },
                        'backbone.wreqr': {
                            path: 'client/requires/js/backbone.wreqr/backbone.wreqr.js',
                            exports: 'Wreqr',
                            depends: {
                                jquery: '$',
                                backbone: 'Backbone',
                                underscore: '_'
                            }
                        },
                        'backbone.marionette': {
                            path: 'client/requires/js/backbone.marionette/backbone.marionette.js',
                            exports: 'Marionette',
                            depends: {
                                jquery: '$',
                                backbone: 'Backbone',
                                underscore: '_',
                                wreqr: 'Wreqr',
                                babysitter: 'Babysitter'
                            }
                        }
                    }
                }
            },
            app: {
                files: {
                    'build/app.js': ['client/src/main.js']
                },
                options: {
                    transform: ['hbsfy'],
                    external: ['backbone.marionette']
                }
            },
            test: {
                files: {
                    'build/tests.js': [
                        'client/test/**/*.test.js'
                    ]
                },
                options: {
                    transform: ['hbsfy'],
                    external: ['backbone.marionette']
                }
            }
        },

        less: {
            transpile: {
                files: {
                    'build/<%= pkg.name %>.css': [
                        'client/styles/reset.css',
                        'client/requires/css/**/*',
                        'client/styles/less/main.less'
                    ]
                }
            }
        },

        concat: {
            'build/<%= pkg.name %>.js': ['build/vendor.js', 'build/app.js']
        },

        copy: {
            dev: {
                files: [{
                    src: 'build/<%= pkg.name %>.js',
                    dest: 'public/js/<%= pkg.name %>.js'
                }, {
                    src: 'build/<%= pkg.name %>.css',
                    dest: 'public/css/<%= pkg.name %>.css'
                }, {
                    src: 'client/img/**/*',
                    dest: 'public/img/**/*'
                }]
            },
            prod: {
                files: [{
                    src: ['client/img/**/*'],
                    dest: 'dist/img/'
                }]
            }
        },

        // CSS minification.
        cssmin: {
            minify: {
                src: ['build/<%= pkg.name %>.css'],
                dest: 'dist/css/<%= pkg.name %>.css'
            }
        },

        // Javascript minification.
        uglify: {
            compile: {
                options: {
                    compress: true,
                    verbose: true
                },
                files: [{
                    src: 'build/<%= pkg.name %>.js',
                    dest: 'dist/js/<%= pkg.name %>.js'
                }]
            }
        },

        // for changes to the front-end code
        watch: {
            scripts: {
                files: ['client/templates/*.hogan', 'client/src/**/*.js'],
                tasks: ['clean:dev', 'browserify:app', 'concat', 'copy:dev']
            },
            less: {
                files: ['client/styles/**/*.less'],
                tasks: ['less:transpile', 'copy:dev']
            },
            test: {
                files: ['build/app.js', 'client/test/**/*.test.js'],
                tasks: ['browserify:test']
            },
            karma: {
                files: ['build/tests.js'],
                tasks: ['jshint:test', 'karma:watcher:run']
            }
        },

        // for changes to the node code
        nodemon: {
            dev: {
                options: {
                    file: 'server.js',
                    nodeArgs: ['--debug'],
                    watchedFolders: ['server/src', 'server/src/controllers'],
                    env: {
                        PORT: '3300'
                    }
                }
            }
        },

        // server tests
        simplemocha: {
            options: {
                globals: ['expect', 'sinon'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },

            server: {
                src: ['server/test/spechelper.js', 'server/test/**/*.test.js']
            }
        },

        // mongod server launcher
        shell: {
            mongo: {
                command: 'mongod',
                options: {
                    async: true
                }
            }
        },

        concurrent: {
            dev: {
                tasks: ['nodemon:dev', 'shell:mongo', 'watch:scripts', 'watch:less', 'watch:test'],
                options: {
                    logConcurrentOutput: true
                }
            },
            test: {
                tasks: ['watch:karma'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        // for front-end tdd
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            watcher: {
                background: true,
                singleRun: false
            },
            test: {
                singleRun: true
            }
        },

        // Check JavaScript correctness
        jshint: {
            all: ['Gruntfile.js', 'server/src/**/*.js', 'client/src/**/*.js', 'server/test/**/*.js', 'client/test/**/*.js'],
            server: ['server/src/**/*.js', 'server/test/**/*.js'],
            client: ['client/src/**/*.js', 'client/test/**/*.js'],
            dev: ['server/src/**/*.js', 'client/src/**/*.js'],
        }
    });

    grunt.registerTask('init:dev', ['clean', 'bower', 'browserify:vendor']);

    grunt.registerTask('build:dev', ['clean:dev', 'browserify:app', 'browserify:test', 'jshint:dev', 'less:transpile', 'concat', 'copy:dev']);
    grunt.registerTask('build:prod', ['clean:prod', 'browserify:vendor', 'browserify:app', 'jshint:all', 'less:transpile', 'concat', 'cssmin', 'uglify', 'copy:prod']);

    grunt.registerTask('heroku', ['init:dev', 'build:dev']);

    grunt.registerTask('server', ['build:dev', 'concurrent:dev']);
    grunt.registerTask('test:server', ['jshint:server', 'simplemocha:server']);

    grunt.registerTask('test:client', ['jshint:client', 'karma:test']);
    grunt.registerTask('tdd', ['karma:watcher:start', 'concurrent:test']);

    grunt.registerTask('test', ['test:server', 'test:client']);
};
