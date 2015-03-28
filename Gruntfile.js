'use strict';
var path = require('path');

var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

module.exports = function (grunt) {

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    connect: {
      main: {
        options: {
          port: 9001,
          //base: 'dist'
          middleware: function(connect, options) {
            return [folderMount(connect, options.base)]
          }
        }
      }
    },
    watch: {
      main: {
        options: {
            livereload: true,
            spawn: false
        },
        files: ['js/**/*','logics/**/*','css/**/*','img/**/*','partial/**/*','service/**/*','filter/**/*','directive/**/*','index.html'],
        tasks: [] //all the tasks are run dynamically during the watch event handler
      }
    },
    jshint: {
      main: {
        options: {
            jshintrc: '.jshintrc'
        },
        src: ['js/**/*.js','logics/**/*.js','partial/**/*.js','service/**/*.js','filter/**/*.js','directive/**/*.js']
      }
    },
    clean: {
      before:{
        src:['dist','temp']
      },
      after: {
        src:['temp']
      }
    },
    /*
    less: {
      production: {
        options: {
        },
        files: {
          "temp/app.css": "css/app.less"
        }
      }
    },
    */
    ngtemplates: {
      main: {
        options: {
            module:'adaperio',
            htmlmin: {
              collapseBooleanAttributes: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true,
              removeComments: true,
              removeEmptyAttributes: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true
            }
        },
        src: [ 'partial/**/*.html','directive/**/*.html' ],
        dest: 'temp/templates.js'
      }
    },
    copy: {
      main: {
        files: [
          {src: ['*.html'], dest: 'dist/'},
          {src: ['package.json'], dest: 'dist/version'},
          {src: ['bower_components/**'], dest: 'dist/'},
          {src: ['img/**'], dest: 'dist/'},
          {src: ['img_report/**'], dest: 'dist/'},
          {src: ['{{link}}'], dest: 'dist/'},
          {src: ['robots.txt'], dest: 'dist/'},
          //{src: ['assets/**'], dest: 'dist/'},

          // This is original lines
          //{src: ['bower_components/angular-ui-utils/ui-utils-ieshiv.min.js'], dest: 'dist/'},
          //{src: ['bower_components/font-awesome/fonts/**'], dest: 'dist/',filter:'isFile',expand:true}
        ]
      },
      
      css:{
        // this is called only when quick target is built
        files: [
          {
               expand: true,
               src: ['css/**'], 
               dest: 'dist/',
          }
        ] 
      },

      js:{
        files: [
          {src: ['js/**'], dest: 'dist/'},
          {src: ['logics/**'], dest: 'dist/'},
          {src: ['lib/**'], dest: 'dist/'},
        ]
      }
    },

    dom_munger:{
      readscripts: {
        options: {
          read:{selector:'script[data-build!="exclude"]',attribute:'src',writeto:'appjs'}
        },
        src:'index.html'
      },
      readcss: {
        options: {
          read:{selector:'link[rel="stylesheet"]',attribute:'href',writeto:'appcss'}
        },
        src:'index.html'
      },
      removescripts: {
        options:{
          remove:'script[data-remove!="exclude"]',
          append:{selector:'head',html:'<script src="app.full.min.js"></script>'}
        },
        src:'dist/index.html'
      },
      addscript: {
        options:{
          append:{selector:'body',html:'<script src="app.full.min.js"></script>'}
        },
        src:'dist/index.html'
      },
      addfavicon: {
        options:{
          append:{selector:'head',html:'<link rel="icon" href="img/favicon.ico" type="image/x-icon" />'}
        },
        src:'dist/index.html'
      },

      removecss: {
        options:{
          remove:'link',
          append:{selector:'head',html:'<link rel="stylesheet" href="css/app.full.min.css">'}
        },
        src:'dist/index.html'
      },
      addcss: {
        options:{
          append:{selector:'head',html:'<link rel="stylesheet" href="css/app.full.min.css">'}
        },
        src:'dist/index.html'
      }
    },
    cssmin: {
      main: {
        src:['css/app.css','<%= dom_munger.data.appcss %>'],
        dest:'dist/css/app.full.min.css'
      }
    },
    concat: {
      main: {
        src: ['<%= dom_munger.data.appjs %>','<%= ngtemplates.main.dest %>'],
        dest: 'temp/app.full.js'
      }
    },
    ngmin: {
      main: {
        src:'temp/app.full.js',
        dest: 'temp/app.full.js'
      }
    },
    uglify: {
      main: {
        src: 'temp/app.full.js',
        dest:'dist/app.full.min.js'
      }
    },
    htmlmin: {
      main: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    imagemin: {
      main:{
        files: [{
          expand: true, cwd:'dist/',
          src:['**/{*.png,*.jpg}'],
          dest: 'dist/'
        }]
      }
    },
    jasmine: {
      unit: {
        src: ['<%= dom_munger.data.appjs %>','bower_components/angular-mocks/angular-mocks.js'],
        options: {
          keepRunner: true,
          specs: ['js/**/*-spec.js','partial/**/*-spec.js','service/**/*-spec.js','filter/**/*-spec.js','directive/**/*-spec.js']
        }
      }
    },

    shell: {
      bumpVersion: {
        command: 'npm version patch',
        options:
        {
             failOnError: true,
        }
      },

      deployToServer: {
        command: '',
        options:
        {
             failOnError: true
        }
      }
    }
  });

  // Non-optimized web-site
  grunt.registerTask('build',[
	'clean:before',
	'dom_munger:readcss',
	'dom_munger:readscripts',
	'ngtemplates',

	'copy',
     'copy:css',
     'copy:js',

	'dom_munger:addfavicon',
	'clean:after']);

  // Optmized web site (good for deployment)
  grunt.registerTask('release',[
	'jshint',
	'clean:before',
	//'less',
	'dom_munger:readcss',
	'dom_munger:readscripts',
	'ngtemplates',
	'cssmin',
	'concat',
	'ngmin',
	'uglify',
	'copy',
     'copy:css',
     'copy:js',
	'dom_munger:removecss',
	'dom_munger:addcss',
	'dom_munger:removescripts',
	'dom_munger:addscript',
	'dom_munger:addfavicon',
	'htmlmin',
	'imagemin',
	'clean:after']);

  grunt.registerTask('server', ['dom_munger:readscripts','jshint','connect', 'watch']);
  grunt.registerTask('test',['dom_munger:readscripts','jasmine']);

  grunt.registerTask('deploy', [
    'clean',
    //'shell:bumpVersion',      // this requires everything to be commited
    'build',  //'release'
    'shell:deployToServer'
  ]);


  grunt.event.on('watch', function(action, filepath) {
    //https://github.com/gruntjs/grunt-contrib-watch/issues/156

    if (filepath.lastIndexOf('.js') !== -1 && filepath.lastIndexOf('.js') === filepath.length - 3) {

      //lint the changed js file
      grunt.config('jshint.main.src', filepath);
      grunt.task.run('jshint');

      //find the appropriate unit test for the changed file
      var spec = filepath;
      if (filepath.lastIndexOf('-spec.js') === -1 || filepath.lastIndexOf('-spec.js') !== filepath.length - 8) {
        var spec = filepath.substring(0,filepath.length - 3) + '-spec.js';
      }

      //if the spec exists then lets run it
      if (grunt.file.exists(spec)) {
        grunt.config('jasmine.unit.options.specs',spec);
        grunt.task.run('jasmine:unit');
      }
    }

    //if index.html changed, we need to reread the <script> tags so our next run of jasmine
    //will have the correct environment
    if (filepath === 'index.html') {
      grunt.task.run('dom_munger:readscripts');
    }

  });

};
