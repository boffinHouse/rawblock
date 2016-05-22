var webpack = require('webpack');

var devPlugins = [
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
		minSize: 500,
		minChunks: 6,
	}),
	new webpack.optimize.AggressiveMergingPlugin({
		minSizeReduce: 3,
		moveToParents: true,
		entryChunkMultiplicator: 5,
	}),
	new webpack.optimize.AggressiveMergingPlugin({
		minSizeReduce: 1.5,
	})
];

module.exports = {
	options: {
		cache: true,
		entry: {
			'_main-behavior': './<%= paths.src %>/js/_main-behavior.js',
			//'_crucial-behavior': './<%= paths.src %>/js/_crucial-behavior.js',
			'_rb_polyfills': './<%= paths.src %>/js/_rb_polyfills.js',
		},
		output: {
			filename: '[name].js',
			chunkFilename: '[chunkhash].js',
		},
		module: {
			loaders: [
				//{
				//	test: /\.jsx?$|\.es6$|\.es2015/,
				//	exclude: /node_modules/,
				//	loader: 'babel-loader',
				//	query: {
				//		plugins: [],
				//		presets: ['es2015-loose'],
				//	},
				//},
				{
					test: /\.css$/,
					loader: 'style-loader!css-loader',
				},
				{
					test: /\.scss$/,
					loaders: ['style', 'css', 'sass'],
				},
				{
					test: /\.ejs/,
					loader: 'rb_template-loader',
				}
			]
		},
		resolve: {
			alias: {

			}
		},
	},
	dev: {
		devtool: 'sourcemap',
		debug: true,
		output: {
			path: '<%= paths.dev %>/js/',
		},
		plugins: devPlugins,
	},
};
