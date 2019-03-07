const babelTraverse = require("babel-traverse");

module.exports = (depTree) => {
  let totalModules =  Object.keys(depTree.cache);
  for(let i = 0; i < totalModules.length; i++) {
    console.log(`transforming ${i} of ${totalModules.length}`)
    babelTraverse.default( depTree.cache[totalModules[i]], {
      ImportDeclaration: ({ node }) => {
        
      }
    });
  }
  return depTree
}