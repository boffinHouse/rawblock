var _ = require('lodash');
module.exports.register = function (Handlebars, options)  {

	Handlebars.registerHelper('mergeJSON', (function(){
		var slice = [].slice;
		var toObj = function(json){
			if(typeof json == 'string'){
				try {
					json = JSON.parse(json)
				} catch(e){
					json = null;
				}
			}
			return json;
		};

		return function() {
			var args = slice.call(arguments);
			var options = args.pop();

			args = args.map(toObj);

			if(args.length == 1 && options.data){
				args.unshift(options.data.root || options.data);
			}

			args.unshift({});

			return options.fn( _.merge.apply(_, args) );
		};
	})());

};
