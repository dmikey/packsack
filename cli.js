#! /usr/bin/env node

const bundle = require('./src/index')
const entry = process.cwd() + '/src/index.js'

bundle(entry);