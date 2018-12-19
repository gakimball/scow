const path = require('path');
const {expect} = require('chai');
const inlineCss = require('../lib/inline-css');

const input = `
<!doctype html>
<html>
  <head>
    <style>
      .one {
        color: red;
      }
    </style>
    <style data-embed>
      .three {
        color: blue;
      }
    </style>
    <link rel="stylesheet" href="inline-css.css" />
  </head>
  <body>
    <div class="one"></div>
    <div class="two"></div>
    <div class="three"></div>
  </body>
</html>
`;

describe('inlineCss()', () => {
  const filePath = path.join(__dirname, 'fixtures/index.html');
  let output;

  before(() => {
    return inlineCss(input, filePath).then(res => {
      output = res;
    });
  });

  it('inlines CSS from a <style> tag into HTML', () => {
    expect(output).to.contain('<div class="one" style="color: red;"></div>');
    expect(output).to.not.contain('.one');
  });

  it('inlines CSS from a <link> tag into HTML', () => {
    expect(output).to.contain('<div class="two" style="color: green;"></div>');
  });

  it('does not inline CSS from a <style> tag with the data-embed attribute', () => {
    expect(output).to.contain('<div class="three"></div>');
    expect(output).to.contain('.three');
  });
});
