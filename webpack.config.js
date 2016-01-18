var path = require('path');
var cwd = process.cwd();
var webpack = require('webpack');


// see http://webpack.github.io/docs/configuration.html
module.exports = {
  devServer: {
    ////////// webpack-dev-server options
    // see http://webpack.github.io/docs/webpack-dev-server.html#api

    // path to public dir with index.html
    contentBase: 'www',
    publicPath: 'www',

    // Enable special support for Hot Module Replacement
    // Page is no longer updated, but a 'webpackHotUpdate' message is send to the content
    // Use 'webpack/hot/dev-server' as additional module in your entry point
    // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.
    //hot: true,
    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.
    //historyApiFallback: false,

    //// webpack-dev-middleware options
    //lazy: true,
    //filename: './test/app/dist/red-data.js',
    //watchOptions: {
    //    aggregateTimeout: 300,
    //    poll: 1000
    //},
    stats: { colors: true },
  },
  entry: {
    app_entry: [ './lib/index.js' ],
  },
  output: {
    path: path.join(cwd, './dist'),
    filename: "[name]_build.js",
    chunkFilename: "[id]_build.js",
    //publicPath: 'public',
    //// see http://webpack.github.io/docs/library-and-externals.html
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
        // get only .js files, not manifest.js
        test: function (val) {
          return val.match(val.match(/app\/.+\.js$/) && !val.match(/component\.js$/));
        },
        loader: 'babel'
      },
      // Coffee uses for tests
      {
        test: /\.coffee$/,
        loader: "coffee-loader?sourceMap"
      },
    ],
  },

  resolve: {
  //  root: [
  //    //path.join(__dirname, "bower_components"),
  //    'bower_components',
  //    // TODO: переделать
  //    //'../',
  //    //path.join(__dirname, "bower_components/composite-fw"),
  //  ],
  //  alias: {
  //    lodash: 'lodash/lodash.min.js'
  //  }
  },

  plugins: [
    //new webpack.ProvidePlugin({
    //  //$:      'jquery/dist/jquery',
    //}),
  ]
};
