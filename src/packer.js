const path = require('path');
const { transformFromAst } = require("babel-core");
const jsxPlugin = require('@syr/jsx')

function buildModuleString(modules) {
  let additionalModules = '';
  Object.keys(modules).forEach(key => {
    if(key != 'mainFileEntry') {
      let module = modules[key];
      let moduleCode = transform(module);
      additionalModules += `
        "${key}" : function (module, exports, require) {
          ${moduleCode}
        },
      `
    }
  });
  return additionalModules;
}

function transform(ast) {
  let returnBody;
  try {
    let { code } = transformFromAst(ast, null, {
      presets: [["env", { "loose": true, "browsers": [">0.25%", "not dead"] }]],
      plugins: [ [jsxPlugin.default, { "useVariables": true, "useGuid":true }] ]
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
  let code = transform(depTree.cache.mainFileEntry);
  let additionalModules = buildModuleString(depTree.cache);

  let stringModules = `{
    "${mainPath.base}" : function (module, exports, require) {
      ${code}
    },
    ${additionalModules}
  }`;

  var result = `(function (modules) {
    function require(name) {
      const fn = modules[name];
      const module={},exports={};
      fn(module, exports,(name)=>require(name));
      return exports;
    }
    require('${mainPath.base}');
  })(${stringModules})`;
  return result;
}