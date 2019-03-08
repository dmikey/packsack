#! /usr/bin/env node
const bundle = require('./src/index')
const entryFileFromCWD = process.argv[2];
const entry = `${process.cwd()}/${entryFileFromCWD}`;
const output = process.argv[3];
const fs = require('fs');
const server = require('./server');

if(output) {
  if(output.indexOf('--') > -1) {
    server.start(bundle(entry));
  } else {
    fs.writeFile(output, bundle(entry), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
    });
  }

} else {
  console.log(bundle(entry));
}