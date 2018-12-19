const {expect} = require('chai');
const combineStyleTags = require('../lib/combine-style-tags');

const input = `
<!doctype>
<html>
  <head>
    <style>
      .one {
        color: red;
      }
    </style>
    <style>
      .two {
        color: green;
      }
    </style>
  </head>
  <body></body>
</html>
`;

describe('combineStyleTags()', () => {
  it.only('merges CSS into one style tag', () => {
    const output = combineStyleTags(input, '', {
      compress: true
    });
    const styleTags = output.match(/<style>/);

    expect(output).to.contain('.one');
    expect(output).to.contain('.two');
    expect(styleTags).to.have.lengthOf(1);

    console.log(output);
  });
});
