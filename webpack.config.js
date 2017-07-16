module.exports = {
	entry: './frontend/index.js',
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
					presets: ['es2017']
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
