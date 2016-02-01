module.exports.register = function (Handlebars, options) {
    var grunt = require('grunt');

    Handlebars.registerHelper('includeraw', function(src){
        return new Handlebars.SafeString(grunt.file.read(src));
    });
};
