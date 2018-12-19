const cheerio = require('cheerio');

module.exports = (html, file, opts) => {
  if (!opts.compress) {
    return html;
  }

  const $ = cheerio.load(html);
  const firstStyleTag = $('style')[0].children[0];

  $('style').slice(1).each((i, elem) => {
    const css = elem.children[0].data;
    firstStyleTag.data += `${css}`;
  }).remove();

  return $.html();
};
