"use strict";

var loaderUtils = require("loader-utils");
var path = require("path");
var regSplit = /\s+/gm;
var grunt = require('grunt');

module.exports = function (content, sourceMap) {

    var patterns = content.trim().split(regSplit);
    var files = grunt.file.expand(
        {
            'cwd': path.dirname(this.resourcePath),
            'filter': 'isFile'
        },
        patterns
    );

    return "module.exports = [\n" + files.map(function (file) {
            return "  require(" + JSON.stringify(file) + ")";
        }).join(",\n") + "\n];";
};
