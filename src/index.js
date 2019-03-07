const fs = require('fs')
const path = require('path')
const babelParser = require("@babel/parser");
const babelTraverse = require("babel-traverse");
const { transformFromAst } = require("babel-core");

/**
 * 
 * @param {string} entryFileName
 * @param {string} forParent
 */
function getDependencies(entryFileName, forParent) {

  let filePath = entryFileName;

  if(filePath.indexOf('.js') < 0 && filePath.indexOf('./') < 0) {
      // node_modules
      // the start of our tree, entry usually goes here
      filePath = require.resolve(entryFileName, {
        paths:[path.join(process.cwd(), 'node_modules')]
      });
  } else {
    if(forParent) {
      // using path for parent to resolve path locations
      // of source files
      let parentPath;
      if(forParent.indexOf('.js') < 0 && forParent.indexOf('./') < 0) {
        parentPath = path.parse(require.resolve(forParent, {
          paths:[path.join(process.cwd(), 'node_modules')]
        }));
      } else {
        parentPath = path.parse(forParent);
      }

      if(filePath.indexOf('.js') < 0) {
        let checkPath = `${filePath}/index.js`;

        if (!fs.existsSync( path.resolve(`${parentPath.dir}/${checkPath}`))) {
          checkPath = `${filePath}.js`
        }
        filePath = checkPath;
      }
      filePath = path.resolve(`${parentPath.dir}/${filePath}`);
    }
  }

  let entryData;
  const dependencies = [];

  try {
    entryData = fs.readFileSync(filePath, "utf-8");

    let ast = babelParser.parse(entryData, {
      sourceType: "unambiguous",
      "plugins": [ "jsx" ] // apparently if we want to bring in our JSX transform we need to rewrite it here or fork the parser to get our own plugin - dunno how I feel about that
    });

    babelTraverse.default(ast, {
      ImportDeclaration: ({ node }) => {
        dependencies.push({
          file: node.source.value,
          fileLocation: resolveLocation(node.source.value, filePath),
          requestorPath: filePath
        });
      }
    });
  } catch (e) {
    // things either not existing, or not going through babel (loaders!? lol)

    if (e.message.indexOf('ENOENT') > -1) {
      console.log('file not found >>> ', filePath)
      console.log('requested in ', forParent);
    } else if(e.message.indexOf('Unexpected token') > -1) {
      console.log('no loader for file specified >>> ', filePath)
      console.log('requested in ', forParent);
    } else {
      console.log(e.message)
    }
  }
  return dependencies;
}

/**
 * Given two location strings, resolves the path string, or node_module
 * @param {string} toLocation
 * @param {string} fromLocation
 */
function resolveLocation(toLocation, fromLocation) {
  let resolvedPath;
  if(toLocation.indexOf('.js') < 0 && toLocation.indexOf('./') < 0) {
    // this is a node module resolve starting in the commands parent node_modules
    resolvedPath = require.resolve(toLocation, {
      paths:[path.join(process.cwd(), 'node_modules')]
    });
  } else {
    let fromPath = path.parse(fromLocation);
    resolvedPath = path.join(fromPath.dir, toLocation);
  }
  return resolvedPath;
}

/**
 * Builds dependency tree for a file entry path
 * @param {string} entry
 */
function buildDependencyTree(entry) {
  console.log('building dependency tree');
  const depTree = {
    filePath: entry,
    dependencies: []
  };
  depTree.dependencies = getDependencies(entry);
  parseTreeDeps(depTree.dependencies, entry);
  return depTree;
}

let resolvedModules = {};
function parseTreeDeps(deps, entry) {
  // track resolved modules for circular dep
  if(resolvedModules[entry]) {
    return
  }
  resolvedModules[entry] = true;

  // loop through and resolve deps
  for(let i = 0; i < deps.length; i++) {
    let subDeps = getDependencies(deps[i].file, entry);
    parseTreeDeps(subDeps, deps[i].fileLocation);
    deps[i].dependencies = subDeps;
  }
}

function transform(sourceBody) {
  let ast = babelParser.parse(sourceBody, {
    sourceType: "module"
  });

  let { code } = transformFromAst(ast, null, {
    presets: ["env"]  //applying the presets it means converting to es5 code
  });

  return code;
}

function pack(modules) {
  console.log('packing application');
  console.log(`${Object.keys(resolvedModules).length} total modules to pack.`)
  // pack all the modules into a specified output

  let entryFile = path.parse(modules.filePath).base;
  let entryData = fs.readFileSync(modules.filePath, "utf-8");
  let code = transform(entryData);

  let additionalModules = '';
  modules.dependencies.forEach(module => {
    let moduleData = fs.readFileSync(module.fileLocation, "utf-8");
    let moduleCode = transform(moduleData);

    additionalModules += `
      "${module.file}" : function (module, exports, require) {
        ${moduleCode}
      },
    `
  });

  let stringModules = `{
    "${entryFile}" : function (module, exports, require) {
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
    require('${entryFile}');
  })(${stringModules})`;
  return result;
}

module.exports = entry => {
  return pack(buildDependencyTree(entry));
}