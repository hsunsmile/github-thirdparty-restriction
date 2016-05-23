module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      app: {
        src:  'src/assets/js/*.jsx',
        dest: 'public/js/application.js',
        options: {
          transform:  [ require('grunt-react').browserify ],
          watch: true
        }
      }
    },
    sass: {
      dev: {
        options: {
          style: 'expanded',
          loadPath: 'node_modules/bootstrap-sass/assets/stylesheets'
        },
        files: {
          'public/css/app.css': 'src/assets/sass/app.scss'
        }
      },
      dist: {
        options: {
          style: 'compressed',
          loadPath: 'node_modules/bootstrap-sass/assets/stylesheets'
        },
        files: {
          'public/css/app.css': 'src/assets/sass/app.scss'
        }
      }
    },
    watch: {
      sass: {
        files: 'src/assets/sass/*.scss',
        tasks: ['sass:dev']
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['browserify:app', 'sass:dev']);
  grunt.registerTask('browserifyWithWatch', ['browserify:app']);
};
