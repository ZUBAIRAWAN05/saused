import { dirname } from "path";
import execa from "execa";
import glob from "glob";
import pLimit from "p-limit";

const limit = pLimit(3);
const [globs] = process.argv.slice(2);
const algo = {
  'jpg': '--mozjpeg',
  'png': '--oxipng',
  'webp': '--webp',
  'avif': '--avif',
  'jxl': '--jxl',
  'wp2': '--wp2',
};
const promises = [];
const errors = [];

await glob(globs, { nonull: false }, (er, imgs) =>
  imgs.map(async (img) => promises.push(limit(async () => {
      try {
        const dir = dirname(img);
        const ext = /\.([^\.]+)$/ig.exec(img)[1];

        await execa("squoosh-cli", [
          algo[ext],
          "auto",
          "--output-dir",
          dir,
          img
        ], {
          stderr: process.stdout,
          stdout: process.stdout
        });
      } catch (e) {
        errors.push(e.message || e);
      }
    })
  )));

const result = await Promise.all(promises);

if (errors) {
  console.error('Optimising images failed with errors:\n\n', errors.join('\n\n'));
  process.exit(1);
} else {
  console.log('Optimised all images, running additional commands now');
  process.exit(0);
}
