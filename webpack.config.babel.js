import LodashModuleReplacementPlugin from 'lodash-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import NpmInstallPlugin from "npm-install-webpack-plugin"
import webpack from 'webpack'
import path from 'path'
import autoprefixer from 'autoprefixer'

module.exports = {
  watch: true,
  cache: true,
  debug: true,

  devtool: 'source-map',

  entry: [
    './src/assets/javascripts/application.jsx'
  ],

  output: {
    path: './public/assets',
    filename: 'application.js',
    sourceMapFilename: '[file].map'
  },

  resolve: {
    root: [
      path.resolve('./src/assets/javascripts'),
      path.resolve('./src/assets/sass'),
    ],
    extensions: ['', '.js', '.jsx']
  },

  module: {
    preLoaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'jshint-loader'
    }],

    loaders: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        'plugins': ['lodash']
      }
    },
    {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style', ['css', 'postcss'])
    },
    {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style', ['css', 'postcss', 'sass'])
    },
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "url-loader?limit=10000&minetype=application/font-woff"
    },
    {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "file-loader"
    }]
  },

  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      '_': 'lodash'
    }),
    new LodashModuleReplacementPlugin,
    new ExtractTextPlugin("application.css")
    // new webpack.optimize.OccurenceOrderPlugin,
    // new webpack.optimize.UglifyJsPlugin
  ]
}
