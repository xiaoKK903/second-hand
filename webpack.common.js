require('dotenv').config();
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = {
    entry: {
        index: './client/user/index.ts'
    },
    output: {
        // js生成到dist/js，[name]表示保留原js文件名
        filename: 'js/[name].js',
        // 输出路径为dist
        path: path.resolve(__dirname, './server/public/dist')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './static/index.html',
            chunks: ['index']
        }),
        new VueLoaderPlugin(),
        new ExtractTextPlugin('style.css'),
        new CompressionWebpackPlugin({
            test: /\.(js|css)$/,
            threshold: 10240
        }),
        new webpack.DefinePlugin({
            'process.env.ALI_OSS_BUCKET': JSON.stringify(process.env.ALI_OSS_BUCKET),
            'process.env.ALI_OSS_REGION': JSON.stringify(process.env.ALI_OSS_REGION),
            'process.env.ALI_OSS_ACCESS_KEY_ID': JSON.stringify(process.env.ALI_OSS_ACCESS_KEY_ID),
            'process.env.ALI_OSS_ACCESS_KEY_SECRET': JSON.stringify(process.env.ALI_OSS_ACCESS_KEY_SECRET)
        })
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                exclude: /\/excludes/
            }),
            new OptimizeCSSAssetsPlugin({
                // 生效范围，只压缩匹配到的资源
                assetNameRegExp: /\.optimize\.css$/g,
                // 压缩处理器，默认为cssnsno
                cssProcessor: require('cssnano'),
                // 压缩处理器的配置
                cssProcessorPluginOptions: {
                    discardComments: { removeAll: true }
                },
                // 是否展示log
                canPrint: true
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.styl(us)$/,
                use: ['style-loader', 'css-loader', 'stylus-loader']
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.(png|jpg|gif|eot|woff|ttf|svg|webp|PNG)$/,
                loader: 'url-loader',
                options: {
                    name: '[name]-[hash:6].[ext]',
                    esModule: false,  // 否则src为object module
                    limit: 10000,
                    puplicPath: './static'
                }
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            '@babel/plugin-transform-modules-commonjs'
                        ]
                    }
                },
                exclude: /node_modules/
            }
        ]
    },
    // 配置文件扩展名
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json']
    },
    mode: process.env.NODE_ENV === 'production' ? 'production':'development'
}