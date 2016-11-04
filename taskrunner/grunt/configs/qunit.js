/**
 * Configuration QUnit
 *
 * {@link} https://github.com/gruntjs/grunt-contrib-qunit/
 */
module.exports = {
	files: ['tests/qunit/*.html', 'components/**/*-tests.html', '!fixtures/*.html', '!components/**/*-fixture-tests.html'],
};
