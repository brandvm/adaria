import * as esbuild from "esbuild";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";

const dev = process.argv.includes("--dev");
const pkg = JSON.parse(await readFile("package.json", "utf8"));

async function writeSnippets() {
  const css = await readFile("src/styles.css", "utf8");
  await mkdir("dist/licenses", { recursive: true });
  await copyFile("node_modules/lenis/LICENSE", "dist/licenses/lenis-MIT.txt");
  await copyFile("node_modules/swiper/LICENSE", "dist/licenses/swiper-MIT.txt");
  await mkdir("webflow", { recursive: true });
  await writeFile("webflow/global-embed.html",
    '<!-- Adaria: shared Global Styles Embed; include once on every page. -->\n<style id="adaria-global-styles">\n' + css + '</style>\n');
  await writeFile("webflow/footer.html",
    '<!-- Adaria: Footer code. Lenis is included; remove the separate Lenis script. -->\n' +
    '<script defer src="https://cdn.jsdelivr.net/gh/brandvm/adaria@v' + pkg.version + '/dist/adaria.min.js"></script>\n');
}

const config = {
  entryPoints: [
    { in: "src/index.js", out: "adaria.min" },
    { in: "src/vendor/swiper.js", out: "swiper.min" },
    { in: "src/styles.css", out: "adaria.min" },
  ],
  outdir: "dist",
  bundle: true,
  format: "iife",
  minify: !dev,
  sourcemap: dev,
  target: "es2020",
  legalComments: "linked",
  banner: { js: "/*! Adaria: includes MIT-licensed libraries; see the sibling licenses/ directory. */" },
  logLevel: "info",
  plugins: [{
    name: "webflow-snippets",
    setup(build) {
      build.onEnd(async (result) => {
        if (!result.errors.length) await writeSnippets();
      });
    },
  }],
};

if (dev) {
  const context = await esbuild.context(config);
  await context.watch();
  await context.serve({ servedir: "dist", host: "127.0.0.1", port: 3001, cors: { origin: "*" } });
  console.log("Adaria development assets: http://127.0.0.1:3001/adaria.min.js");
} else {
  await esbuild.build(config);
}
