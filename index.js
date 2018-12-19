'use strict';

const fs = require('fs');
const path = require('path');
const pify = require('pify');
const globby = require('globby');
const cwd = require('prepend-cwd');
const mkdirp = require('mkdirp-promise');
const inlineCss = require('./lib/inline-css');
const removeUnusedCss = require('./lib/remove-unused-css');
const combineMediaQueries = require('./lib/combine-media-queries');
const compressHtml = require('./lib/compress-html');
const processImages = require('./lib/process-images');
const writeZipFile = require('./lib/write-zip-file');

const readFile = pify(fs.readFile);

module.exports = (input, output, opts = {}) => {
  input = cwd(input);
  output = cwd(output);

  /**
   * Create a ZIP bundle for an HTML email. The bundle will contain an inlined and compressed HTML file, and all images referenced in `<img>` tags.
   * @param {String} file - Path to HTML email.
   * @returns {Promise.<(String|String[])>} Promise containing path(s) to ZIP file(s) created.
   */
  const bundle = fileName => {
    const baseFileName = path.basename(fileName, path.extname(fileName));
    const context = {
      outputPath: path.join(output, `${baseFileName}.zip`)
    };

    return readFile(fileName)
      // Inline CSS into HTML
      .then(contents => inlineCss(contents.toString(), fileName, opts))
      // Remove unused CSS
      .then(html => removeUnusedCss(html, fileName, opts))
      // Merge media queries
      .then(html => combineMediaQueries(html, fileName, opts))
      // Compress HTML
      .then(html => compressHtml(html, fileName, opts))
      // Get all image paths referenced in in HTML and CSS
      .then(html => processImages(html, fileName, opts, context))
      // Create ZIP file with HTML + image
      .then(html => writeZipFile(html, fileName, opts, context))
      // Return the path of the ZIP file
      .then(() => context.outputPath)
      .catch(err => console.log(err));
  };

  // Find each input file and create a ZIP file for it
  return mkdirp(output)
    .then(() => globby(input))
    .then(paths => Promise.all(paths.map(bundle)));
};
