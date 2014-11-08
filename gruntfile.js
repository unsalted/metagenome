module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: false,
          yuicompress: false,
          optimization: 2
        },
        files: {
          // target.css file: source.less file
          'assets/css/styles.css': 'assets/less/styles.less',
        }
      }
    },
   autoprefixer: {
      options: {
        cascade: true
      },
      development: {
        browsers: ['> 2 %', 'last 2 version', 'BB 7', 'BB 10', 'Android 2', 'Android 3', 'Android 4', 'Android 5', 'Firefox ESR'],
        expand: true,
        flatten: true,
        src: 'assets/css/*.css',
        dest: 'assets/css'
      }
    },
    watch: {
      styles: {
        files: ['assets/less/*.less', './*/*.html', 'assets/js/*.js'],
        tasks: ['less', 'autoprefixer'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['watch']);
};