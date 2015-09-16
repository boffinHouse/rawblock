/**
 * Install RawBLock components to your project (grunt rbinstall --rbm=yourComponentName)
 *
 *
 */
module.exports = {
    install: {
        options: {
            dirs: {
                'js': '<%= paths.src %>/js',
                'sass': '<%= paths.src %>/sass',
                'assemble': '<%= paths.src %>/assemble',
            }
        }
    }
};
