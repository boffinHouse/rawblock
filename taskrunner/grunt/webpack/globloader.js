const path = require('path');
const regSplit = /\s+/gm;
const expand = require('glob-expand');

module.exports = function (content, _sourceMap) {
    const patterns = content.trim().split(regSplit);
    const files = expand(
        {
            'cwd': path.dirname(this.resourcePath),
            'filter': 'isFile',
        },
        patterns
    );

    return 'module.exports = [\n' + files.map(function (file) {
            return '  require(' + JSON.stringify(file) + ')';
        }).join(',\n') + '\n];';
};
