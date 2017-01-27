module.exports = {
	entry: './index.js',
	output: {
		filename: "server/static/bundle.js"
	},
	watch: true,
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2017', 'react']
				}
			}
		]
	}
}
