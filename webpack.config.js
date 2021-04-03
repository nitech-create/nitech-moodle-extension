/* eslint-env node */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background/backgroundEvent.js',
    calendar: './src/contents/calender/calender.js',
    videoArea: './src/contents/videoArea/videoArea.js',
    main: './src/contents/general/main.js',
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { from: './src/icons', to: 'icons' },
        { from: './src/popup', to: 'popup' },
        { from: './src/options', to: 'options' },
        { from: './src/contents/**/*.{html,css,svg}', to: '[name].[ext]' },
      ],
    }),
  ],
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  resolve: {
    alias: {
      // ライブラリファイルのエイリアス
      Lib: path.join(__dirname, 'src/lib'),
      Contents: path.join(__dirname, 'src/contents'),
      General: path.join(__dirname, 'src/contents/general'),
    },
  },
  stats: {
    builtAt: true,
    errorsCount: true,
    warningsCount: true,
    timings: true,
  },
  watchOptions: {
    ignored: /node_modules/,
  },
};
