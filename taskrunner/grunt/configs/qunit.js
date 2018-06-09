/**
 * Configuration QUnit
 *
 * {@link} https://github.com/gruntjs/grunt-contrib-qunit/
 */
module.exports = {
	files: ['tests/qunit/*.html', 'src/components/**/*-tests.html', '!fixtures/*.html', '!src/components/**/*-fixture-tests.html'],
};
