const path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './public/js/BicBacBoe/BicBacBoe.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/build'),
    publicPath: '/public'
  },
  devtool: 'source-map',
  watch: true,
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: [
          '@babel/preset-env',
          {
            'plugins': ['@babel/plugin-proposal-class-properties']
          }
        ]
      }
    }]
  }
};
