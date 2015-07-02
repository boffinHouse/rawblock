// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({

	tunnel: "NullTunnel",

	environments: [ { browserName: 'phantomjs' } ],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 3,

	reporters: [ 'Console' ],

	// Non-functional test suite(s) to run in each browser
	suites: [ 'tests/unit/dom', 'tests/unit/life' ],

	// Functional test suite(s) to run in each browser once non-functional tests are completed
	functionalSuites: [  ],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^tests|bower_components|node_modules\//
});
