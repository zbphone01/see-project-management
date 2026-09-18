const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (env, argv) => ({
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: argv.mode === 'production' ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
    chunkFilename: argv.mode === 'production' ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
    publicPath: '/'
  },
  resolve: { extensions: ['.js', '.vue', '.json'] },
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.css$/, use: ['vue-style-loader', { loader: 'css-loader', options: { url: false } }] }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({ template: './index.html' }),
    new CopyWebpackPlugin([{ from: 'public', to: '.' }])
  ],
  devServer: {
    host: '127.0.0.1',
    port: 4173,
    contentBase: path.resolve(__dirname, 'public'),
    hot: true
  }
})
