const htmlMinifier = require('html-minifier').minify;

/**
 * Compress HTML.
 * @param {String} html - Input HTML.
 * @param {String} file - File path.
 * @param {Object} opts - User options.
 * @returns {String} Compressed HTML.
 */
module.exports = (html, file, opts) => {
  if (!opts.compress) {
    return html;
  }

  return htmlMinifier(html, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    html5: false,
    keepClosingSlash: true,
    minifyCSS: true,
    preserveLineBreaks: true
  });
};
