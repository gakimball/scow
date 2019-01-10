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
    const zipPath = path.join(outputDir, 'index.zip');

    execa.sync(path.join(__dirname, '../bin/scow.js'), ['test/fixtures/*.html', outputDir]);

    fs.access(zipPath, (fs.constants || fs).F_OK, err => {
      expect(err).to.equal(null);
      done();
    });
  });

  it('allows HTML to be compressed', done => {
    const outputDir = tempy.directory();
    const zipPath = path.join(outputDir, 'index.zip');

    execa.sync(path.join(__dirname, '../bin/scow.js'), ['test/fixtures/*.html', outputDir, '--compress']);

    fs.createReadStream(zipPath)
      .pipe(unzipper.ParseOne(/index.html/))
      .on('entry', async entry => {
        const contents = await entry.buffer();

        expect(contents.toString()).to.contain('<!doctype html>\n<html>\n<head>');
        done();
      })
      .on('error', done);
  });
});
