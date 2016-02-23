/**
 * Merge SVGs from a folder.
 *
 * {@link} https://github.com/FWeinb/grunt-svgstore
 */
module.exports = {
	options: {
		formatting : {
			indent_char: '	',
			indent_size : 1
		}
	},
	svgLogo: {
		options: {
			prefix : 'page-',
			svg: {
				style: "display: none;"
			}
		},
		files: {
			'<%= paths.dev %>/img/logo.svg': ['<%= paths.tmp %>/svgmin/logo/logo.svg']
		}
	},
	svgIcons: {
		options: {
			prefix : 'icon-',
			svg: {
				style: "display: none;"
			}
		},
		files: {
			'<%= paths.dev %>/img/icons/icon-sprite.svg': ['<%= paths.tmp %>/svgmin/icons/**/*.svg']
		}
	}
};

