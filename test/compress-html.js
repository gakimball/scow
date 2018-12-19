const {expect} = require('chai');
const compressHtml = require('../lib/compress-html');

const input = `
<!doctype html>
<html>
  <head></head>
  <body></body>
</html>
`;

describe('compressHtml()', () => {
  it('compresses HTML', () => {
    const output = compressHtml(input, '', {
      compress: true
    });

    // The indentation should be removed from the output
    expect(output).to.contain('<!doctype html>\n<html>\n<head>');
  });

  it('does not compress HTML if the `compress` option is `false`', () => {
    const output = compressHtml(input, '', {
      compress: false
    });

    // The indentation should be removed from the output
    expect(output).to.contain('<!doctype html>\n<html>\n  <head>');
  });
});
