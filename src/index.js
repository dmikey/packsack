const gatherer = require('./gatherer');
const packer = require('./packer');
const pipeliner = require('./pipeliner');

module.exports = (entry) => {
  // return a set of bundled code
  return pipeliner([
    gatherer, // accepts string, returns depTree
    packer // takes depTree, returns string of bundled code
  ], entry);
}