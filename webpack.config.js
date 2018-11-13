const glob = require("glob");
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const entryPlus = require('webpack-entry-plus');

function defaultFilename (filename) {
  return filename.split('/').pop().replace(/\.js$/, '');
}

// Define entry points here (to be processed through webpack-entry-plus).
const entryFiles = [
  {
    entryFiles: [
      './js/script.js',
    ],
    outputName: defaultFilename,
  },
];

module.exports = [
  {
    entry: entryPlus(entryFiles),
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, './dist/js'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
          },
          exclude: /(node_modules)/,
        },
      ],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
          },
        },
      }
    },
    plugins: [
      new BundleAnalyzerPlugin({ analyzerMode: 'disable' }),
      new CopyWebpackPlugin([
        {
          from: path.join(__dirname, '*.html'),
          to: path.join(__dirname, 'dist/'),
        },
        {
          from: path.join(__dirname, 'css/*.css'),
          to: path.join(__dirname, 'dist/'),
        },
      ]),
      new UglifyJsPlugin({ test: /\.js$/ }),
    ],
    resolve: {
      modules: [
        path.resolve('./js'),
        path.resolve('./node_modules'),
      ]
    }
  },
];
