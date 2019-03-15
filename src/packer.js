const path = require('path');
const {transformFromAst} = require("babel-core");
const babelTraverse = require("babel-traverse");
const jsxPlugin = require('@syr/jsx');
const t = require('@babel/types');
let opts = {
  minify: false,
  comments: true,
  presets: [
    ["env", {
      "loose": true,
      "browsers": [">0.25%", "not dead"]
    }]
  ],
  plugins: [
    [jsxPlugin.default, {
      "useVariables": true,
      "useGuid": true
    }]
  ]
};

let pathCache = {};

function transformModule(ast) {
  let returnBody;
  try {
    let babeled = transformFromAst(ast, null, {
      presets: opts.presets,
      plugins: opts.plugins,
      minified: true,
      comments: false
    });
    returnBody = babeled.code;
  } catch (e) {
    console.log(e)
  }
  return returnBody;
}

function transformModules(depTree) {
  let modules = [];
  for(let i = 0; i < depTree.cache.length; i++) {

    babelTraverse.default(depTree.cache[i], {
      ImportDeclaration: ({
        node
      }) => {
        let filePath = node.source.value;
        let moduleId = pathCache[filePath].moduleId;
        node.source = t.numericLiteral(moduleId);
      }
    });

    modules.push(`function (module, exports, require) {
      ${transformModule(depTree.cache[i])}
    }`);
  }
  return modules;
}

module.exports = (depTree, _opts) => {
  // console.log('packing modules');
  // pack all the modules into a specified output
  if(_opts) opts = _opts;
  pathCache = depTree.pathCache;
  let modules = transformModules(depTree);
  let result = `(function (modules) {
    const moduleCache = {};
    function require(id) {
      if(moduleCache[id]) {
        return moduleCache[id];
      }
      const fn = modules[id];
      const module={},exports={};
      fn(module, exports,(id)=>require(id));
      moduleCache[id] = exports
      return exports;
    }
    require(0);
   })([${modules.join(',')}])`;
  return result;
}