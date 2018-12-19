/* eslint-env mocha */
/* eslint-disable new-cap, max-nested-callbacks */

const fs = require('fs');
const path = require('path');
const {expect} = require('chai');
const tempy = require('tempy');
const unzipper = require('unzipper');
const scow = require('..');

describe('scow()', () => {
  let outputDir;
  let zipPath;
  let returnValue;

  before(async () => {
    outputDir = tempy.directory();
    zipPath = path.join(outputDir, 'index.zip');
    returnValue = await scow('test/fixtures/*.html', outputDir);
  });

  it('returns a list of files created', () => {
    expect(returnValue).to.eql([zipPath]);
  });

  it('names the ZIP file the same as the original HTML file', done => {
    fs.access(zipPath, (fs.constants || fs).F_OK, err => {
      expect(err).to.equal(null);
      done();
    });
  });

  it('bundles referenced images', async () => {
    const dir = await unzipper.Open.file(zipPath);
    const files = dir.files.map(file => file.path);

    expect(files).to.include.members(['kitty-1.jpg', 'kitty-2.jpg', 'kitty-3.jpg']);
  });
});
