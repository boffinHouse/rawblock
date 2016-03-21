"use strict";

var loaderUtils = require("loader-utils");
var path = require("path");
var regSplit = /\s+/gm;
var grunt = require('grunt');

module.exports = function (content, sourceMap) {
    var ret;
    var patterns = content.trim().split(regSplit);
    var files = grunt.file.expand(
        {
            'cwd': path.dirname(this.resourcePath),
            'filter': 'isFile'
        },
        patterns
    );
    var extendModuleNames = function(name, moduleNames){

        ['', '_', '-'].forEach(function(sign){
            var tmp = name;
            if(sign){
                tmp = name.split(sign);
                tmp.shift();
                tmp = tmp.join(sign);
            }

            if(tmp && moduleNames.indexOf(tmp) == -1){
                moduleNames.push(tmp);
            }
        });
    };

    files = files.map(function(file){
        var moduleNames = [];
        var fileTmp = file.split('/');
        var fileName = fileTmp[fileTmp.length - 1].split('.')[0];
        var dirName = fileTmp[fileTmp.length - 2] || '';

        extendModuleNames(fileName, moduleNames);
        extendModuleNames(dirName, moduleNames);

        return "addImportHook(" + JSON.stringify(moduleNames) +", function(){\n" +
            "    require('bundle!"  + file.replace(/\.js$/, '') + "');\n" +
            "});"
        ;
    });

    ret = "module.exports = (function(addImportHook){" + files.join("\n") + "})(rb.life.addImportHook);";

    return ret;
};
