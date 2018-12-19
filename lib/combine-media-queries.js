const cheerio = require('cheerio');
const mqPacker = require('css-mqpacker');

/**
 * Combine identical media queries in the CSS of the <style> tags of an HTML string.
 * @param {String} html - Input HTML.
 * @param {String} file - Path to file.
 * @param {String} opts - User options.
 * @returns {String} Modified HTML.
 */
module.exports = (html, file, opts) => {
  if (!opts.compress) {
    return html;
  }

  const $ = cheerio.load(html);

  $('style').each((i, elem) => {
    const css = elem.children[0].data;
    const newCss = mqPacker.pack(css).css;
    elem.children[0].data = newCss;
  });

  return $.html();
};
