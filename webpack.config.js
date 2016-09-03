module.exports = {
  entry: "./src/web/script.js",
  output: {
    filename: "./web/js/bundle.js"
  },
  watch: true,
  preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'jshint-loader'
      }
   ],
}
