import { join, parse, dirname, resolve } from "path";
import { fileURLToPath } from "url";

import webpack from "webpack";

import HtmlWebpackPlugin from "html-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

import { rootDir, distDir, htmlDir } from "../paths.js";

export default (htmlFiles: string[]): webpack.Configuration => ({
    mode: "production",
    entry: join(rootDir, "entry.js"),
    output: {
        path: distDir,
        filename: "bundle.js",
        assetModuleFilename: "static/[contenthash][ext]"
    },
    module: {
        rules: [
            {
                test: /\.ejs$/i,
                use: [ "html-loader", "webp-everywhere", "template-ejs-loader" ]
            },
            {
                test: /\.css$/i,
                type: "asset/resource",
                generator : { filename : "css/[contenthash][ext]" }
            },
            {
                test: /\.s[ac]ss$/i,
                type: "asset/resource",
                use: "sass-loader",
                generator : { filename : "css/[contenthash].css" }
            },
            {
                test: /\.js$/i,
                exclude: [ /node_modules/, /entry\.js$/ ],
                type: "asset/resource",
                generator : { filename : "js/[contenthash].js" }
            },
            {
                test: /\.ts$/i,
                exclude: /node_modules/,
                type: "asset/resource",
                use: [ "remove-typescript-module", "ts-loader" ],
                generator : { filename : "js/[contenthash].js" }
            },
            {
                test: /\.(png|jpe?g|webp|gif|svg|)$/i,
                type: "asset",
                generator : { filename : "images/[contenthash][ext]" }
            }
        ]
    },
    resolveLoader: {
        alias: {
            "webp-everywhere": resolve(dirname(fileURLToPath(import.meta.url)), "./loaders/WebpEverywhere.cjs"),
            "remove-typescript-module": resolve(dirname(fileURLToPath(import.meta.url)), "./loaders/RemoveTypescriptModule.cjs")
        }
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        plugins: [ new TsconfigPathsPlugin({ configFile: "./tsconfig.json" }) ]
    },
    plugins: htmlFiles.map(
        file => new HtmlWebpackPlugin({
            filename: `html/${parse(file).name}.html`,
            template: join(htmlDir, file)
        })
    ).concat([
    ]),
    optimization: {
        realContentHash: false,
        minimizer: [
            new ImageMinimizerPlugin({
                generator: [
                    {
                        preset: "webp",
                        implementation: ImageMinimizerPlugin.sharpGenerate,
                        options: { encodeOptions: { webp: { quality: 75 }}}
                    }
                ]
            }),
            new TerserPlugin({ parallel: true }),
            new CssMinimizerPlugin()
        ]
    }
});