const spud = require('spud');
;
module.exports = (entryData) => {

  // converts a kraken .properties file into a json export
  let ret = {};

  try {
    ret = spud.parse(entryData);
  } catch(e) {
    console.log(e);
  }
  // return json payload
  return `export default ${JSON.stringify(ret)}`;
}