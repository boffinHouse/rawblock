/**
 * Helper uniqueID
 *
 */


module.exports.register = function (Handlebars, options) {
	var i = 1;

	Handlebars.registerHelper('uniqueID', function (context, options) {
		var id = "id-" + i;

		if(arguments.length == 1){
			options = context;
			context = this;
		}

		if(typeof context == "object") {
			context["id"] = id;
		}
		else {
			console.warn('No valid type is found, please check your data file')
		}

		i += 1;

		return options.fn(context);
	});

};

