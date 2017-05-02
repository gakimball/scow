'use strict';

const fs = require('fs');
const path = require('path');
const pify = require('pify');
const globby = require('globby');
const inlineCss = require('inline-css');
const htmlMinifier = require('html-minifier').minify;
const getImgSrc = require('get-img-src');
const ZipFile = require('yazl').ZipFile;
const cwd = require('prepend-cwd');
const streamToPromise = require('stream-to-promise');
const mkdirp = require('mkdirp-promise');
const uniq = require('lodash.uniq');

const readFile = pify(fs.readFile);

module.exports = (input, output) => {
  input = cwd(input);
  output = cwd(output);

  /**
   * Create a ZIP bundle for an HTML email. The bundle will contain an inlined and compressed HTML file, and all images referenced in `<img>` tags.
   * @param {String} file - Path to HTML email.
   * @returns {Promise.<(String|String[])>} Promise containing path(s) to ZIP file(s) created.
   */
  const bundle = file => {
    const base = path.dirname(file);
    const fileName = path.basename(file, path.extname(file));
    const outputPath = path.join(output, `${fileName}.zip`);

    return readFile(file)
      // Inline CSS into HTML
      .then(contents => inlineCss(contents.toString(), {url: `file://${file}`}))
      // Compress HTML
      .then(html => htmlMinifier(html, {
        collapseWhitespace: true,
        minifyCSS: true
      }))
      // Get all image paths referenced in in HTML
      .then(html => [html, getImgSrc(html)])
      // Create ZIP file with HTML + image
      .then(res => {
        const html = res[0];
        const srcs = uniq(res[1]);

        // Create a ZIP file and point it to a write stream
        const zip = new ZipFile();
        const stream = fs.createWriteStream(outputPath);
        zip.outputStream.pipe(stream);

        // Add file for HTML email
        zip.addBuffer(Buffer.from(html), path.basename(file));

        // Add files for each image referenced in HTML
        srcs.forEach(src => {
          if (path.isAbsolute(src) || src.indexOf('..') === 0) {
            console.log(`Warning for file ${file}`);
            console.log('Scow can\'t bundle files with absolute paths or "../" segments.');
          } else {
            zip.addFile(path.resolve(base, src), src);
          }
        });

        // Write ZIP file to disk
        zip.end();

        // When the stream is done writing, the Promise will resolve
        return streamToPromise(stream);
      })
      .then(() => outputPath)
      .catch(err => console.log(err));
  };

  // Find each input file and create a ZIP file for it
  return mkdirp(output)
    .then(() => globby(input))
    .then(paths => Promise.all(paths.map(bundle)));
};
