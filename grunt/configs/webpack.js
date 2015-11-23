var webpack = require("webpack");

var devPlugins = [
	new webpack.DefinePlugin({
		"process.env": {
			// This has effect on the react lib size
			"NODE_ENV": JSON.stringify("production")
		}
	}),
	new webpack.optimize.DedupePlugin(),
	new webpack.optimize.CommonsChunkPlugin({
		children: true,
		async: true,
		minSize: 10000,
	}),
	new webpack.optimize.CommonsChunkPlugin({
		children: true,
		async: true,
		minSize: 3000,
		minChunks: 3,
	}),
	new webpack.optimize.CommonsChunkPlugin({
		children: true,
		async: true,
		minChunks: 6,
	})
];
var productionPlugins = devPlugins.concat([new webpack.optimize.UglifyJsPlugin()]);

module.exports = {
	options: {
		cache: true,
		entry: {
			'_main-behavior': "./sources/js/_main-behavior.js",
			//'_crucial-behavior': "./sources/js/_crucial-behavior.js",
			'_rb_polyfills': ["./sources/js/_rb_polyfills"],
		},
		output: {
			filename: "[name].js",
			chunkFilename: "[chunkhash].js"
		},
		module: {
			loaders: [
				{
					test: /\.css$/,
					loader: "style-loader!css-loader"
				},
				{
					test: /\.scss$/,
					loaders: ["style", "css", "sass"]
				},
				{
					test: /\.ejs/,
					loader: "rb_template-loader",
				}
			]
		},
		resolve: {
			alias: {

			}
		},
	},
	dev: {
		devtool: "sourcemap",
		debug: true,
		output: {
			path: '<%= paths.dev %>/js/',
		},
		plugins: devPlugins
	},
	"dist": {
		output: {
			path: '<%= paths.dist %>/js/',
		},
		plugins: productionPlugins
	}
};
