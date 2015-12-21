(function (factory) {
    var tmpl = factory();
    if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = tmpl;
    }
}(function () {
    'use strict';
    var rb = (typeof window != 'undefined' && window.rb) ? window.rb : {};

    if (!rb.escape) {
        rb.escape = function (str) {
            return str;
        };
    }

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    var settings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

    var escapeChar = function (match) {
        return '\\' + escapes[match];
    };

    /**
     * JavaScript ERB style/EJS/JST micro-templating, taken from Underscore without modifying settings parameter.
     *
     * If templates are pre-compiled, this script doesn't need to be included in the production build.
     *
     *
     * @static
     * @memberOf rb
     * @param text {String} The string that should transformed into a template function.
     * @returns {template}
     *
     * @example
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = rb.template('hello <%= user %>!');
     * compiled({ 'user': 'fred' });
     * // => 'hello fred!'
     *
     * // using the HTML "escape" delimiter to escape data property values
     * var compiled = rb.template('<b><%- value %></b>');
     * compiled({ 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to execute JavaScript and generate HTML
     * var compiled = rb.template('<% users.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     */
    rb.template = function (text) {
        var render, template;
        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
                (settings.escape || noMatch).source,
                (settings.interpolate || noMatch).source,
                (settings.evaluate || noMatch).source
            ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':rb.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offset.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + 'return __p;\n';


        /* jshint ignore:start */
        try {
            render = new Function('obj', 'rb', source);
        } catch (e) {
            e.source = source;
            throw e;
        }
        /* jshint ignore:end */

        template = function (data) {
            return render.call(this, data, rb);
        };

        // Provide the compiled source as a convenience for precompilation.
        template.source = 'function(obj){\n' + source + '}';

        return template;
    };

    return rb;
}));
