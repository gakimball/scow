const path = require('path');
const juice = require('juice');
const pify = require('pify');

const juiceResources = pify(juice.juiceResources);

/**
 * Inline CSS from external CSS and inline `<style>` tags.
 * @param {String} html - Input HTML.
 * @param {Object} file - Original file.
 * @returns {String} HTML with CSS inlined.
 */
module.exports = (html, file) => juiceResources(html.toString(), {
  webResources: {
    images: false,
    svgs: false,
    scripts: false,
    relativeTo: path.dirname(file)
  }
});
