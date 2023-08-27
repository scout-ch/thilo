/* eslint-env node */

const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const svgToMiniDataURI = require("mini-svg-data-uri");

module.exports = function () {
    return {
        context: path.resolve(__dirname, "src"),
        entry: ["./index"],
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].[contenthash].js",
            assetModuleFilename: "[name].[contenthash][ext]",
            publicPath: "/",
            hashDigestLength: 10,
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: path.resolve(__dirname, "tsconfig.json"),
                    configOverwrite: {
                        compilerOptions: {
                            skipLibCheck: true,
                            sourceMap: false,
                            inlineSourceMap: false,
                            declarationMap: false,
                        },
                        exclude: ["**/*.test.js", "**/*.test.jsx", "**/*.test.ts", "**/*.test.tsx", "test/**"],
                    },
                },
            }),
            new HtmlWebpackPlugin({
                template: "index.html",
                baseUrl: process.env.NODE_ENV == 'development'?'/':'/thilo/'
            }),
            new CopyWebpackPlugin({
                patterns: [{ from: "static", noErrorOnMissing: true }],
            }),
            new webpack.DefinePlugin({
                process: {env: {}}
            }),
        ],
        resolve: {
            alias: {
                "~": path.resolve(__dirname, "src"),
            },
            extensionAlias: {
                ".mjs": [".mts", ".mjs"],
            },
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
        node: false,
        module: {
            rules: [
                {
                    test: /\.(j|t)s(x?)$/,
                    exclude: /node_modules/,
                    use: ["babel-loader"],
                },
                {
                    test: /\.(woff(2*)|ttf|png|jp(e*)g|gif|bmp|webp|ico|)$/,
                    exclude: /node_modules/,
                    type: "asset",
                },
                {
                    test: /\.svg$/,
                    exclude: /node_modules/,
                    type: "asset",
                    generator: {
                        dataUrl: (content) => svgToMiniDataURI(content.toString()),
                    },
                },
            ],
        },
        stats: "errors-warnings",
    };
};
