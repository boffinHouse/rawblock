/**
 * grunt-concurrent: Run grunt tasks concurrently
 *
 * {@link} https://github.com/sindresorhus/grunt-concurrent
 */
module.exports = {
	dev1: [],
	dev2: ['sass:dev', 'assemble:dev'],
	dist: []
};