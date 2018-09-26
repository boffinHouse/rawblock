module.exports = function(grunt) {



    grunt.task.registerTask('rb_version', 'copy version.', function() {
        const pk = grunt.file.readJSON('package.json');

        grunt.file.write('src/utils/rb-version.js', `export default '${pk.version}';`);

    });
};
