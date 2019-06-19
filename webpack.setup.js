const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules')],
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  output: {
    filename: 'setup.js',
    path: path.resolve(__dirname, 'dist-setup')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  entry: [path.join(__dirname, 'src/database/setup.ts')],
  target: 'node'
};