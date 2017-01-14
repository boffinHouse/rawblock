const path = require('path');
const regSplit = /\s+/gm;
const expand = require('glob-expand');
const toCamelCase = (function () {
    const reg = /-([\da-z])/gi;
    const camelCase = function (all, found) {
        return found.toUpperCase();
    };

    const retCamel = function (str) {
        return str.replace(reg, camelCase);
    };

    return retCamel;
})();

const createName = function (filePath) {
    filePath = filePath.split('/');
    filePath = filePath[filePath.length - 1].split('.')[0];

    return toCamelCase(filePath);
};

module.exports = function (content, _sourceMap) {
    const patterns = content.trim().split(regSplit);
    let files = expand(
        {
            'cwd': path.dirname(this.resourcePath),
            'filter': 'isFile',
        },
        patterns
    );

    files = files.map((file)=>{
        const name = JSON.stringify(createName(file));
        return `rb.templates[${name}] = require(${JSON.stringify(file)});`;
    });

    return files.join('\n');
};
