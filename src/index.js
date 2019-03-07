const gatherer = require('./gatherer');
const transformer = require('./transformer');
const packer = require('./packer');
const pipeliner = require('./pipeliner');

module.exports = (entry) => {
  // return a set of bundled code
  return pipeliner([
    gatherer,
    transformer,
    packer
  ], entry);
}