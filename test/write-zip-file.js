const fs = require('fs');
const path = require('path');
const {expect} = require('chai');
const tempy = require('tempy');
const unzipper = require('unzipper');
const writeZipFile = require('../lib/write-zip-file');

const inputHtml = `
<!doctype html>
<html>
  <body>
    <img src="kitty-1.jpg">
    <img src="kitty-2.jpg">
  </body>
</html>
`;

describe('writeZipFile', () => {
  const context = {};

  before(() => {
    const inputPath = path.join(__dirname, 'fixtures/index.html');
    context.outputPath = tempy.file({
      extension: 'zip'
    });
    context.imageSrcs = ['kitty-1.jpg', 'kitty-2.jpg'];

    return writeZipFile(inputHtml, inputPath, {}, context);
  });

  it('writes a ZIP file', done => {
    fs.access(context.outputPath, (fs.constants || fs).F_OK, err => {
      expect(err).to.equal(null);
      done();
    });
  });

  it('bundles an HTML file and images into the ZIP archive', () => {
    return unzipper.Open.file(context.outputPath).then(dir => {
      const files = dir.files.map(file => file.path);

      expect(files).to.include.members(['index.html', 'kitty-1.jpg', 'kitty-2.jpg']);
    });
  });
});
