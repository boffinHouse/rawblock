module.exports = function(grunt) {
	// task to generate styles.scss without sass-globbing
	var options = grunt._rbOptions;

	grunt.registerTask( 'generate-tmp-styles-scss', 'Generate styles tmp file', function() {
		var resultContent = grunt.file.read( options.paths.src + '/sass/_styles-config.scss' );

		//get rid of ../../-prefix, since libsass does not support them in @import-statements+includePaths option
		resultContent = resultContent.replace( /\"\.\.\/\.\.\//g, '"' );

		var importMatches = resultContent.match( /^@import.+\*.*$/mg );

		if ( importMatches ) {
			importMatches.forEach( function(initialMatch) {
				// remove all " or '
				var match = initialMatch.replace( /["']/g, '' );
				// remove the preceeding @import
				match = match.replace( /^@import/g, '' );
				// lets get rid of the final ;
				match = match.replace( /;$/g, '' );
				// remove all whitespaces
				match = match.trim();

				// get all files, which match this pattern
				var files = grunt.file.expand(
					{
						'cwd': options.paths.src + '/sass/',
						'filter': 'isFile'
					},
					match
				);

				var replaceContent = [];

				files.forEach( function(matchedFile) {
					replaceContent.push( '@import "' + matchedFile + '";' );
				} );

				resultContent = resultContent.replace( initialMatch, replaceContent.join( "\n" ) );
			} );
		}
		grunt.file.write( options.paths.src + '/sass/styles.scss', resultContent );
	} );
};
