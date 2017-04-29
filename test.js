/* eslint-env mocha */
/* eslint-disable new-cap */

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

  before(() => {
    return scow('fixtures/*.html', outputDir);
  });

  it('names the ZIP file the same as the original HTML file', done => {
    fs.exists(zipPath, err => {
      expect(err).to.equal(true);
      done();
    });
  });

  it('inlines CSS into HTML', done => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.ParseOne(/index.html/))
      .on('entry', entry => {
        entry.buffer().then(contents => {
          expect(contents.toString()).to.contain('style="height:100vh');
          done();
        }).catch(done);
      })
      .on('error', done);
  });

  it('compresses the HTML', done => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.ParseOne(/index.html/))
      .on('entry', entry => {
        entry.buffer().then(contents => {
          expect(contents.toString()).to.contain('<!doctype html><html><head>');
          done();
        }).catch(done);
      })
      .on('error', done);
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
});
