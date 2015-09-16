/**
 * grunt-svgmin: Minify SVG using SVGO
 *
 * {@link} https://github.com/sindresorhus/grunt-svgmin
 */
module.exports = {
	options: {
		plugins: [
			{ cleanupAttrs: true },
			{ cleanupEnableBackground: true },
			{ cleanupIDs: true },
			{ cleanupListOfValues: true },
			{ cleanupNumericValues: true },
			{ collapseGroups: true },
			{ convertColors: true },
			{ convertPathData: true },
			{ convertShapeToPath: true },
			{ convertStyleToAttrs: true },
			{ convertTransform: true },
			{ mergePaths: true },
			{ moveElemsAttrsToGroup: true },
			{ moveGroupAttrsToElems: true },
			{ removeComments: true },
			{ removeDesc: true },
			{ removeDoctype: true },
			{ removeEditorsNSData: true },
			{ removeEmptyAttrs: true },
			{ removeEmptyContainers: true },
			{ removeEmptyText: true },
			{ removeHiddenElems: true },
			{ removeMetadata: true },
			{ removeNonInheritableGroupAttrs: true },
			{ removeRasterImages: true },
			{ removeTitle: true },
			{ removeUnknownsAndDefaults: true },
			{ removeUnusedNS: true },
			{ removeUselessDefs: true },
			{ removeUselessStrokeAndFill: false },
			{ removeViewBox: false },
			{ removeXMLProcInst: false },
			{ sortAttrs: true },
			{ transformsWithOnePath: false }
		]
	},
	svgLogo: {
		options: {
			plugins: [
				{ removeXMLProcInst: true },
				{ removeTitle: true },
			]
		},
		files: {
			'<%= paths.tmp %>/svgmin/logo.svg': ['<%= paths.src %>/img/logo/*.svg']
		},
	},
	svgIcons: {
		files: [
			{
				cwd: '<%= paths.src %>/img/icons',
				dest: '<%= paths.tmp %>/svgmin/icons',
				expand: true,
				ext: '.svg',
				src: ['*.svg']
			}
		]
	},
};
