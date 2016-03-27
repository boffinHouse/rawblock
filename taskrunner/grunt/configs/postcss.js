/**
 * grunt-postcss
 *
 * {@link} https://github.com/nDmitry/grunt-postcss
 */
module.exports = {
    options: {
        map: true,
        processors: [
            require('autoprefixer')({browsers: ['last 2 version', 'ie >= 10', 'Android >= 4.3', 'Firefox ESR']}),
            require('postcss-import')
        ]
    },
    dev: {
        src: '<%= paths.dev %>/css/*.css'
    }
};
