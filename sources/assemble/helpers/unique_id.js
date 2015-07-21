/**
 * Helper uniqueData
 *
 */


module.exports.register = function (Handlebars, options) {
	var i = 1;

	Handlebars.registerHelper('uniqueID', function (context, options) {
		var id = "id-" + i;
		var prop = 'id';

		if(typeof context == 'string'){
			prop = context;

			if(arguments.length == 3){
				context = options;
				options = arguments[2];
			} else {
				context = this;
			}
		}

		if(arguments.length == 1){
			options = context;
			context = this;
		}

		if(typeof context == "object") {
			context[prop] = context[prop] || id;
		}
		else {

			console.warn('No valid type is found, please check your data file')
		}

		i += 1;

		return options.fn(context);
	});

};

