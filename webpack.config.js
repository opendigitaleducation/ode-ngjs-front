const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    'ode-ngjs-front': './dist/ts/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist', 'bundle'),
  },
  devtool: "source-map",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
        extractComments: false,
    })],
  },
  module: {
    rules: [
      {
        test: /\.lazy\.html$/,
        loader: 'file-loader',
        options: {},
      },
      {
        test: /\.html$/,
        exclude: /\.lazy\.html$/,
        loader: 'html-loader',
        options: {
          minimize: true,
          sources: false, // Disables attributes processing
        },
      },
    ],
  },
};
