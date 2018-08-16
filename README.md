# scow

> HTML email inliner and bundler

[![Travis](https://badgen.now.sh/travis/gakimball/scow)](https://travis-ci.org/gakimball/scow) [![npm](https://badgen.now.sh/npm/v/scow)](https://www.npmjs.com/package/scow)
![Anchors Aweigh](https://badgen.now.sh/badge/anchors/aweigh/cyan)

When uploading an HTML email to an ESP like Mailchimp or Campaign Monitor, typically you'll be uploading a single HTML file with inlined CSS, and all the assets that email references.

Point Scow at an HTML email (or a set of them), and it will:

- Inline any CSS in `<link>` or `<style>` tags into the HTML
- Preserve @ rules like media queries in `<style>` tags
- Remove unused CSS from the `<style>` tags
- If compression is enabled:
  - Compress the HTML output, but preserve whitespace
  - Compress the CSS within `<style>` tags and `style` attributes
  - Merge identical media queries within `<style>` tags
- Bundle the email and all assets linked to in `<img>` tags into one ZIP file

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
- **options** (Object): output options.
  - **compress** (Boolean): compress HTML, and CSS within `<style>` elements. Defaults to `false`.

Returns a Promise that resolves with the path or paths to the created ZIP files.

## CLI

Install Scow globally, or reference it in an npm script, to use the CLI.

```
  Usage
    $ scow <input> <output>

  Options
    -c, --compress  Compress HTML

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
