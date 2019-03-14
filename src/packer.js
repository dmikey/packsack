const path = require('path');
const { transformFromAst } = require("babel-core");
const babelTraverse = require("babel-traverse");
const jsxPlugin = require('@syr/jsx');
const t = require('@babel/types');


/**
 * Parses a gathered dependency tree into a string based
 * set of modules for output
 * @param {object} depTree
 * @param {string} entryPath
 */
function buildModuleMap(depTree, entryPath) {
  let pathMap = depTree.pathMap;
  let pathCache = depTree.pathCache;
  let paths = Object.keys(pathCache);
  let requireMap = {};
  let modules = [];

  for(let i = 0; i < paths.length; i++) {
    let modulePath = paths[i];
    pathCache[modulePath] = (modules.push(pathCache[modulePath].ast) - 1)
  }


  let requirePaths = Object.keys(pathMap);
  for(let i = 0; i < requirePaths.length; i++) {
    let requirePath = requirePaths[i];
    let absolutePath = pathMap[requirePaths[i]];
    let moduleIndex = pathCache[absolutePath];
    let mapPath = i < 1 ?entryPath:requirePath;
    requireMap[mapPath] = moduleIndex;
  }


  let moduleArrayString = '[';
  for(let i = 0; i < modules.length; i++) {
    // traverse the ast, looking for imports to gather again

    // replace the import path, with the number index of the script
    // location in the modules array. this lets us reduce modules
    // shipped, and anonmyize away from environment paths
    //
    // babelTraverse.default(modules[i], {
    //   enter: function(path) {
    //     if (path.node.type === "ImportDeclaration"){
    //       let value = path.node.source.value;
    //       path.node.source = t.NumericLiteral(requireMap[value]);
    //     }
    //   }
    // });
    modules[i] = transform(modules[i]);
    moduleArrayString += `function (module, exports, require) {
      ${modules[i]}
    },`
  }
  moduleArrayString += ']';

  return {
    requireMap: JSON.stringify(requireMap),
    moduleArray: moduleArrayString
  }
}

function transform(ast) {
  let returnBody;
  try {
    let { code } = transformFromAst(ast, null, {
      presets: [["env", { "loose": true, "browsers": [">0.25%", "not dead"] }]],
      plugins: [ [jsxPlugin.default, { "useVariables": true, "useGuid":true }] ],
      // minified: true,
      // comments: false
    });
    returnBody = code;
  } catch (e) {
    console.log(e)
  }
  return returnBody;
}

module.exports = (depTree) => {
  console.log('packing modules');
  // pack all the modules into a specified output
  let mainPath = path.parse(depTree.filePath);
  let addModules = buildModuleMap(depTree, mainPath.base)
  let result = `(function (modules) {
    const requireMap = ${addModules.requireMap};
    const moduleCache = {};
    function require(id) {
      if(moduleCache[id]) {
        return moduleCache[id];
      }
      const fn = modules[requireMap[id]] || modules[0];// modules[id];
      const module={},exports={};
      fn(module, exports,(id)=>require(id));
      moduleCache[id] = exports
      return exports;
    }
    require(0);
   })(${addModules.moduleArray})`;
  return result;
}