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
        NODE_ENV: 'dev'
      },
      prod: {
        NODE_ENV: 'prod'
      }
    },

    bower: {
      install: {
        options: {
          targetDir: 'build/vendor',
          layout   : function (type, component, source) {
            return component;
          }
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
          transform        : ['hbsfy']
          /*
           function (file) {
           // This is needed to make backbone work: when detecting node.js
           // it assumes (wrongly) that jQuery isn't needed. So we inject
           // jQuery into the factory.
           var data = '';
           var match_require = "var _ = require('underscore')";
           var replace_require = match_require + ", $ = require('jquery')";
           var match_factory = "factory(root, exports, _);";
           var replace_factory = "factory(root, exports, _, $);";
           return through(write, end);

           function write (buf) { data += buf }
           function end () {
           this.queue(data.replace(match_require, replace_require)
           .replace(match_factory, replace_factory));
           this.queue(null);
           }
           }]
           */
        }
      },
      prod: {
        files  : {
          'build/<%= pkg.name %>.js': ['client/src/main.js']
        },
        options: {
          transform: ['hbsfy']
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
            'build/vendor/bootstrap/bootstrap.less',
            'build/vendor/bootstrap/theme.less',
            'build/vendor/bootstrap-dialog/bootstrap-dialog.less',
            'client/vendor/bootstrap-datetimepicker/less/bootstrap-datetimepicker.less',
            'client/vendor/typeahead/less/typeahead.less',
            'build/vendor/bootstrap-table/*.css',
            'build/vendor/bootstrap-table-filter/*.css',
            'client/styles/less/main.less'
          ]
        }
      }
    },

    copy       : {
      dev : {
        files: [{
                  src : 'build/<%= pkg.name %>.js*',
                  dest: 'public/js/<%= pkg.name %>.js'
                }, {
                  src : 'build/<%= pkg.name %>.css',
                  dest: 'public/css/<%= pkg.name %>.css'
                }, {
                  src : 'client/img/**/*',
                  dest: 'public/img/**/*'
                }]
      },
      prod: {
        files: [{
                  src : 'dist/<%= pkg.name %>.js',
                  dest: 'public/js/<%= pkg.name %>.js'
                }, {
                  src : 'dist/<%= pkg.name %>.css',
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
      scripts: {
        files: ['client/src/**/*.hbs', 'client/src/**/*.js'],
        tasks: ['clean:dev:js', 'browserify:dev', 'copy:dev']
      },
      less   : {
        files: ['client/styles/**/*.less'],
        tasks: ['clean:dev:css', 'less:transpile', 'copy:dev']
      },
      test   : {
        files: ['build/client.js', 'client/test/**/*.test.js'],
        tasks: ['browserify:test']
      },
      karma  : {
        files: ['build/tests.js'],
        tasks: ['jshint:test', 'karma:watcher:run']
      }
    },

    // for changes to the node code
    nodemon    : {
      dev: {
        script : 'server/server.js',
        options: {
          nodeArgs: ['--debug'],
          ignore  : ['bower_components/**', 'build/**', 'client/**', 'node_modules/**', 'public/**'],
          watch   : ['server/src', 'server/config'],
          env     : {
            PORT: '3000'
          },
          ext     : 'js,hbs'
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
        tasks  : ['nodemon:dev', 'shell:mongo', 'watch:scripts', 'watch:less', 'watch:test'],
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
                                   'copy:dev']);
  grunt.registerTask('build:prod', ['clean:prod',
                                    'concat',
                                    'browserify:prod',
                                    'jshint:clientProd',
                                    'jshint:server',
                                    'less:transpile',
                                    'concat',
                                    'cssmin',
                                    'uglify',
                                    'copy:prod']);

  grunt.registerTask('init:dev', ['clean', 'jshint:build', 'build:vendor']);

  grunt.registerTask('heroku', ['env:dev', 'init:dev', 'build:dev']);

  grunt.registerTask('server:dev', ['env:dev', 'build:dev', 'concurrent:dev']);
  grunt.registerTask('server:prod', ['env:prod', 'build:prod', 'concurrent:dev']);
  grunt.registerTask('test:server', ['env:test', 'jshint:server', 'simplemocha:server']);

  grunt.registerTask('test:client', ['env:test', 'jshint:client', 'karma:test']);
  grunt.registerTask('tdd', ['env:test', 'karma:watcher:start', 'concurrent:test']);

  grunt.registerTask('test', ['test:server', 'test:client']);
};
