module.exports = function(grunt) {
	// task to generate sass-globbing
	grunt.registerMultiTask( 'scssglobbing', 'Generate styles tmp file', function() {

		var options = this.options({
			src: '',
		});

		grunt.file.expand(options.src).forEach(function(globFile){
			var files, replaceContent;
			var dir = globFile.split('/');
			var filename = dir.pop();
			var resultContent = grunt.file.read( globFile );

			if(!/^_+/.test(filename)){
				grunt.fail.warn('file has to start with a least one underscore (_):  "' + filename + '".');
			}

			dir = dir.join('/') + '/';

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
					match = match.trim().split(/\s*,*\s+/g);

					// get all files, which match this pattern
					files = grunt.file.expand(
						{
							'cwd': dir,
							'filter': 'isFile'
						},
						match
					);

					replaceContent = [];

					files.forEach( function(matchedFile) {
						replaceContent.push( '@import "' + matchedFile + '";' );
					} );

					resultContent = resultContent.replace( initialMatch, replaceContent.join( "\n" ) );
				} );
			}

			grunt.file.write( dir + 'tmp_'+ (filename.replace(/^_+/, '')), resultContent );
		})

	} );
};
