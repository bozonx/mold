var path = require('path');
var cwd = process.cwd();
//var webpack = require('webpack');


// see http://webpack.github.io/docs/configuration.html
module.exports = {
  entry: {
    app_entry: [ './lib/index.js' ],
  },
  output: {
    path: path.join(cwd, './dist'),
    filename: "[name]_build.js",
    chunkFilename: "[id]_build.js",
  },
  externals: {
    // require('jquery') is external and available
    //  on the global var jQuery
    //'jquery': 'jQuery',
    //'_': '_',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      // Coffee uses for tests
      {
        test: /test\/.+\.coffee$/,
        loader: "coffee-loader?sourceMap"
      },
    ],
  },

  resolve: {
    root: [
      path.resolve('./bower_components'),
      //path.resolve('./lib'),
    ],
    alias: {
      lodash: 'lodash/dist/lodash.min.js'
    },
  },

  plugins: [
    //new webpack.ProvidePlugin({
    //  //$:      'jquery/dist/jquery',
    //}),
  ]
};
