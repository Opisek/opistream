import { rmSync, readdirSync, writeFileSync, createReadStream, createWriteStream, readFileSync, existsSync, mkdirSync } from "fs";
import { extname, join, parse } from "path";
import { get } from "https";

import webpack from "webpack";
import { generate } from "critical";

import { cssDistDir, distDir, htmlDir, htmlDistDir, jsDistDir, jsLibDir, rootDir } from "./paths.js";
import webpackConfig from "./webpack/webpack.config.js";
import { createGzip } from "zlib";

(async () => {
    console.log("Clearing dist");
    rmSync(distDir, { recursive: true, force: true });

    let htmlFiles = readdirSync(htmlDir);

    console.log("Collecting files");
    createEntry(htmlFiles);

    console.log("Downloading libraries");
    await downloadLibraries();

    console.log("Running webpack");
    await runWebpack(htmlFiles);

    htmlFiles = htmlFiles.map(file => `${htmlDistDir}/${parse(file).name}.html`);

    console.log("Remove bundle references");
    await removeBundle(htmlFiles);

    console.log("Inlining critical CSS");
    await inlineCriticalCss(htmlFiles);
    
    console.log("Compressing files");
    compressFiles(htmlDistDir, [".html"]);
    compressFiles(cssDistDir, [".css"]);
    compressFiles(jsDistDir, [".js"]);

    console.log("Cleaning up");
    cleanup();
})();

function downloadLibraries(...files) {
    rmSync(jsLibDir, { recursive: true, force: true });
    mkdirSync(jsLibDir);

    return Promise.all(
        files.map(url => new Promise((resolve, reject) => {
            console.log(`Downloading ${url}`);

            const parts = url.split("/");
            const filename = parts[parts.length - 1];

            const writeStream = createWriteStream(join(jsLibDir, filename));
       
            get(url, function(response) {
                response.pipe(writeStream);

                writeStream.on("error", reject);

                writeStream.on("finish", () => {
                    writeStream.close();
                    console.log(`Downloaded ${url}`);
                    resolve();
                });
            });
        }))
    );
}

function createEntry(htmlFiles) {
    writeFileSync(
        join(rootDir, "entry.js"),
        htmlFiles.map(file => `require("${join(htmlDir, file)}");`).reduce((accumulator, current) => accumulator + current)
    );
}

async function runWebpack(htmlFiles) {
    const [webpackError, webpackStats] = await new Promise(res => webpack(webpackConfig(htmlFiles), (error, stats) => res([error, stats])));
    if (webpackError) console.error(`Webpack Errors:\n${webpackError}`);
    if (webpackStats.hasWarnings()) console.error(webpackStats.toJson().warnings);
    if (webpackStats.hasErrors()) console.error(webpackStats.toJson().errors);
}

function cleanup() {
    rmSync(join(distDir, "bundle.js"));
    rmSync(join(rootDir, "entry.js"));
}

function replaceInFiles(files, match, replacement) {
    return Promise.all(
        files.map(file => new Promise((resolve, reject) => {
            try {
                writeFileSync(file, readFileSync(file, {encoding:"utf8"}).replaceAll(match, replacement));
            } catch(e) {
                reject(`Error removing "${match}" from "${file}":\n${e}`);
            }
            resolve();
        }))
    );
}

function removeBundle(files) {
    return replaceInFiles(files, /<script[^>]+src="..\/bundle\.js"[^>]*(?:\/>|><\/script>)/g, "");
}

function inlineCriticalCss(htmlFiles) {
    return Promise.all(
        htmlFiles.map(file => generate({
            base: distDir,
            src: file,
            target: file,
            inline: true,
            inlineImages: true,
            dimensions: [ // https://www.browserstack.com/guide/ideal-screen-sizes-for-responsive-design
                {
                    width: 1920,
                    height: 1080
                },
                {
                    width: 1366,
                    height: 768 
                },
                {
                    width: 360,
                    height: 640 
                }
            ]
        }))
    );
}

async function compressFiles(directory, extensions) {
    if (!existsSync(directory)) return;
    const files = readdirSync(directory);
    return Promise.all(
        files
            .filter(file => extensions.includes(extname(file)))
            .map(file => new Promise((resolve, reject) => {
                createReadStream(join(directory, file))
                    .pipe(createGzip())
                    .pipe(createWriteStream(join(directory, `${file}.gz`)))
                    .on("error", reject)
                    .on("finish", resolve);
            }))
    );
}