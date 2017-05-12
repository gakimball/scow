/* eslint-env mocha */
/* eslint-disable new-cap, max-nested-callbacks */

'use strict';

const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const tempy = require('tempy');
const unzipper = require('unzipper');
const execa = require('execa');
const scow = require('.');

describe('scow()', () => {
  const outputDir = tempy.directory();
  const zipPath = path.join(outputDir, 'index.zip');
  let outputHtml;
  let outputHtmlCompressed;

  const createTestFile = opts => {
    const output = opts.compress ? tempy.directory() : outputDir;

    return scow('fixtures/*.html', output, opts).then(() => new Promise((resolve, reject) => {
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
      outputHtml = res[0];
      outputHtmlCompressed = res[1];
    });
  });

  it('names the ZIP file the same as the original HTML file', done => {
    fs.exists(zipPath, err => {
      expect(err).to.equal(true);
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

  it('bundles referenced images', done => {
    let found = false;

    fs.createReadStream(zipPath)
      .pipe(unzipper.ParseOne(/kitty.jpg/))
      .on('entry', () => {
        found = true;
      })
      .on('finish', () => {
        expect(found).to.equal(true);
        done();
      })
      .on('error', done);
  });
});

describe('scow CLI', () => {
  it('creates a ZIP file', done => {
    const outputDir = tempy.directory();
    execa(path.join(__dirname, 'cli.js'), ['fixtures/*.html', outputDir])
      .then(() => {
        const zipPath = path.join(outputDir, 'index.zip');

        fs.exists(zipPath, err => {
          expect(err).to.equal(true);
          done();
        });
      })
      .catch(done);
  });

  it('allows HTML to be compressed', done => {
    const outputDir = tempy.directory();
    const zipPath = path.join(outputDir, 'index.zip');
    const test = () => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.ParseOne(/index.html/))
        .on('entry', entry => {
          entry.buffer().then(contents => {
            expect(contents.toString()).to.contain('<!doctype html>\n<html>\n<head>');
            done();
          }).catch(done);
        })
        .on('error', done);
    };

    execa(path.join(__dirname, 'cli.js'), ['fixtures/*.html', outputDir, '--compress'])
      .then(test)
      .catch(done);
  });
});
