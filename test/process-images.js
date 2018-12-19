const {expect} = require('chai');
const processImages = require('../lib/process-images');

describe('processImages()', () => {
  it('returns HTML as-is', () => {
    const input = '<img src="image.jpg">';
    const output = processImages(input, '', {}, {});

    expect(output).to.equal(input);
  });

  it('finds images referenced in <img src>', () => {
    const input = '<img src="image.jpg">';
    const context = {};
    processImages(input, '', {}, context);

    expect(context).to.have.property('imageSrcs').eql(['image.jpg']);
  });

  it('finds images referenced in <style>', () => {
    const input = '<style>.one { background-color: url(\'image.jpg\') }</style>';
    const context = {};
    processImages(input, '', {}, context);

    expect(context).to.have.property('imageSrcs').eql(['image.jpg']);
  });

  it('finds images referenced in <style>', () => {
    const input = '<div style="background-color: url(\'image.jpg\')"></div>';
    const context = {};
    processImages(input, '', {}, context);

    expect(context).to.have.property('imageSrcs').eql(['image.jpg']);
  });

  it('removes duplicate files', () => {
    const input = `
      <img src="one.jpg">
      <img src="one.jpg">
      <img src="two.jpg">
    `;
    const context = {};
    processImages(input, '', {}, context);

    expect(context).to.have.property('imageSrcs').eql(['one.jpg', 'two.jpg']);
  });
});
