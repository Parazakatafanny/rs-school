const fs = require('fs');
const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const EslintPlugin = require('eslint-webpack-plugin');

const baseConfig = {
  entry: path.resolve(__dirname, './src/index.ts'),
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(s[ac]ss|css)$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.ts$/i,
        use: 'ts-loader'
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.svg$/i,
        type: 'asset/source'
      },
      {
        test: /\.html$/i,
        loader: 'html-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '/src': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src'),
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    assetModuleFilename: './src/assets/[name][ext]'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `src/index.html`),
      filename: `index.html`,
    }),
    new CleanWebpackPlugin(),
    new EslintPlugin({ extensions: 'ts' }),
  ],
  performance: {
    hints: false,
  },
};

module.exports = ({ mode }) => {
  const isProductionMode = mode === 'prod';
  const envConfig = isProductionMode ? require('./webpack.prod.config') : require('./webpack.dev.config');

  return merge(baseConfig, envConfig);
};