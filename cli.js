#!/usr/bin/env node

/* eslint-disable no-negated-condition */

'use strict';

const meow = require('meow');
const chalk = require('chalk');
const scow = require('.');

const cli = meow(`
  Usage
    $ scow <input> <output>

  Examples
    $ scow emails/*.html dist
`);

// Must provide input and output
if (cli.input.length < 2) {
  cli.showHelp(1);
}

scow(cli.input[0], cli.input[1]).then(paths => {
  console.log(chalk.green(`${paths.length} bundle${paths.length !== 1 ? 's' : 's'} created.`));
  paths.map(path => console.log(chalk.gray(`  ${path}`)));
}).catch(err => {
  console.log(err);
});
