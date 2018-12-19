const getImgSrc = require('get-img-src');
const cheerio = require('cheerio');
const cssUrlParser = require('css-url-parser');
const uniq = require('lodash.uniq');

/**
 * Find all images referenced in an HTML file and add them to a shared context object.
 * @param {String} html - Input HTML.
 * @param {String} file - File path.
 * @param {Object} opts - User options.
 * @param {Object} context - Internal context object.
 * @returns {String} Unmodified HTML.
 */
module.exports = (html, file, opts, context) => {
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

  // Store the array here so later steps in the process can access it
  context.imageSrcs = uniq(imageSrcs);

  return html;
};
