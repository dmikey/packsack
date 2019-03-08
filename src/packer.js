const path = require('path');
const { transformFromAst } = require("babel-core");
const jsxPlugin = require('@syr/jsx');

function buildModuleMap(depTree, entryPath) {
  let pathMap = depTree.pathMap;
  let pathCache = depTree.pathCache;
  let paths = Object.keys(pathCache);
  let requireMap = {};
  let modules = [];

  for(let i = 0; i < paths.length; i++) {
    let modulePath = paths[i];
    pathCache[modulePath] = (modules.push(transform(pathCache[modulePath].ast)) - 1)
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
      // minified: true
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

  var result = `(function (modules) {
    const moduleCache = {};
    const requireMap = ${addModules.requireMap};
    function require(name) {
      if(moduleCache[name]) {
        return moduleCache[name];
      }
      const fnlocation = requireMap[name];
      const fn = modules[fnlocation];
      const module={},exports={};
      fn(module, exports,(name)=>require(name));
      moduleCache[name] = exports
      return exports;
    }
    require('${mainPath.base}');
   })(${addModules.moduleArray})`;
  return result;
}