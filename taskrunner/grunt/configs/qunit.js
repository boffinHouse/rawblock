/**
 * Configuration QUnit
 *
 * {@link} https://github.com/gruntjs/grunt-contrib-qunit/
 */
module.exports = {
	files: ['tests/funit/*.html', 'sources/components/**/tests/funit/*.html', '!fixtures/*.html'],
};
