const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = env => ({
  mode: "production",
  entry: {
    'ode-ngjs-front': './src/ts/index.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist', 'bundle'),
    clean: true
  },
  externals: {
    "angular": "angular",    
    "ode-ts-client": 'window.entcore["ode-ts-client"]'
  },
  // @see https://github.com/TypeStrong/ts-loader#devtool--sourcemaps
  devtool: "source-map",
  resolve: {
    // Resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".html"]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
        extractComments: false,
    })],
  },
  module: {
    rules: [
      // ts-loader will handle files with `.ts` or `.tsx` extensions
      { test: /\.tsx?$/, loader: "ts-loader" },
      // file-loader will handle files with `.lazy.html` extensions
      { test: /\.lazy\.html$/, loader: 'file-loader', options: {}, type: 'javascript/auto' },
      // html-loader will handle all files with `.html` but not `.lazy.html` extensions
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
});
