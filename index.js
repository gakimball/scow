'use strict';

const fs = require('fs');
const path = require('path');
const pify = require('pify');
const globby = require('globby');
const juice = require('juice');
const htmlMinifier = require('html-minifier').minify;
const getImgSrc = require('get-img-src');
const {ZipFile} = require('yazl');
const cwd = require('prepend-cwd');
const streamToPromise = require('stream-to-promise');
const mkdirp = require('mkdirp-promise');
const uniq = require('lodash.uniq');
const styleBroom = require('style-broom');
const cheerio = require('cheerio');
const mqPacker = require('css-mqpacker');
const cssUrlParser = require('css-url-parser');

const readFile = pify(fs.readFile);
const juiceResources = pify(juice.juiceResources);

module.exports = (input, output, opts) => {
  input = cwd(input);
  output = cwd(output);
  opts = opts || {};

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
      .then(contents => juiceResources(contents.toString(), {
        webResources: {
          images: false,
          svgs: false,
          scripts: false,
          relativeTo: path.dirname(file)
        }
      }))
      // Remove unused CSS
      .then(html => styleBroom(html))
      // Merge media queries
      .then(html => {
        if (opts.compress) {
          return combineMediaQueries(html);
        }

        return html;
      })
      // Compress HTML
      .then(html => {
        if (opts.compress) {
          return htmlMinifier(html, {
            collapseWhitespace: true,
            conservativeCollapse: true,
            html5: false,
            keepClosingSlash: true,
            minifyCSS: true,
            preserveLineBreaks: true
          });
        }

        return html;
      })
      // Get all image paths referenced in in HTML and CSS
      .then(html => {
        // This fetches every <img> with a src attribute
        const imageSrcs = getImgSrc(html);

        // This fetches every url() in a <style>
        const $ = cheerio.load(html);
        $('style').each((i, elem) => {
          const css = elem.children[0].data;
          imageSrcs.push(...cssUrlParser(css));
        });

        // This fetches every url() in an inline style
        $('[style]').each((i, elem) => {
          const css = $(elem).attr('style');
          imageSrcs.push(...cssUrlParser(css));
        });

        return [html, imageSrcs];
      })
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
          const filePath = path.resolve(base, src);

          if (path.isAbsolute(src) || src.startsWith('..')) {
            console.log(`Warning for file ${file}`);
            console.log('Scow can\'t bundle files with absolute paths or "../" segments.');
          } else {
            // Skip files that don't exist
            try {
              fs.accessSync(filePath, (fs.constants || fs).F_OK);
              zip.addFile(filePath, src);
            } catch (e) {}
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

/**
 * Combine identical media queries in the CSS of the <style> tags of an HTML string.
 * @param {String} html - Input HTML.
 * @returns {String} Modified HTML.
 */
function combineMediaQueries(html) {
  const $ = cheerio.load(html);

  $('style').each((i, elem) => {
    const css = elem.children[0].data;
    const newCss = mqPacker.pack(css).css;
    elem.children[0].data = newCss;
  });

  return $.html();
}
