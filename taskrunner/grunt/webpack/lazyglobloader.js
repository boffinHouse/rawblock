const path = require('path');
const regSplit = /\s+/gm;
const expand = require('glob-expand');

module.exports = function (content, _sourceMap) {
    let ret;
    const patterns = content.trim().split(regSplit);
    let files = expand(
        {
            cwd: path.dirname(this.resourcePath),
            filter: 'isFile'
        },
        patterns
    );
    const extendModuleNames = function(name, moduleNames){

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
        const moduleNames = [];
        const fileTmp = file.split('/');
        const fileName = fileTmp[fileTmp.length - 1].split('.')[0];
        const dirName = fileTmp[fileTmp.length - 2] || '';

        extendModuleNames(fileName, moduleNames);
        extendModuleNames(dirName, moduleNames);

        return 'addImportHook(' + JSON.stringify(moduleNames) +', function(){\n' +
            "    require('bundle!"  + file.replace(/\.js$/, '') + "');\n" +
            '});'
        ;
    });

    ret = 'module.exports = (function(addImportHook){' + files.join('\n') + '})(rb.live.addImportHook);';

    return ret;
};
