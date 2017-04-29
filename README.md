# scow

> HTML email inliner and bundler

[![Travis](https://img.shields.io/travis/gakimball/scow.svg?maxAge=2592000)](https://travis-ci.org/gakimball/scow) [![npm](https://img.shields.io/npm/v/scow.svg?maxAge=2592000)](https://www.npmjs.com/package/scow)

When uploading an HTML email to an ESP like Mailchimp or Campaign Monitor, typically you'll be uploading a single HTML file with inlined CSS, and all the assets that email references.

Point Scow at an HTML email, and it will inline the CSS, compress the HTML, identify images the page uses, and bundle all of it into a tidy ZIP file. Your emails will be seaworthy in no time.

## Installation

```bash
npm install scow
```

## Usage

```js
const scow = require('scow');

scow('newsletter.html', 'output').then(path => {
  // => output/newsletter.zip
});
```

## API

### scow(input, output)

Bundle one or more HTML emails into an equal number of ZIP files.

- **input** (String or Array of Strings): HTML files(s) to bundle. Can be a path to one file, or a glob pattern matching multiple files. One ZIP bundle is made for each input file.
- **output** (String): path to folder to output ZIP files to.

Returns a Promise that resolves with the path or paths to the created ZIP files.

## CLI

Install Scow globally, or reference it in an npm script, to use the CLI.

```
  Usage
    $ scow <input> <output>

  Examples
    $ scow emails/*.html dist
```

## Local Development

```bash
git clone https://github.com/gakimball/scow
cd scow
npm install
npm test
```

## License

MIT &copy; [Geoff Kimball](http://geoffkimball.com)
