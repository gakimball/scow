const {expect} = require('chai');
const combineMediaQueries = require('../lib/combine-media-queries');

const input = `
<!doctype html>
<html>
  <head>
    <style>
      @media (min-width: 100px) {
        .one {
          color: red;
        }
      }

      @media (min-width: 100px) {
        .two {
          color: green;
        }
      }

      @media (min-width: 200px) {
        .three {
          color: blue;
        }
      }
    </style>
  </head>
  <body></body>
</html>
`;

describe('combineMediaQueries()', () => {
  it('combines CSS from identical media queries into one block', () => {
    const output = combineMediaQueries(input, '', {
      compress: true
    });
    const mediaQueries = output.match(/@media \(min-width: \d{3}px\)/g);

    expect(mediaQueries).to.eql([
      '@media (min-width: 100px)',
      '@media (min-width: 200px)'
    ]);
  });

  it('does not combine media queries if the `compress` option is `false`', () => {
    const output = combineMediaQueries(input, '', {
      compress: false
    });
    const mediaQueries = output.match(/@media \(min-width: \d{3}px\)/g);

    expect(mediaQueries).to.eql([
      '@media (min-width: 100px)',
      '@media (min-width: 100px)',
      '@media (min-width: 200px)'
    ]);
  });
});
