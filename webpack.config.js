const path = require("path");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CopyPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const entryPlus = require("webpack-entry-plus");

function defaultFilename(filename) {
  return filename.split("/").pop().replace(/\.js$/, "");
}

// Define entry points here (to be processed through webpack-entry-plus).
const entryFiles = [
  {
    entryFiles: ["./src/js/script.js"],
    outputName: defaultFilename,
  },
];

module.exports = [
  {
    mode: "development",
    entry: entryPlus(entryFiles),
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "./dist/js"),
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: "babel-loader",
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
            name: "vendor",
            chunks: "initial",
          },
        },
      },
      minimize: false,
    },
    devtool: "source-map",
    plugins: [
      new BundleAnalyzerPlugin({ analyzerMode: "disable" }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, "src", "*.html"),
            to: path.join(__dirname, "dist/"),
            context: "src/",
          },
          {
            from: path.join(__dirname, "src", "css/*.css"),
            to: path.join(__dirname, "dist/"),
            context: "src/",
          },
          {
            from: path.join(__dirname, "src", "assets/**/*"),
            to: path.join(__dirname, "dist/"),
            context: "src/",
          },
        ],
      }),
      new UglifyJsPlugin({ sourceMap: true, test: /\.js$/ }),
    ],
    resolve: {
      extensions: [".js"],
      modules: [path.resolve("./src/js"), path.resolve("./node_modules")],
    },
  },
];
