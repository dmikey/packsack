#! /usr/bin/env node
const bundle = require('./src/index')
const entryFileFromCWD = process.argv[2];
const entry = `${process.cwd()}/${entryFileFromCWD}`;
const output = process.argv[3];
const fs = require('fs');

if(output) {
  fs.writeFile(output, bundle(entry), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
} else {
  console.log(bundle(entry));
}