var webpack = require('webpack');
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
	// 配置入口
	entry: {
		index: './src/js/index.js'
	},
	// 配置出口
	output: {
		path: __dirname + "/dist/",
		filename: 'js/[name]-[hash:5].js',
		publicPath: '/',
	},

	module: {
		rules: [{
				test: '/\.js$/',
				loader: 'babel-loader',
				exclude: path.resolve(__dirname, 'node_modules'),
				include: path.resolve(__dirname, 'src'),
				options: {
					presets: ['es2015']
				}
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{
							loader: 'css-loader',
							options: {
								minimize: true,
								publicPath: '../../'
							}
						},
						{
							loader: 'postcss-loader'
						}
					]
				})
			},
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						"css-loader",
						"postcss-loader",
						"sass-loader"

					]
				})
			},
			{
				test: /\.less$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						"css-loader",
						"postcss-loader",
						"less-loader"
					]
				})
			},
			// 图片处理
			{
				test: /\.(png|jpg|jpe|gif|svg)(\?.*)?$/,
				use: [{
					loader: 'url-loader',
					options: {
						limit: 1000,
						name: 'images/[name].[ext]'
					}
				}, {
					loader: 'image-webpack-loader',
					options: {
						mozjpeg: {
							progressive: true,
							quality: 65
						},
						// optipng.enabled: false will disable optipng
						optipng: {
							enabled: false,
						},
						pngquant: {
							quality: '65-90',
							speed: 4
						},
						gifsicle: {
							interlaced: false,
						}
						
					}
				}]
			},
			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 100000,
						name: 'media/[name].[ext]'
					}
				}
			},
			{
				test: /\.(htm|html)$/i,
				use: ['html-withimg-loader']
			}
		]
	},
	optimization: {
        runtimeChunk: {
            name: "runtime"
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "initial",
                    minChunks: 2
                }
            }
        }
    },
	plugins: [
		new UglifyJsPlugin(), //压缩js
		//抽离css
		new ExtractTextPlugin({
			filename: (getPath) => {
				return getPath('css/[name]_[chunkhash:8].css').replace('css/js', 'css');
			},
			// filename:'app_[chunkhash].css',
			disable: false,
			allChunks: true
		}),
		//压缩css
		new OptimizeCssAssetsPlugin({
			assetNameRegExp: /\.optimize\.css$/g,
			cssProcessor: require('cssnano'),
			cssProcessorOptions: {
				discardComments: {
					removeAll: true
				}
			},
			canPrint: true
		}),
		new webpack.LoaderOptionsPlugin({
			options: {
				postcss: () => {
					return [
						require('autoprefixer')({

						})
					]
				}
			}
		}),

		new HtmlWebpackPlugin({
			filename: __dirname + '/dist/index.html',
			inject: 'head',
			template: 'html-withimg-loader!' + __dirname + "/src/index.html",
			chunks: ['index','vendor','runtime'],
			inlineSource: '.(js|css)$',
			minify: {
				removeComments: true, //删除注释
				collapseWhitespace: true //删除空格
			}
		}),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			jquery: "jquery",
			"window.jQuery": "jquery"
		}),
		//设置每一次build之前先删除dist
		new CleanWebpackPlugin(
			['dist/*'],
			{
				root: __dirname,
				verbose: true, //开启在控制台输出信息
				dry: false //启用删除文件
			}
		)
	],
	// 起本地服务
	devServer: {
		contentBase: "./dist/",
		historyApiFallback: true,
		inline: true,
		hot: true,
		port: 8100,
		host: '10.2.8.121', //可以设置为本机局域网IP地址，方便内网测试
	}
}