/**
 *  Beautify your CSS/SASS
 *
 */

module.exports = {
   dev: {
       options: {
           config: 'taskrunner/task-settings/.csscomb.json',
       },
       expand: true,
       cwd: '<%= paths.src %>',
       src: ['components/**/*.scss'],
       dest: '<%= paths.src %>'
   }
};








