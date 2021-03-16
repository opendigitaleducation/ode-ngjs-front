const path = require('path');

module.exports = env => ({
  mode: "development",
  entry: {
    'ode-ngjs-front': './src/ts/index.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist', env.build_target),
  },
  externals: {
    "ode-ts-client": 'window.entcore["ode-ts-client"]'
  },
  // @see https://github.com/TypeStrong/ts-loader#devtool--sourcemaps
  devtool: "inline-source-map",
  resolve: {
    // Resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".html"]
  },
  module: {
    rules: [
      // ts-loader will handle files with `.ts` or `.tsx` extensions
      { test: /\.tsx?$/, loader: "ts-loader" },
      // file-loader will handle files with `.lazy.html` extensions
      { test: /\.lazy\.html$/, loader: 'file-loader', options: {} },
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
