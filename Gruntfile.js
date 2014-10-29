module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bower: {
      install: {
        options: {
          targetDir: 'client/vendor',
          layout: 'byType'
        }
      }
    },

    clean: {
      build: ['build'],
      dev: {
        src: ['build/app.js', 'build/<%= pkg.name %>.css', 'build/<%= pkg.name %>.js', 'public/js/<%= pkg.name %>.js', 'public/css/<%= pkg.name %>.css']
      },
      prod: ['dist']
    },

    browserify: {
      client: {
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
          'build/tests.js': ['client/test/**/*.test.js']
        },
        options: {
          external: ['backbone.marionette']
        }
      }
    },

    less: {
      transpile: {
        files: {
          'build/<%= pkg.name %>.css': [
            'client/styles/reset.css',
            'client/vendor/css/**/*.css',
            'client/styles/less/main.less'
          ]
        }
      }
    },

    concat: {
      vendor: {
        src: ['client/vendor/js/modernizr/modernizr.js',
              'client/vendor/js/underscore/underscore.js',
              'client/vendor/js/backbone/backbone.js',
              'client/vendor/js/backbone.marionette/backbone.marionette.js',
              'client/js/**/*.js'],
        dest: 'build/vendor.js'
      },
      client: {
        src: ['build/vendor.js', 'build/app.js'],
        dest: 'build/<%= pkg.name %>.js'
      }
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
        files: ['client/templates/*.hbs', 'client/src/**/*.js'],
        tasks: ['clean:dev', 'browserify:client', 'concat', 'copy:dev']
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
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          watch: ['server/src', 'config'],
          env: {
            PORT: '3000'
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
          logConcurrentOutput: true,
          limit: 5
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

  grunt.registerTask('init:dev', ['clean', 'bower', 'concat:vendor']);

  grunt.registerTask('build:dev', ['clean:dev', 'browserify:client', 'browserify:test', 'jshint:dev', 'less:transpile', 'concat', 'copy:dev']);
  grunt.registerTask('build:prod', ['clean:prod', 'concat:vendor', 'browserify:client', 'jshint:all', 'less:transpile', 'concat', 'cssmin', 'uglify', 'copy:prod']);

  grunt.registerTask('heroku', ['init:dev', 'build:dev']);

  grunt.registerTask('server', ['build:dev', 'concurrent:dev']);
  grunt.registerTask('test:server', ['jshint:server', 'simplemocha:server']);

  grunt.registerTask('test:client', ['jshint:client', 'karma:test']);
  grunt.registerTask('tdd', ['karma:watcher:start', 'concurrent:test']);

  grunt.registerTask('test', ['test:server', 'test:client']);
};
