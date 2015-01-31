var through = require('through');

module.exports = function (grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    env: {
      test: {
        NODE_ENV: 'test'
      },
      dev : {
        NODE_ENV: 'dev',
        PORT    : 4000
      },
      prod: {
        NODE_ENV: 'prod'
      }
    },

    bower: {
      install: {
        options: {
          targetDir: 'build/vendor',
          layout   : 'byComponent'
        }
      }
    },

    clean: {
      build : ['build'],
      vendor: {
        src: ['bower_components', 'build/vendor']
      },
      dev   : {
        js : {
          src: ['build/test.js', 'build/<%= pkg.name %>.js', 'public/js/<%= pkg.name %>.js']
        },
        css: {
          src: ['build/<%= pkg.name %>.css', 'public/css/<%= pkg.name %>.css']
        }
      },
      prod  : ['dist']
    },

    browserify: {
      dev : {
        files  : {
          'build/<%= pkg.name %>.js': ['client/src/main.js']
        },
        options: {
          browserifyOptions: {
            debug: true
          },
          transform        : ['hbsfy', function (file) {
            // tinymce uses it's own require and define functions that confuse browserify.
            var data = '';

            // By default do nothing.
            var write = function (buf) { data += buf; };
            var end = function end() {
              this.queue(data);
              this.queue(null);
            };

            if (file.indexOf('build/vendor/tinymce/js/tinymce.js') >= 0) {
              end = function () {
                data = data.replace(/require\(/g, 'tinymceRequire(').replace(/define\(/g, 'tinymceDefine(');
                this.queue(data);
                this.queue(null);
              };
            }

            return through(write, end);
          }]
        }
      },
      prod: {
        files  : {
          'build/<%= pkg.name %>.js': ['client/src/main.js']
        },
        options: {
          transform: ['hbsfy', function (file) {
            // tinymce uses it's own require and define functions that confuse browserify.
            var data = '';

            // By default do nothing.
            var write = function (buf) { data += buf; };
            var end = function end() {
              this.queue(data);
              this.queue(null);
            };

            if (file.indexOf('build/vendor/tinymce/js/tinymce.js') >= 0) {
              end = function () {
                data = data.replace(/require\(/g, 'tinymceRequire(').replace(/define\(/g, 'tinymceDefine(');
                this.queue(data);
                this.queue(null);
              };
            }

            return through(write, end);
          }]
        }
      },
      test: {
        files  : {
          'build/tests.js': ['client/test/**/*.test.js']
        },
        options: {
          external: ['backbone.marionette', 'backbone.wreqr', 'backbone.babysitter', 'backbone', 'underscore', 'jquery']
        }
      }
    },

    less: {
      transpile: {
        files: {
          'build/<%= pkg.name %>.css': [
            // 'client/styles/reset.css',
            'build/vendor/bootstrap/less/bootstrap.less',
            'build/vendor/bootstrap-dialog/less/bootstrap-dialog.less',
            'client/vendor/bootstrap-datetimepicker/less/bootstrap-datetimepicker.less',
            'client/vendor/typeahead/less/typeahead.less',
            'build/vendor/bootstrap-table/*.css',
            'build/vendor/bootstrap-table-filter/css/*.css',
            'build/vendor/bootstrap-material-design/ripples.css',
            'build/vendor/bootstrap-material-design/material.css',
            'client/styles/less/main.less'
          ]
        }
      }
    },

    copy       : {
      bootstrap: {
        files: [{
                  expand : true,
                  flatten: true,
                  src    : 'build/vendor/bootstrap/fonts/*',
                  dest   : 'public/fonts/'
                }]
      },
      tinymce  : {
        files: [{
                  expand : true,
                  flatten: true,
                  src    : 'build/vendor/tinymce/css/*',
                  dest   : 'public/js/skins/lightgray/'
                },
                {
                  expand : true,
                  flatten: true,
                  src    : 'build/vendor/tinymce/fonts/*',
                  dest   : 'public/js/skins/lightgray/fonts/'
                },
                {
                  expand : true,
                  flatten: true,
                  src    : 'build/vendor/tinymce/img/*',
                  dest   : 'public/js/skins/lightgray/img/'
                }]
      },
      dev      : {
        files: [{
                  src : 'build/<%= pkg.name %>.js',
                  dest: 'public/js/<%= pkg.name %>.js'
                }, {
                  src : 'build/<%= pkg.name %>.css',
                  dest: 'public/css/<%= pkg.name %>.css'
                }, {
                  src : 'client/img/**/*',
                  dest: 'public/img/**/*'
                }]
      },
      prod     : {
        files: [{
                  src : 'dist/js/<%= pkg.name %>.js',
                  dest: 'public/js/<%= pkg.name %>.js'
                }, {
                  src : 'dist/css/<%= pkg.name %>.css',
                  dest: 'public/css/<%= pkg.name %>.css'
                }, {
                  src : ['client/img/**/*'],
                  dest: 'dist/img/'
                }]
      }
    },

    // CSS minification.
    cssmin     : {
      minify: {
        src : ['build/<%= pkg.name %>.css'],
        dest: 'dist/css/<%= pkg.name %>.css'
      }
    },

    // Javascript minification.
    uglify     : {
      compile: {
        options: {
          compress: true,
          verbose : true
        },
        files  : [{
                    src : 'build/<%= pkg.name %>.js',
                    dest: 'dist/js/<%= pkg.name %>.js'
                  }]
      }
    },

    // for changes to the front-end code
    watch      : {
      devScripts : {
        files: ['client/src/**/*.hbs', 'client/src/**/*.js'],
        tasks: ['clean:dev:js', 'browserify:dev', 'copy:dev']
      },
      devLess    : {
        files: ['client/styles/**/*.less'],
        tasks: ['clean:dev:css', 'less:transpile', 'copy:dev']
      },
      prodScripts: {
        files: ['client/src/**/*.hbs', 'client/src/**/*.js'],
        tasks: ['clean:prod:js', 'browserify:prod', 'uglify', 'copy:prod']
      },
      prodLess   : {
        files: ['client/styles/**/*.less'],
        tasks: ['clean:prod:css', 'less:transpile', 'cssmin', 'copy:prod']
      },
      test       : {
        files: ['build/client.js', 'client/test/**/*.test.js'],
        tasks: ['browserify:test']
      },
      karma      : {
        files: ['build/tests.js'],
        tasks: ['jshint:test', 'karma:watcher:run']
      }
    },

    // for changes to the node code
    nodemon    : {
      dev : {
        script : 'server/server.js',
        options: {
          nodeArgs: ['--debug'],
          ignore  : ['bower_components/**', 'build/**', 'client/**', 'node_modules/**', 'public/**'],
          watch   : ['server/src', 'server/config'],
          env     : {
            PORT    : '3000',
            NODE_ENV: 'dev'
          },
          ext     : 'js,hbs'
        }
      },
      prod: {
        script : 'server/server.js',
        options: {
          ignore: ['bower_components/**', 'build/**', 'client/**', 'node_modules/**', 'public/**'],
          watch : ['server/src', 'server/config'],
          env   : {
            PORT    : '3000',
            NODE_ENV: 'prod'
          },
          ext   : 'js,hbs'
        }
      }
    },

    // server tests
    simplemocha: {
      options: {
        globals    : ['expect', 'sinon'],
        timeout    : 3000,
        ignoreLeaks: false,
        ui         : 'bdd',
        reporter   : 'spec'
      },

      server: {
        src: ['server/test/spechelper.js', 'server/test/**/*.test.js']
      }
    },

    // mongod server launcher
    shell      : {
      mongo: {
        command: 'mongod',
        options: {
          async: true
        }
      }
    },

    concurrent: {
      dev : {
        tasks  : ['nodemon:dev', 'shell:mongo', 'watch:devScripts', 'watch:devLess', 'watch:test'],
        options: {
          logConcurrentOutput: true,
          limit              : 5
        }
      },
      test: {
        tasks  : ['watch:karma'],
        options: {
          logConcurrentOutput: true
        }
      },
      prod: {
        tasks  : ['nodemon:prod', 'shell:mongo', 'watch:prodScripts', 'watch:prodLess'],
        options: {
          logConcurrentOutput: true,
          limit              : 5
        }
      }
    },

    // for front-end tdd
    karma     : {
      options: {
        configFile: 'karma.conf.js'
      },
      watcher: {
        background: true,
        singleRun : false
      },
      test   : {
        singleRun: true
      }
    },

    // Check JavaScript correctness
    jshint    : {
      options   : {
        plusplus: false
      },
      build     : ['Gruntfile.js'],
      server    : {
        options: {
          node: true
        },
        files  : {src: ['server/src/**/*.js', 'server/test/**/*.js']}
      },
      clientDev : {
        options: {
          globals   : {'grecaptcha': false},
          browser   : true,
          browserify: true,
          devel     : true
        },
        files  : {src: ['client/src/**/*.js', 'client/test/**/*.js']}
      },
      clientProd: {
        options: {
          globals   : {'grecaptcha': false},
          browser   : true,
          browserify: true
        },
        files  : {src: ['client/src/**/*.js', 'client/test/**/*.js']}
      }
    }
  });

  grunt.registerTask('build:vendor', ['clean:vendor', 'bower']);
  grunt.registerTask('build:dev', ['clean:dev',
                                   'browserify:dev',
                                   'browserify:test',
                                   'jshint:clientDev',
                                   'jshint:server',
                                   'less:transpile',
                                   'copy:bootstrap',
                                   'copy:tinymce',
                                   'copy:dev']);
  grunt.registerTask('build:prod', ['clean:prod',
                                    'browserify:prod',
                                    'jshint:clientProd',
                                    'jshint:server',
                                    'less:transpile',
                                    'cssmin',
                                    'uglify',
                                    'copy:bootstrap',
                                    'copy:tinymce',
                                    'copy:prod']);

  grunt.registerTask('init:dev', ['clean', 'jshint:build', 'build:vendor']);

  grunt.registerTask('heroku', ['env:dev', 'init:dev', 'build:dev']);

  grunt.registerTask('server:dev', ['env:dev', 'build:dev', 'concurrent:dev']);
  grunt.registerTask('server:prod', ['env:prod', 'build:prod', 'concurrent:prod']);
  grunt.registerTask('test:server', ['env:test', 'jshint:server', 'simplemocha:server']);

  grunt.registerTask('test:client', ['env:test', 'jshint:client', 'karma:test']);
  grunt.registerTask('tdd', ['env:test', 'karma:watcher:start', 'concurrent:test']);

  grunt.registerTask('test', ['test:server', 'test:client']);
};
