/**
 *  Beautify your CSS/SASS
 *
 */

module.exports = {
   dev: {
       options: {
           config: '<%= paths.helpers %>/task-configs/csscomb.json'
       },
       expand: true,
       cwd: '<%= paths.src %>',
       src: ['sass/**/*.scss', 'components/**/*.scss'],
       dest: '<%= paths.src %>'
   }
};








