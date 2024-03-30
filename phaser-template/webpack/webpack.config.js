    const path = require('path')
    const CopyWebpackPlugin = require('copy-webpack-plugin')
    const HtmlWebpackPlugin = require('html-webpack-plugin')
    const webpack = require("webpack");


    module.exports = {

        mode: 'development',
        stats: 'errors-warnings',
        devtool: 'eval',
        devServer: {
            open: true
        },
        entry: ['./src/scripts/game.ts'],
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: '[name].bundle.js',
            chunkFilename: '[name].chunk.js'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            fallback: {
                "process": require.resolve("process/browser"),
                "fs": require.resolve("fs"),
                "crypto": false,
                "stream": false,
                "http": false,
                "https": false,
                "zlib": false,
                "url": false,
                buffer: require.resolve("buffer"),
            }
        },
        module: {
            rules: [{ test: /\.tsx?$|\.jsx?$/, include: path.join(__dirname, '../src'), loader: 'ts-loader' },]
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        filename: '[name].bundle.js'
                    }
                }
            }
        },
        plugins: [
            new HtmlWebpackPlugin({ gameName: 'TerraQuestt', template: 'src/index.html' }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'src/assets', to: 'assets' },
                    // { from: 'pwa', to: '' },
                    { from: 'src/favicon.ico', to: '' }
                ]
            }),
            new webpack.ProvidePlugin({Buffer: ["buffer", "Buffer"],
            process: 'process/browser', })
        ]
    }
