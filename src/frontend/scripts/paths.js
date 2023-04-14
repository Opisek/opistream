import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const htmlDir = join(rootDir, "html");
export const cssDir = join(rootDir, "css");
export const jsDir = join(rootDir, "js");
export const jsLibDir = join(rootDir, "lib");

export const distDir = join(rootDir, "dist");
export const htmlDistDir = join(distDir, "html");
export const cssDistDir = join(distDir, "css");
export const jsDistDir = join(distDir, "js");

export const nodeDir = join(rootDir, "node_modules");