var webpack = require('webpack');
var path = require('path');
var fs = require('fs-extra');
var crypto = require('crypto');
var package_data = require('./package.json');
var buildDir = './build';

// Ensure a clear build directory.
fs.ensureDirSync(buildDir);

// Create the hash
var hash = crypto.createHash('md5');
hash.update(fs.readFileSync('./package.json'));
var digest = hash.digest('hex');
fs.writeFileSync(path.resolve(buildDir, 'hash.md5'), digest);


module.exports = {
  entry:  './src/browser/index.tsx',
  output: {
    path: path.resolve(buildDir),
    filename: '[name].bundle.js',
    publicPath: '../../build/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.json$/, use: 'json-loader' },
      { test: /\.ts$/, use: 'awesome-typescript-loader?configFileName=./src/browser/tsconfig.json' },
      { test: /\.tsx$/, use: 'awesome-typescript-loader?configFileName=./src/browser/tsconfig.json' },
      { test: /\.html$/, use: 'file-loader' },
      { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
      { test: /\.js.map$/, use: 'file-loader' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml' }
    ],
  },
  node: {
    fs: 'empty'
  },
  bail: true,
  devtool: 'cheap-source-map'
}
