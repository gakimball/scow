/* eslint-env mocha */
/* eslint-disable new-cap */

'use strict';

const fs = require('fs');
const path = require('path');
const {expect} = require('chai');
const tempy = require('tempy');
const unzipper = require('unzipper');
const execa = require('execa');

describe('scow CLI', () => {
  it('creates a ZIP file', done => {
    const outputDir = tempy.directory();
    execa(path.join(__dirname, '../cli.js'), ['test/fixtures/*.html', outputDir])
      .then(() => {
        const zipPath = path.join(outputDir, 'index.zip');

        fs.access(zipPath, (fs.constants || fs).F_OK, err => {
          expect(err).to.equal(null);
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

    execa(path.join(__dirname, '../cli.js'), ['test/fixtures/*.html', outputDir, '--compress'])
      .then(test)
      .catch(done);
  });
});
