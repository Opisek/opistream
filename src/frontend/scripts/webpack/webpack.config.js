import { join, parse, dirname, resolve } from "path";
import { fileURLToPath } from "url";

import HtmlWebpackPlugin from "html-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

import { rootDir, distDir, htmlDir } from "../paths.js";

export default (htmlFiles) => ({
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
                exclude: /node_modules/,
                use: ["html-loader", "webp-everywhere", "template-ejs-loader"]
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                type: "asset/resource",
                generator : {
                    filename : "css/[contenthash][ext]"
                }
            },
            {
                test: /\.ts$/i,
                exclude: /node_modules/,
                type: "asset/resource",
                use: "ts-loader",
                generator : {
                    filename : "js/[contenthash].js"
                }
            },
            {
                test: /\.(png|jpe?g|webp|gif|svg|)$/i,
                exclude: /node_modules/,
                type: "asset",
                generator : {
                    filename : "images/[contenthash][ext]"
                }
            }
        ]
    },
    resolveLoader: {
        alias: {
            "webp-everywhere": resolve(dirname(fileURLToPath(import.meta.url)), "./WebpEverywhere.cjs")
        }
    },
    resolve: {
        extensions: [".ts", ".js"]
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
                        options: {
                            encodeOptions: {
                                webp: {
                                    quality: 75
                                }
                            }
                        }
                    }
                ]
            }),
            new TerserPlugin(),
            new CssMinimizerPlugin()
        ]
    }
});