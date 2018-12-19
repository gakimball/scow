const {expect} = require('chai');
const removeUnusedCss = require('../lib/remove-unused-css');

const input = `
<!doctype html>
<html>
  <head>
    <style>
      .one {
        color: red;
      }

      .two {
        color: green;
      }
    </style>
  </head>
  <body>
    <div class="one"></div>
  </body>
</html>
`;

describe('removeUnusedCss()', () => {
  let output;

  before(() => {
    output = removeUnusedCss(input);
  });

  it('removes unused CSS classes from <style> elements', () => {
    expect(output).to.not.contain('.two');
  });

  it('preserves CSS classes used in the HTML', () => {
    expect(output).to.contain('.one');
  });
});
