/* eslint-env node */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const JSON5 = require('json5');

const srcPath = path.join(__dirname, 'src');
const destPath = path.join(__dirname, 'dist');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: true,
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: true,
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                // fiber: require('fibers'),
                fiber: false,
              },
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.json5$/,
        type: 'json',
        parser: {
          parse: JSON5.parse,
        },
      },
    ],
  },
  entry: {
    background: path.join(srcPath, 'background/backgroundEvent.js'),
    main: path.join(srcPath, 'contents/main.js'),
    topPageStyle: path.join(srcPath, 'contents/styles/top/topPageStyle.scss'),
    'popup/popup': path.join(srcPath, 'popup/popup.js'),
    'options/options': path.join(srcPath, 'options/options.js'),
  },
  output: {
    filename: '[name].js',
    path: destPath,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(srcPath, 'manifest.json') },
        { from: path.join(srcPath, 'icons'), to: 'icons' },
        { from: path.join(srcPath, 'popup/*.{html,css,svg}'), to: './popup/[name][ext]' },
        { from: path.join(srcPath, 'options/*.{html,css,svg}'), to: './options/[name][ext]' },
        { from: path.join(srcPath, 'contents/**/*.{html,css,svg}'), to: '[name][ext]' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  resolve: {
    alias: {
      // ライブラリファイルのエイリアス
      Lib: path.join(srcPath, 'lib'),
      Options: path.join(srcPath, 'options'),
      Contents: path.join(srcPath, 'contents'),
      Features: path.join(srcPath, 'contents/features'),
      jQuery: `jquery`,
    },
  },
  stats: {
    builtAt: true,
    errorsCount: true,
    warningsCount: true,
    timings: true,
  },
};
