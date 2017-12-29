module.exports = {
	entry: './frontend/index.js',
	output: {
		filename: 'static/bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['modern-browsers']
				}
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.(eot|ttf|svg|woff|woff2|png)$/,
				loader: 'url-loader'
			}
		]
	}
}
