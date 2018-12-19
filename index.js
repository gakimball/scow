'use strict';

const fs = require('fs');
const path = require('path');
const pify = require('pify');
const globby = require('globby');
const cwd = require('prepend-cwd');
const mkdirp = require('mkdirp-promise');
const inlineCss = require('./lib/inline-css');
const removeUnusedCss = require('./lib/remove-unused-css');
const combineStyleTags = require('./lib/combine-style-tags');
const combineMediaQueries = require('./lib/combine-media-queries');
const compressHtml = require('./lib/compress-html');
const processImages = require('./lib/process-images');
const writeZipFile = require('./lib/write-zip-file');

const readFile = pify(fs.readFile);

/**
 * Create ZIP bundles for one or more HTML email. Each bundle will contain an inlined and compressed HTML file, and all images referenced in `<img>` tags.
 * @param {(String|String[])} input - Glob pattern of HTML files.
 * @param {String} output - Folder to write to. The folder will be created if it doesn't exist.
 * @param {Object} [opts] - Bundle options.
 * @param {Boolean} [opts.compress] - Compress HTML and consolidate media queries.
 * @returns {Promise.<String[]>} Promise containing paths to ZIP bundles created.
 */
module.exports = async (input, output, opts = {}) => {
  /**
   * Create a ZIP bundle for a single file.
   * @param {String} fileName - Path to HTML email.
   * @returns {Promise.<String>} Promise containing path to ZIP file created.
   */
  const bundle = fileName => {
    const baseFileName = path.basename(fileName, path.extname(fileName));
    const context = {
      outputPath: path.join(output, `${baseFileName}.zip`)
    };

    /* eslint-disable promise/prefer-await-to-then */
    return readFile(fileName)
      // Inline CSS into HTML
      .then(contents => inlineCss(contents.toString(), fileName, opts))
      // Remove unused CSS
      .then(html => removeUnusedCss(html, fileName, opts))
      // Merge <style> elements
      .then(html => combineStyleTags(html, fileName, opts))
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
      .catch(error => console.log(error));
    /* eslint-enable promise/prefer-await-to-then */
  };

  await mkdirp(cwd(output));
  const paths = await globby(cwd(input));

  return Promise.all(paths.map(bundle));
};
