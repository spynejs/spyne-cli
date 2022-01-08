const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const _defaultAssetsDirName = "assets";
const port = 8002;

let mode;
let _isProduction;
let _buildType;

// USE "/./" FOR ROOT DOMAIN OR "./" FOR RELATIVE DOMAIN PATHS"
let _relativeRoot = "./"
let _publicPath;
let _assetsFolder;
let _imgPath;

module.exports = (env={mode:"development"})=> {

  mode =           env.mode || 'development';
  _isProduction =   env.build === true;
  _buildType =      process.env.buildType;
  _publicPath =     _isProduction ?  _relativeRoot : "/";
  _assetsFolder =   _isProduction ? `${_defaultAssetsDirName}/` : "";
  _imgPath =        `${_publicPath}${_assetsFolder}static/imgs/`;

  const config = {
    mode,

    entry: {
      index: './src/index.js'
    },

    output: {
      filename: `${_assetsFolder}js/[name].js`,
      publicPath: _publicPath,
      clean: true
    },

    devtool:  _isProduction ? false : 'inline-cheap-source-map',

    devServer: {
      static: {
        directory: 'src',
      },
      historyApiFallback: true,
      port
    },

    plugins:  getWebpackPlugins(),

    optimization: {
      splitChunks: {
        cacheGroups: {
          common: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: 'all',
          }
        },
      }
    },

    module: {
      rules: [

        {
          test: /\.html$/,
          loader: "html-loader",
          options: {
            minimize: false,
            esModule: false,
          }
        },

        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            _isProduction !== true ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader', options: {
                sourceMap: true
              },
            }
          ]
        },

        {
          test: /\.(ttf|woff|woff2)$/,
          type: 'asset/resource',
          generator: {
            filename: `${_assetsFolder}static/fonts/[name][ext][query]`
          }
        },

        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset"
        },

        {
          test: /\.(json)$/,
          type: 'javascript/auto',
          use: [
            {
              loader: 'file-loader',
              options: {
                name: `${_assetsFolder}static/data/[name].[ext]`
              },
            }]
        }

      ]
    },

    resolve: {
      alias: {
        plugins: path.resolve(__dirname, 'src/plugins/'),
        imgs: path.resolve(__dirname, 'src/static/imgs/'),
        fonts: path.resolve(__dirname, 'src/static/fonts/'),
        data: path.resolve(__dirname, '/./src/static/data/'),
        css: path.resolve(__dirname, 'src/css/'),
        core: path.resolve(__dirname, 'src/core/'),
        traits: path.resolve(__dirname, 'src/app/traits/'),
        channels: path.resolve(__dirname, 'src/app/channels/'),
        components: path.resolve(__dirname, 'src/app/components/'),
        node_modules: path.resolve(__dirname, 'node_modules/')

      },

      extensions: ['.js', '.css'],
    }
  };

  return config;

}


const getWebpackPlugins = ()=> {

  const miniCssPlugin = new MiniCssExtractPlugin({
    filename: `${_assetsFolder}/css/main.css`
  });


  const definePlugin = new webpack.DefinePlugin({
    "IMG_PATH": JSON.stringify(_imgPath),
    'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  });

  const htmlPlugin = new HtmlWebpackPlugin({
    template: './src/index.tmpl.html',
    minify: false
  });

  const getCopyPatternsPlugin = () => {
    const patterns = [
      {from: "./src/static/imgs", to: `${_assetsFolder}static/imgs`}
    ]

    if (_buildType === 'apache') {
      patterns.push(
          {from: "./apache-htaccess", to: ".htaccess", toType: "file"})
    }

    return new CopyWebpackPlugin({patterns})
  }

  return _isProduction ?
      [htmlPlugin, definePlugin, miniCssPlugin, getCopyPatternsPlugin()] :
      [htmlPlugin, definePlugin];

}
