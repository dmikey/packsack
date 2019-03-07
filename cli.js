#! /usr/bin/env node
const bundle = require('./src/index')
const entryFileFromCWD = process.argv[2];
const entry = `${process.cwd()}/${entryFileFromCWD}`;
const output = process.argv[3];

if(output) {

} else {
  console.log(bundle(entry));
}