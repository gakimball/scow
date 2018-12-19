/* eslint-env mocha */
/* eslint-disable new-cap, max-nested-callbacks */

const fs = require('fs');
const path = require('path');
const {expect} = require('chai');
const tempy = require('tempy');
const unzipper = require('unzipper');
const scow = require('..');

describe('scow()', () => {
  const outputDir = tempy.directory();
  const zipPath = path.join(outputDir, 'index.zip');
  let outputHtml;
  let outputHtmlCompressed;

  const createTestFile = opts => {
    const output = opts.compress ? tempy.directory() : outputDir;

    return scow('test/fixtures/*.html', output, opts).then(() => new Promise((resolve, reject) => {
      fs.createReadStream(path.join(output, 'index.zip'))
        .pipe(unzipper.ParseOne(/index.html/))
        .on('entry', entry => {
          entry.buffer().then(contents => {
            resolve(contents.toString());
          }).catch(reject);
        })
        .on('error', reject);
    }));
  };

  before(() => {
    return Promise.all([
      createTestFile({}),
      createTestFile({compress: true})
    ]).then(res => {
      [outputHtml, outputHtmlCompressed] = res;
    });
  });

  it('names the ZIP file the same as the original HTML file', done => {
    fs.access(zipPath, (fs.constants || fs).F_OK, err => {
      expect(err).to.equal(null);
      done();
    });
  });

  it('inlines CSS into HTML', () => {
    expect(outputHtml).to.contain('style="width: 100vw');
  });

  it('holds media query CSS in a <style> tag', () => {
    expect(outputHtml).to.contain('@media screen');
  });

  it('removes unused CSS from <style> tag', () => {
    expect(outputHtml).to.not.contain('.unused');
  });

  it('allows HTML to be compressed', () => {
    expect(outputHtmlCompressed).to.contain('<!doctype html>\n<html>\n<head>');
  });

  it('allows media queries to be meregd', () => {
    expect(outputHtmlCompressed.match(/@media/g)).to.have.a.lengthOf(1);
  });

  it('bundles referenced images', () => {
    return unzipper.Open.file(zipPath).then(dir => {
      const files = dir.files.map(file => file.path);

      expect(files).to.include.members(['kitty-1.jpg', 'kitty-2.jpg', 'kitty-3.jpg']);
    });
  });
});
