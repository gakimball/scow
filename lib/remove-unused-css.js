const styleBroom = require('style-broom');

/**
 * Remove unused CSS from `<style>` elements in HTML.
 * @param {String} html - Input HTML.
 * @returns {String} HTML with CSS pruned.
 */
module.exports = html => styleBroom(html);
